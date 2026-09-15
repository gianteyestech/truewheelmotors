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
    window.openSourcingModal({ model: `Enquiry / Sourcing Request for Ref: ${carId}` });
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
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const make = formData.get("make");
      const model = formData.get("model");
      const name = formData.get("name");
      const phone = formData.get("phone");
      const county = formData.get("county");

      const summaryText = `🚗 *New Vehicle Import Sourcing Request - True Wheel Motors*\n` +
        `• Customer: ${name}\n` +
        `• Phone/WhatsApp: ${phone}\n` +
        `• County: ${county}\n` +
        `• Desired Vehicle: ${make} ${model}\n` +
        `• Year Range: ${formData.get("yearMin")} - ${formData.get("yearMax")}\n` +
        `• Preferences: ${formData.get("notes") || "None specified"}\n\n` +
        `Please search upcoming Tokyo/USS auctions and provide available options.`;

      form.classList.add("hidden");
      if (successBox) {
        successBox.classList.remove("hidden");
        const detailsEl = document.getElementById("sourcing-summary-details");
        if (detailsEl) {
          detailsEl.innerHTML = `
            <strong style="color: var(--royal-blue); font-size: 1.15rem; display: block; margin-bottom: 0.5rem;">Sourcing Enquiry Logged for ${make} ${model}</strong>
            <p class="text-sm text-muted" style="line-height: 1.6;">
              Thank you, <strong>${name}</strong>. Our dedicated import desk will review upcoming live auction listings for your criteria and contact you at <strong>${phone}</strong> with matching Grade 4.5+ inspected options.
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
