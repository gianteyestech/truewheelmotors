// Complete Official 2026 Irish Revenue VRT & Customs Engine
// Implements Category A & B bands, progressive NOx levy, BEV relief, WLTP/NEDC conversion, and EPA 0% duty

export const BANDS_A = [
  { max: 50, rate: 0.07, min: 140 },
  { max: 80, rate: 0.09, min: 180 },
  { max: 85, rate: 0.0975, min: 195 },
  { max: 90, rate: 0.105, min: 210 },
  { max: 95, rate: 0.1125, min: 225 },
  { max: 100, rate: 0.12, min: 240 },
  { max: 105, rate: 0.1275, min: 255 },
  { max: 110, rate: 0.135, min: 270 },
  { max: 115, rate: 0.1525, min: 305 },
  { max: 120, rate: 0.16, min: 320 },
  { max: 125, rate: 0.1675, min: 335 },
  { max: 130, rate: 0.175, min: 350 },
  { max: 135, rate: 0.1925, min: 385 },
  { max: 140, rate: 0.20, min: 400 },
  { max: 145, rate: 0.215, min: 430 },
  { max: 150, rate: 0.25, min: 500 },
  { max: 155, rate: 0.275, min: 550 },
  { max: 170, rate: 0.30, min: 600 },
  { max: 190, rate: 0.35, min: 700 },
  { max: Infinity, rate: 0.41, min: 820 }
];

export const BANDS_B = [
  { max: 120, rate: 0.08, min: 160 },
  { max: Infinity, rate: 0.133, min: 266 }
];

export function eur(n) {
  return Math.round(n).toLocaleString("en-IE");
}

