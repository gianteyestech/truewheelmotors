export function initCalculator() {
  const carSelect = document.getElementById("calc-car-select");
  const fuelTypeSelect = document.getElementById("calc-fuel-type");
  const co2Slider = document.getElementById("calc-co2-slider");
  const co2Display = document.getElementById("calc-co2-display");
  const epaDutyToggle = document.getElementById("calc-epa-toggle");
  const customsRateLabel = document.getElementById("customs-rate-label");
  const vrtBandDisplay = document.getElementById("out-vrt-band");
  const taxBandDisplay = document.getElementById("out-tax-band");
  const clearanceStatusDisplay = document.getElementById("out-clearance-status");

  if (!co2Slider && !carSelect) return;

  const presets = {
    custom: { co2: 85, fuel: "hybrid", tax: "€180 / yr", model: "Custom Japanese Import" },
    aqua: { co2: 78, fuel: "hybrid", tax: "€170 / yr", model: "Toyota Aqua 1.5 Hybrid" },
    prius: { co2: 82, fuel: "hybrid", tax: "€180 / yr", model: "Toyota Prius 1.8 Hybrid" },
    vezel: { co2: 96, fuel: "hybrid", tax: "€180 / yr", model: "Honda Vezel 1.5 e:HEV" },
    lexus: { co2: 104, fuel: "hybrid", tax: "€190 / yr", model: "Lexus IS300h F-Sport" },
    alphard: { co2: 142, fuel: "hybrid", tax: "€280 / yr", model: "Toyota Alphard 2.5 Hybrid" }
  };

  function updateAssessment() {
    const co2 = parseInt(co2Slider ? co2Slider.value : 85, 10);
    const fuel = fuelTypeSelect ? fuelTypeSelect.value : "hybrid";
    const isEpaRelief = epaDutyToggle ? epaDutyToggle.checked : true;

    // Determine VRT CO2 Percentage Band
    let vrtRate = 11.5;
    let bandName = "Band B1";
    if (co2 <= 50) {
      vrtRate = 7.0;
      bandName = "Band A0 (EV/PHEV)";
    } else if (co2 <= 80) {
      vrtRate = 9.0;
      bandName = "Band A1";
    } else if (co2 <= 100) {
      vrtRate = 11.5;
      bandName = "Band A2";
    } else if (co2 <= 110) {
      vrtRate = 13.5;
      bandName = "Band B1";
    } else if (co2 <= 130) {
      vrtRate = 17.5;
      bandName = "Band B2";
    } else if (co2 <= 150) {
      vrtRate = 21.0;
      bandName = "Band C";
    } else {
      vrtRate = 27.0;
      bandName = "Band D+";
    }

    if (fuel === "hybrid") {
      vrtRate = Math.max(7.0, vrtRate - 2.0);
    }

    if (co2Display) {
      co2Display.textContent = `${co2} g/km (${vrtRate.toFixed(1)}% VRT Rate • ${bandName})`;
    }

    if (customsRateLabel) {
      customsRateLabel.textContent = isEpaRelief 
        ? "0% Duty (EU-Japan EPA Exemption with Statement of Origin)" 
        : "10% Standard Non-EU Customs Duty";
    }

    if (vrtBandDisplay) {
      vrtBandDisplay.textContent = `${vrtRate.toFixed(1)}% of Revenue OMSP (${bandName})`;
    }

    if (taxBandDisplay) {
      const selected = carSelect ? presets[carSelect.value] : null;
      taxBandDisplay.textContent = selected ? selected.tax : (co2 <= 100 ? "€170 - €180 / year" : "€190 - €280 / year");
    }

    if (clearanceStatusDisplay) {
      clearanceStatusDisplay.textContent = isEpaRelief
        ? "0% Duty Eligible + 23% VAT + Revenue VRT Clearance"
        : "10% Duty + 23% VAT + Revenue VRT Clearance";
    }
  }

  // Event listeners
  if (co2Slider) co2Slider.addEventListener("input", updateAssessment);
  if (fuelTypeSelect) fuelTypeSelect.addEventListener("change", updateAssessment);
  if (epaDutyToggle) epaDutyToggle.addEventListener("change", updateAssessment);

  if (carSelect) {
    carSelect.addEventListener("change", (e) => {
      const selected = presets[e.target.value];
      if (selected) {
        if (co2Slider) co2Slider.value = selected.co2;
        if (fuelTypeSelect) fuelTypeSelect.value = selected.fuel;
        updateAssessment();
      }
    });
  }

  updateAssessment();
}
