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
            <strong style="color: var(--royal-blue); font-size: 1.1rem;">Sourcing Request Received for ${make} ${model}</strong>
            <p class="text-sm mt-2 text-muted">Our Tokyo & Kobe auction team will scan current listings and send verified Grade 4.5+ inspection sheets directly to <strong>${phone}</strong>.</p>
          `;
        }
        const waBtn = document.getElementById("btn-send-wa-summary");
        if (waBtn) {
          waBtn.onclick = () => {
            window.open(`https://wa.me/353871234567?text=${encodeURIComponent(summaryText)}`, "_blank");
          };
        }
      }
    });
  }
}