export function pct(r) {
  return (r * 100).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

function findBand(bands, co2) {
  for (const b of bands) {
    if (co2 <= b.max) return b;
  }
  return bands[bands.length - 1];
}

function nedcA(co2, diesel) {
  return diesel ? co2 * 1.1405 + 12.858 : co2 * 0.9227 + 34.554;
}

function nedcB(co2, diesel) {
  return diesel ? co2 * 0.9498 + 41.539 : co2 * 1.0105 + 18.335;
}

function noxLevy(mg) {
  let c = 0;
  let r = mg;
  const t1 = Math.min(r, 40);
  c += t1 * 5;
  r -= t1;
  if (r > 0) {
    const t2 = Math.min(r, 40);
    c += t2 * 15;
    r -= t2;
  }
  if (r > 0) {
    c += r * 25;
  }
  return c;
}

function evRelief(omsp) {
  if (omsp <= 40000) return 5000;
  if (omsp < 50000) return Math.max(0, 5000 - 0.5 * (omsp - 40000));
  return 0;
}

function fuelLabel(f) {
  return f === "bev" ? "Electric (BEV)" : f === "diesel" ? "Diesel" : f === "hybrid" ? "Hybrid / PHEV" : "Petrol";
}

const ORIGIN_NOTES = {
  japan: "Japan Origin (True Wheel Motors Specialism): Eligible for 0% Customs Duty under the EU-Japan EPA Agreement with official Statement of Origin filed via Irish Revenue AIS/CDS.",
  eu: "EU Member State Origin: VRT is the sole registration levy. No import VAT or customs duty on qualifying used intra-EU movements.",
  uk: "Great Britain (Post-Brexit): Treated as third-country. Standard 10% customs duty plus 23% Irish import VAT applies on top of VRT.",
  other: "Non-EU Origin: Standard third-country customs duty (typically 10%) and 23% import VAT apply on arrival at Dublin Port before VRT registration."
};

export function initCalculator() {
  const container = document.getElementById("calculator-section");
  if (!container) return;

  let currentCategory = "A"; // 'A' (Car) or 'B' (Van)
  let lastCalculatedData = null;

  // Elements
  const tabA = document.getElementById("vrt-tab-a");
  const tabB = document.getElementById("vrt-tab-b");
  const presetSelect = document.getElementById("vrt-preset-select");
  const originRadios = document.querySelectorAll("input[name='vrt-origin']");
  const fuelSelect = document.getElementById("vrt-fuel");
  const omspInput = document.getElementById("vrt-omsp");
  const stdSelect = document.getElementById("vrt-std");
  const co2Input = document.getElementById("vrt-co2");
  const co2UndocCheck = document.getElementById("vrt-co2-undoc");
  const noxInput = document.getElementById("vrt-nox");
  const noxUndocCheck = document.getElementById("vrt-nox-undoc");
  const flatVanCheck = document.getElementById("vrt-flat-van");
  const flatVanRow = document.getElementById("vrt-flat-van-row");
  const bevNote = document.getElementById("vrt-bev-note");
  const co2Block = document.getElementById("vrt-co2-block");
  const noxBlock = document.getElementById("vrt-nox-block");
  const resultBox = document.getElementById("vrt-result-box");
  const originNoteEl = document.getElementById("vrt-origin-note");
  const sourceActionBtn = document.getElementById("vrt-source-btn");

  const PRESETS = {
    custom: { omsp: 24000, co2: 85, nox: 12, fuel: "hybrid", origin: "japan", label: "Custom Vehicle" },
    aqua: { omsp: 18500, co2: 78, nox: 10, fuel: "hybrid", origin: "japan", label: "Toyota Aqua 1.5 Hybrid" },
    prius: { omsp: 23500, co2: 82, nox: 10, fuel: "hybrid", origin: "japan", label: "Toyota Prius 1.8 Hybrid" },
    vezel: { omsp: 26500, co2: 96, nox: 14, fuel: "hybrid", origin: "japan", label: "Honda Vezel 1.5 e:HEV" },
    lexus: { omsp: 28500, co2: 104, nox: 15, fuel: "hybrid", origin: "japan", label: "Lexus IS300h F-Sport" },
    alphard: { omsp: 38000, co2: 142, nox: 22, fuel: "hybrid", origin: "japan", label: "Toyota Alphard 2.5 Hybrid" },
    note: { omsp: 17500, co2: 82, nox: 11, fuel: "hybrid", origin: "japan", label: "Nissan Note e-Power" }
  };

  function calculate() {
    if (!omspInput || !fuelSelect) return;

    const omsp = parseFloat(omspInput.value) || 0;
    const fuel = fuelSelect.value;
    const isBev = fuel === "bev";
    const std = stdSelect ? stdSelect.value : "wltp";
    const co2Undoc = co2UndocCheck ? co2UndocCheck.checked : false;
    const noxUndoc = noxUndocCheck ? noxUndocCheck.checked : false;
    const isFlatVan = flatVanCheck ? flatVanCheck.checked : false;
    const rawCo2 = parseFloat(co2Input ? co2Input.value : 0) || 0;
    const noxVal = parseFloat(noxInput ? noxInput.value : 0) || 0;

    const originRadio = document.querySelector("input[name='vrt-origin']:checked");
    const origin = originRadio ? originRadio.value : "japan";

    if (originNoteEl) {
      originNoteEl.textContent = ORIGIN_NOTES[origin] || ORIGIN_NOTES.japan;
    }

    if (!omsp || omsp <= 0) {
      if (resultBox) {
        resultBox.innerHTML = `
          <div class="vrt-placeholder-box">
            <span style="font-size: 2rem;">🚗</span>
            <p>Enter an estimated Open Market Selling Price (OMSP) to calculate Revenue VRT.</p>
          </div>
        `;
      }
      return;
    }

    // Category B Flat Van (€200)
    if (currentCategory === "B" && isFlatVan) {
      const total = 200;
      lastCalculatedData = { total, omsp, fuel, category: "B", note: "Flat €200 commercial van rate" };
      renderResult(total, "Category B Commercial Van · Flat Rate", "Flat €200 Fee", [
        ["Revenue OMSP", "€" + eur(omsp)],
        ["Classification", "Commercial N1 Goods Vehicle (>130% Mass Ratio)"],
        ["Statutory Rate", "Flat €200 Fixed Charge"],
        ["NOx Levy", "Exempt (Category B)"]
      ], "Flat €200 applies to qualifying N1 commercial vans under Revenue guidelines.");
      return;
    }

    const isDiesel = fuel === "diesel";
    let co2 = isBev ? 0 : rawCo2;
    let converted = false;
    if (!isBev && !co2Undoc && std === "nedc") {
      co2 = currentCategory === "A" ? nedcA(rawCo2, isDiesel) : nedcB(rawCo2, isDiesel);
      converted = true;
    }

    // Category B (Commercial Vans)
    if (currentCategory === "B") {
      const band = (!isBev && co2Undoc) ? BANDS_B[1] : findBand(BANDS_B, co2);
      const total = Math.max(band.rate * omsp, band.min);
      const co2Str = (!isBev && co2Undoc) ? "Not Documented" : (isBev ? "0 g/km (BEV)" : Math.round(co2) + " g/km");

      lastCalculatedData = { total, omsp, fuel, category: "B", co2, bandRate: band.rate };

      renderResult(total, `Category B · ${fuelLabel(fuel)}`, (!isBev && co2Undoc) ? "Top Band (No CO₂ Documentation)" : (co2 <= 120 ? "0–120 g/km (8%)" : ">120 g/km (13.3%)"), [
        ["Revenue OMSP", "€" + eur(omsp)],
        [converted ? "CO₂ (WLTP equivalent from " + rawCo2 + " NEDC)" : "CO₂ Certified Emissions", co2Str],
        [`Band Rate (${pct(band.rate)}%, min €${eur(band.min)})`, "€" + eur(total)],
        ["NOx Levy", "Not Applicable (Category B)"]
      ]);
      return;
    }

    // Category A (Cars & SUVs)
    const band = (!isBev && co2Undoc) ? BANDS_A[BANDS_A.length - 1] : findBand(BANDS_A, co2);
    const co2Charge = Math.max(band.rate * omsp, band.min);

    let noxCharge = 0;
    let noxStr = "";
    if (isBev) {
      noxStr = "Exempt (Pure Electric)";
    } else if (noxUndoc) {
      noxCharge = isDiesel ? 4850 : 600;
      noxStr = `€${eur(noxCharge)} (Statutory Maximum Penalty)`;
    } else {
      noxCharge = noxLevy(noxVal);
      noxStr = `€${eur(noxCharge)}`;
    }

    const preRelief = co2Charge + noxCharge;
    let relief = isBev ? Math.min(evRelief(omsp), preRelief) : 0;
    const total = Math.max(0, preRelief - relief);
    const co2Str = (!isBev && co2Undoc) ? "Top Band (No Documentation)" : (isBev ? "0 g/km (BEV)" : Math.round(co2) + " g/km");

    let bevNoteText = "";
    if (isBev && relief > 0) {
      bevNoteText = "BEV Relief of up to €5,000 applied under Irish Finance Act provisions (valid through 2026).";
    } else if (isBev && omsp >= 50000) {
      bevNoteText = "No BEV relief applied: Revenue OMSP is €50,000 or greater.";
    }

    lastCalculatedData = { total, omsp, fuel, category: "A", co2, nox: noxVal, bandRate: band.rate };

    const lines = [
      ["Revenue OMSP Valuation", "€" + eur(omsp)],
      [converted ? `CO₂ (WLTP from ${rawCo2} NEDC)` : "CO₂ Certified Emissions", co2Str],
      [`CO₂ VRT Charge (${pct(band.rate)}%, min €${eur(band.min)})`, "€" + eur(co2Charge)],
      ["NOx Environmental Levy", noxStr]
    ];

    if (relief > 0) {
      lines.push(["BEV Revenue Relief", "−€" + eur(relief), "text-success"]);
    }

    renderResult(total, `Category A · ${fuelLabel(fuel)}`, (!isBev && co2Undoc) ? "Top Band (41%)" : `${Math.round(co2)} g/km (${pct(band.rate)}%)`, lines, bevNoteText);
  }

  function renderResult(total, subtitle, bandPill, lines, noteText) {
    if (!resultBox) return;

    resultBox.innerHTML = `
      <div class="vrt-result-header">
        <span class="vrt-result-kicker">Estimated Irish Revenue VRT Payable</span>
        <div class="vrt-result-total">
          <span class="vrt-currency">€</span>${eur(total)}
        </div>
        <span class="vrt-result-sub">${subtitle}</span>
      </div>

      <div class="vrt-result-body">
        <div class="vrt-band-pill-wrap">
          <span class="vrt-band-badge">${bandPill}</span>
        </div>

        <div class="vrt-lines-list">
          ${lines.map(([label, val, cls]) => `
            <div class="vrt-line-item">
              <span class="vrt-line-label">${label}</span>
              <strong class="vrt-line-val ${cls || ''}">${val}</strong>
            </div>
          `).join("")}
        </div>

        ${noteText ? `<div class="vrt-hint-box">${noteText}</div>` : ""}

        <div class="vrt-card-action">
          <button type="button" id="vrt-apply-sourcing-btn" class="btn btn-gold w-full" style="width: 100%;">
            <span>Have True Wheel Motors Clear & Register This Car</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>
    `;

    document.getElementById("vrt-apply-sourcing-btn")?.addEventListener("click", () => {
      const presetVal = presetSelect ? presetSelect.value : "custom";
      const presetObj = PRESETS[presetVal] || PRESETS.custom;
      const modelName = presetVal !== "custom" ? presetObj.label : "Custom Japanese Import";

      if (window.openSourcingModal) {
        window.openSourcingModal({
          model: modelName,
          notes: `Target OMSP: €${eur(lastCalculatedData?.omsp || 24000)} | Estimated VRT: €${eur(total)} | CO2: ${lastCalculatedData?.co2 || 85}g/km`
        });
      }
    });
  }

  function syncUI() {
    const fuel = fuelSelect ? fuelSelect.value : "hybrid";
    const isBev = fuel === "bev";
    const isFlat = flatVanCheck ? flatVanCheck.checked : false;

    if (flatVanRow) flatVanRow.classList.toggle("hidden", currentCategory !== "B");
    if (bevNote) bevNote.classList.toggle("hidden", !isBev);

    const hideCo2 = isBev || (currentCategory === "B" && isFlat);
    if (co2Block) co2Block.classList.toggle("hidden", hideCo2);
    if (noxBlock) noxBlock.classList.toggle("hidden", currentCategory !== "A" || isBev);

    const co2Undoc = co2UndocCheck ? co2UndocCheck.checked : false;
    if (co2Input) co2Input.disabled = co2Undoc;
    if (stdSelect) stdSelect.disabled = co2Undoc;

    const noxUndoc = noxUndocCheck ? noxUndocCheck.checked : false;
    if (noxInput) noxInput.disabled = noxUndoc;

    calculate();
  }

  // Category Switchers
  if (tabA) {
    tabA.addEventListener("click", () => {
      currentCategory = "A";
      tabA.classList.add("on");
      tabB?.classList.remove("on");
      syncUI();
    });
  }

  if (tabB) {
    tabB.addEventListener("click", () => {
      currentCategory = "B";
      tabB.classList.add("on");
      tabA?.classList.remove("on");
      syncUI();
    });
  }

  // Preset Selector
  if (presetSelect) {
    presetSelect.addEventListener("change", (e) => {
      const p = PRESETS[e.target.value];
      if (p) {
        if (omspInput) omspInput.value = p.omsp;
        if (co2Input) co2Input.value = p.co2;
        if (noxInput) noxInput.value = p.nox;
        if (fuelSelect) fuelSelect.value = p.fuel;

        // Set radio
        const r = document.querySelector(`input[name='vrt-origin'][value='${p.origin}']`);
        if (r) {
          r.checked = true;
          document.querySelectorAll(".vrt-origin-chip").forEach((chip) => {
            chip.classList.toggle("on", chip.contains(r));
          });
        }
        syncUI();
      }
    });
  }

  // Origin Radios
  originRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      document.querySelectorAll(".vrt-origin-chip").forEach((chip) => {
        chip.classList.toggle("on", chip.querySelector("input")?.checked);
      });
      calculate();
    });
  });

  // Inputs
  [fuelSelect, omspInput, stdSelect, co2Input, noxInput, co2UndocCheck, noxUndocCheck, flatVanCheck].forEach((el) => {
    if (el) {
      el.addEventListener("input", syncUI);
      el.addEventListener("change", syncUI);
    }
  });

  // Render 20-Band Spectrum Grid
  renderBandSpectrum();

  syncUI();
}

function renderBandSpectrum() {
  const grid = document.getElementById("vrt-band-grid");
  if (!grid) return;

  let prev = 0;
  grid.innerHTML = BANDS_A.map((b, i) => {
    const range = i === BANDS_A.length - 1 ? ">" + prev : (i === 0 ? "0–" + b.max : (prev + 1) + "–" + b.max);
    if (b.max !== Infinity) prev = b.max;
    const isTop = i === BANDS_A.length - 1;
    return `
      <div class="vrt-spectrum-chip ${isTop ? 'top-band' : ''}">
        <span class="vrt-chip-range">${range} g/km</span>
        <strong class="vrt-chip-rate">${pct(b.rate)}% · min €${eur(b.min)}</strong>
      </div>
    `;
  }).join("");
}
