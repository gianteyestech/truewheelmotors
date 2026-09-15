import { CARS_DATA } from "../data/cars.js";

export function initInventory() {
  const container = document.getElementById("inventory-grid");
  const countBadge = document.getElementById("inventory-count");
  const tabButtons = document.querySelectorAll(".filter-tab-btn");
  const makeFilter = document.getElementById("filter-make");
  const bodyFilter = document.getElementById("filter-body");
  const fuelFilter = document.getElementById("filter-fuel");
  const searchInput = document.getElementById("inventory-search-input");
  const sortSelect = document.getElementById("inventory-sort-select");

  // Hero search elements
  const heroMake = document.getElementById("hero-filter-make");
  const heroBody = document.getElementById("hero-filter-body");
  const heroFuel = document.getElementById("hero-filter-fuel");
  const heroStatus = document.getElementById("hero-filter-status");
  const heroSearchBtn = document.getElementById("hero-search-btn");

  if (!container) return;

  let currentStatus = "all";

  function renderCars() {
    const make = makeFilter ? makeFilter.value : "all";
    const body = bodyFilter ? bodyFilter.value : "all";
    const fuel = fuelFilter ? fuelFilter.value : "all";
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const sortMode = sortSelect ? sortSelect.value : "featured";

    let filtered = CARS_DATA.filter((car) => {
      // Status filter
      if (currentStatus !== "all" && car.status !== currentStatus) {
        return false;
      }
      // Make
      if (make !== "all" && car.make.toLowerCase() !== make.toLowerCase()) {
        return false;
      }
      // Body type
      if (body !== "all" && car.bodyType.toLowerCase() !== body.toLowerCase()) {
        return false;
      }
      // Fuel
      if (fuel !== "all" && car.fuel.toLowerCase() !== fuel.toLowerCase()) {
        return false;
      }
      // Search query
      if (query) {
        const text = `${car.make} ${car.model} ${car.trim} ${car.color} ${car.location} ${car.bodyType}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
      return true;
    });

    // Sorting
    if (sortMode === "mileage") {
      filtered.sort((a, b) => a.mileageKm - b.mileageKm);
    } else if (sortMode === "year") {
      filtered.sort((a, b) => b.year - a.year);
    } else if (sortMode === "make") {
      filtered.sort((a, b) => a.make.localeCompare(b.make));
    }

    if (countBadge) {
      countBadge.textContent = `${filtered.length} Japanese Import${filtered.length === 1 ? "" : "s"} Shown`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-inventory-state">
          <div class="empty-icon">🚗🔍</div>
          <h3>No Vehicles Match Your Selected Filters</h3>
          <p>We source over 150,000+ vehicles weekly direct from Tokyo, USS, and Kobe auctions in Japan.</p>
          <button class="btn btn-gold" onclick="window.openSourcingModal()">
            Request Custom Japan Auction Sourcing
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map((car) => createCarCardHTML(car)).join("");

    // Attach click listeners to cards and buttons
    container.querySelectorAll(".car-card").forEach((card) => {
      const id = card.dataset.carId;
      card.querySelector(".btn-view-details")?.addEventListener("click", (e) => {
        e.stopPropagation();
        openCarModal(id);
      });
      card.querySelector(".btn-quick-whatsapp")?.addEventListener("click", (e) => {
        e.stopPropagation();
        openWhatsAppEnquiry(id);
      });
      card.addEventListener("click", () => {
        openCarModal(id);
      });
    });
  }

  function createCarCardHTML(car) {
    const statusClass = car.status === "in-stock" ? "badge-stock" : (car.status === "in-transit" ? "badge-transit" : "badge-auction");
    
    return `
      <article class="car-card glass-card" data-car-id="${car.id}">
        <div class="car-card-media">
          <img src="${car.images[0]}" alt="${car.make} ${car.model}" loading="lazy" class="car-card-img" />
          <div class="car-card-badges">
            <span class="status-badge ${statusClass}">
              <span class="status-dot"></span> ${car.statusLabel}
            </span>
            <span class="grade-badge">Grade ${car.auctionGrade}</span>
          </div>
          <div class="car-card-overlay">
            <span>View Full Specifications & Japanese Inspection Sheet</span>
          </div>
        </div>

        <div class="car-card-body">
          <div class="car-card-title-row">
            <div>
              <span class="car-make-year">${car.year} • ${car.make} • ${car.bodyType}</span>
              <h3 class="car-model-name">${car.model}</h3>
              <p class="car-trim-name">${car.trim}</p>
            </div>
            <div class="car-status-pill">
              <span class="avail-badge">${car.status === 'in-stock' ? 'Dublin Ready' : (car.status === 'in-transit' ? 'Port Transit' : 'Auction Direct')}</span>
            </div>
          </div>

          <div class="car-specs-grid">
            <div class="spec-pill" title="Odometer reading">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span>${Number(car.mileageKm).toLocaleString()} km (${Number(car.mileageMiles).toLocaleString()} mi)</span>
            </div>
            <div class="spec-pill" title="Powertrain">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <span>${car.fuel} • Automatic</span>
            </div>
            <div class="spec-pill" title="Annual Irish Road Tax">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              <span>Road Tax: ${car.annualTax}</span>
            </div>
            <div class="spec-pill spec-success" title="Irish NCT Status">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>${car.nctStatus}</span>
            </div>
          </div>

          <p class="car-highlight-text">${car.highlight}</p>

          <div class="car-card-footer">
            <button class="btn btn-royal btn-view-details">
              Specs & Inspection Sheet
            </button>
            <button class="btn btn-gold-outline btn-quick-whatsapp" title="Enquire on WhatsApp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              <span>Enquire</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  // Filter tab clicks
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentStatus = btn.dataset.status;
      renderCars();
    });
  });

  // Inputs change
  [makeFilter, bodyFilter, fuelFilter, searchInput, sortSelect].forEach((el) => {
    if (el) {
      el.addEventListener("input", renderCars);
      el.addEventListener("change", renderCars);
    }
  });

  // Hero Search integration
  if (heroSearchBtn) {
    heroSearchBtn.addEventListener("click", () => {
      if (heroMake && makeFilter) makeFilter.value = heroMake.value;
      if (heroBody && bodyFilter) bodyFilter.value = heroBody.value;
      if (heroFuel && fuelFilter) fuelFilter.value = heroFuel.value;
      if (heroStatus && heroStatus.value !== "all") {
        currentStatus = heroStatus.value;
        tabButtons.forEach((b) => {
          b.classList.toggle("active", b.dataset.status === currentStatus);
        });
      }
      renderCars();

      const invSection = document.getElementById("inventory-section");
      if (invSection) {
        invSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // Initial render
  renderCars();
}

// Modal management
export function openCarModal(carId) {
  const car = CARS_DATA.find((c) => c.id === carId);
  if (!car) return;

  const modal = document.getElementById("car-detail-modal");
  const modalBody = document.getElementById("car-modal-content");
  if (!modal || !modalBody) return;

  modalBody.innerHTML = `
    <div class="modal-car-grid">
      <!-- Media column -->
      <div class="modal-media-col">
        <div class="modal-main-image-wrap">
          <img src="${car.images[0]}" alt="${car.make} ${car.model}" id="modal-main-img" class="modal-main-img" />
          <span class="modal-grade-pill">Japanese Auction Grade ${car.auctionGrade} • Interior ${car.interiorGrade}</span>
        </div>
        <div class="modal-thumbnails-row">
          ${car.images.map((img, idx) => `
            <button class="thumb-btn ${idx === 0 ? 'active' : ''}" onclick="window.switchModalImage('${img}', this)">
              <img src="${img}" alt="Thumbnail ${idx + 1}" />
            </button>
          `).join('')}
        </div>

        <div class="modal-trust-callout glass-panel">
          <div class="trust-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <div>
              <strong>BIMTA Mileage Guarantee</strong>
              <p>Odometer verified against Japanese export database.</p>
            </div>
          </div>
          <div class="trust-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <div>
              <strong>Rust-Free Chassis Verification</strong>
              <p>Imported from southern/central Japan with no winter road salt exposure.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Details & Specs column -->
      <div class="modal-info-col">
        <div class="modal-header-row">
          <div>
            <span class="text-royal-blue uppercase tracking font-bold">${car.year} • ${car.make}</span>
            <h2 class="modal-car-title">${car.model}</h2>
            <p class="modal-car-trim">${car.trim} — ${car.color}</p>
          </div>
          <div class="modal-status-box">
            <span class="tag-label">Import Status</span>
            <span class="tag-status-text text-royal-blue">${car.statusLabel}</span>
            <span class="tag-sub text-success">${car.vrtStatus}</span>
          </div>
        </div>

        <div class="status-location-banner glass-panel">
          <div>
            <strong class="text-royal-blue">${car.availability}</strong>
            <p class="text-muted text-sm">${car.location}</p>
          </div>
          <div class="tax-badge">
            Irish Road Tax: <strong>${car.annualTax}</strong>
          </div>
        </div>

        <!-- Auction Inspection Sheet translation -->
        <div class="auction-sheet-box glass-panel">
          <div class="auction-sheet-header">
            <div class="auction-sheet-icon">🇯🇵 📋</div>
            <div>
              <h4>Official Japanese Auction Sheet Translation</h4>
              <p class="text-xs text-muted">Original verified inspection report from Japan Auction House</p>
            </div>
          </div>
          <p class="auction-sheet-notes">${car.auctionNotes}</p>
          <div class="sheet-criteria-grid">
            <div class="criteria-item">
              <span class="label">Overall Grade</span>
              <span class="val gold-text">${car.auctionGrade} / 5.0</span>
            </div>
            <div class="criteria-item">
              <span class="label">Interior Rank</span>
              <span class="val text-royal-blue">${car.interiorGrade} (Pristine)</span>
            </div>
            <div class="criteria-item">
              <span class="label">Chassis / Underbody</span>
              <span class="val text-success">Grade A (Zero Rust)</span>
            </div>
            <div class="criteria-item">
              <span class="label">Engine & Transmission</span>
              <span class="val text-success">Pass (Tested 100%)</span>
            </div>
          </div>
        </div>

        <!-- Specifications Grid -->
        <h4 class="section-subheading">Key Specifications</h4>
        <div class="spec-matrix-grid">
          <div class="matrix-cell">
            <span class="m-label">Odometer</span>
            <span class="m-val">${Number(car.mileageKm).toLocaleString()} km (${Number(car.mileageMiles).toLocaleString()} mi)</span>
          </div>
          <div class="matrix-cell">
            <span class="m-label">Engine</span>
            <span class="m-val">${car.engine}</span>
          </div>
          <div class="matrix-cell">
            <span class="m-label">Transmission</span>
            <span class="m-val">${car.transmission}</span>
          </div>
          <div class="matrix-cell">
            <span class="m-label">Irish VRT</span>
            <span class="m-val text-success">${car.vrtStatus}</span>
          </div>
        </div>

        <!-- Equipment list -->
        <h4 class="section-subheading">Features & Irish Market Preparation</h4>
        <ul class="features-checklist">
          ${car.features.map((f) => `
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>${f}</span>
            </li>
          `).join('')}
        </ul>

        <!-- Action CTAs -->
        <div class="modal-cta-row">
          <button class="btn btn-royal btn-lg flex-1" onclick="window.openWhatsAppEnquiry('${car.id}')">
            Enquire via WhatsApp
          </button>
          <button class="btn btn-gold btn-lg flex-1" onclick="window.reserveCarModal('${car.id}')">
            Request Vehicle Sourcing & Inspection
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

export function closeCarModal() {
  const modal = document.getElementById("car-detail-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

export function openWhatsAppEnquiry(carId) {
  const car = CARS_DATA.find((c) => c.id === carId);
  const text = car 
    ? `Hi True Wheel Motors, I am interested in learning more about the ${car.year} ${car.make} ${car.model} (${car.trim}, Ref: ${car.id}). Could you please share more details and availability?`
    : `Hi True Wheel Motors, I would like to enquire about vehicle import and clearance from Japan to Ireland.`;
  
  const phone = "353871234567";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

window.switchModalImage = function(src, btn) {
  const mainImg = document.getElementById("modal-main-img");
  if (mainImg) mainImg.src = src;
  document.querySelectorAll(".thumb-btn").forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
};

window.openCarModal = openCarModal;
window.closeCarModal = closeCarModal;
window.openWhatsAppEnquiry = openWhatsAppEnquiry;
