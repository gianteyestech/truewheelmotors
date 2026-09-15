export function initSourcingModal() {
  const modal = document.getElementById("sourcing-modal");
  const closeBtn = document.getElementById("close-sourcing-modal");
  const form = document.getElementById("sourcing-form");
  const successBox = document.getElementById("sourcing-success");

  if (!modal) return;

  window.openSourcingModal = function(prefillData = {}) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    if (successBox) successBox.classList.add("hidden");
    if (form) {
      form.classList.remove("hidden");
      if (prefillData.make) {
        const makeInput = form.querySelector('[name="make"]');
        if (makeInput) makeInput.value = prefillData.make;
      }
      if (prefillData.model) {
        const modelInput = form.querySelector('[name="model"]');
        if (modelInput) modelInput.value = prefillData.model;
      }
    }
  };

  window.closeSourcingModal = function() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  };

  window.reserveCarModal = function(carId) {
    // If inventory's reserveCarModal exists, prefer it to pre-fill the full Contact Us form
    if (window.reserveCarModalInventory) {
      window.reserveCarModalInventory(carId);
    } else {
      window.openSourcingModal({ model: `Bespoke Sourcing Request for Ref: ${carId}` });
    }
  };

  if (closeBtn) {
    closeBtn.addEventListener("click", window.closeSourcingModal);
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      window.closeSourcingModal();
    }
  });

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const make = formData.get("make") || "Toyota";
      const model = formData.get("model") || "Custom Import";
      const name = formData.get("name") || "Valued Client";
      const phone = formData.get("phone") || "";
      const county = formData.get("county") || "Dublin";
      const yearMin = formData.get("yearMin") || "2019";
      const yearMax = formData.get("yearMax") || "2024";
      const notes = formData.get("notes") || "None specified";
      const refId = `TWM-SRC-${Math.floor(1000 + Math.random() * 9000)}`;

      // Dispatch email via no-reply@truewheelmotors.ie
      try {
        await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            phone,
            contactMethod: 'WhatsApp',
            service: 'Japan Auction Custom Sourcing',
            vehicle: `${make} ${model}`,
            year: `${yearMin} - ${yearMax}`,
            origin: 'Japan (USS Tokyo / HAA Kobe)',
            county,
            message: `Preferences: ${notes}\nYear Range: ${yearMin}-${yearMax}\nFuel: ${formData.get("fuel") || "Hybrid"}`,
            refId
          })
        });
      } catch (err) {
        console.warn("Sourcing email dispatch note:", err);
      }

      form.classList.add("hidden");
      if (successBox) {
        successBox.classList.remove("hidden");
        const detailsEl = document.getElementById("sourcing-summary-details");
        if (detailsEl) {
          detailsEl.innerHTML = `
            <div style="font-family: monospace; font-size: 0.82rem; font-weight: 700; color: var(--gold-dark); margin-bottom: 0.4rem;">REF: ${refId}</div>
            <strong style="color: var(--royal-blue); font-size: 1.2rem; display: block; margin-bottom: 0.5rem;">Sourcing Inquiry Logged for ${make} ${model}</strong>
            <p class="text-sm text-muted" style="line-height: 1.6;">
              Thank you, <strong>${name}</strong>. Our Tokyo auction bidding desk has received your criteria and will review live Tokyo/Kobe auction sheets to contact you at <strong>${phone}</strong> with Grade 4.5+ inspected options.
            </p>
            <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid #E2E8F0; font-size: 0.84rem; color: #64748B;">
              Direct Desk: <a href="mailto:info@truewheelmotors.ie" style="color: var(--royal-blue); font-weight: 600; text-decoration: none;">info@truewheelmotors.ie</a> &bull; <a href="tel:+353894787642" style="color: var(--royal-blue); font-weight: 600; text-decoration: none;">+353 89 478 7642</a> &bull; <a href="tel:+353863783948" style="color: var(--royal-blue); font-weight: 600; text-decoration: none;">+353 86 378 3948</a>
            </div>
          `;
        }
      }
    });
  }
}
