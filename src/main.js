import { initInventory, closeCarModal } from "./modules/inventory.js";
import { initCalculator } from "./modules/calculator.js";
import { initSourcingModal } from "./modules/sourcingModal.js";
import { initCookieConsent } from "./modules/cookies.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize inventory, calculator, sourcing modal, and GDPR cookie consent
  initInventory();
  initCalculator();
  initSourcingModal();
  initCookieConsent();

  // Glass header scroll effect
  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }
  });

  // Mobile menu toggle & drawer
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const mobileNav = document.getElementById("mobile-nav-drawer");
  const mobileClose = document.getElementById("mobile-nav-close");
  
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", () => {
      mobileNav.classList.add("active");
      document.body.style.overflow = "hidden";
    });

    const closeMobileMenu = () => {
      mobileNav.classList.remove("active");
      document.body.style.overflow = "";
    };

    if (mobileClose) {
      mobileClose.addEventListener("click", closeMobileMenu);
    }

    mobileNav.addEventListener("click", (e) => {
      if (e.target === mobileNav) {
        closeMobileMenu();
      }
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  // Floating Back to Top Button
  const backToTopBtn = document.getElementById("back-to-top");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 450) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    });

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Active Navigation Scrollspy
  const sections = document.querySelectorAll("section[id], footer[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach((link) => {
              if (link.getAttribute("href") === `#${id}`) {
                link.classList.add("active");
              } else {
                link.classList.remove("active");
              }
            });
          }
        });
      },
      { rootMargin: "-25% 0px -60% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
  }

  // FAQ Accordion
  document.querySelectorAll(".faq-item").forEach((item) => {
    const question = item.querySelector(".faq-question");
    question?.addEventListener("click", () => {
      const isActive = item.classList.contains("active");
      document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("active"));
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });

  // Service selection shortcut
  window.selectContactService = (serviceName) => {
    const serviceSelect = document.getElementById("contact-service");
    if (serviceSelect && serviceName) {
      for (let i = 0; i < serviceSelect.options.length; i++) {
        if (serviceSelect.options[i].value.toLowerCase().includes(serviceName.toLowerCase()) ||
            serviceSelect.options[i].text.toLowerCase().includes(serviceName.toLowerCase())) {
          serviceSelect.selectedIndex = i;
          break;
        }
      }
    }
    const contactSection = document.getElementById("contact-section");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Mobile drawer Services submenu toggle
  const mobileServicesToggle = document.getElementById("mobile-services-toggle");
  const mobileServicesSubmenu = document.getElementById("mobile-services-submenu");
  if (mobileServicesToggle && mobileServicesSubmenu) {
    mobileServicesToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = mobileServicesSubmenu.classList.toggle("open");
      mobileServicesToggle.classList.toggle("active", isOpen);
    });
  }

  // Contact Form Submission Handler (modeled after irishcarimports.ie contact desk)
  const contactForm = document.getElementById("contact-inquiry-form");
  const contactSuccess = document.getElementById("contact-form-success");
  const contactSummaryBox = document.getElementById("contact-summary-box");
  const contactResetBtn = document.getElementById("contact-reset-btn");
  const contactWhatsAppDirect = document.getElementById("contact-whatsapp-direct");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      const formData = new FormData(contactForm);
      const name = formData.get("name") || "Valued Client";
      const email = formData.get("email") || "";
      const phone = formData.get("phone") || "";
      const method = formData.get("contactMethod") || "WhatsApp";
      const service = formData.get("service") || "Automotive Import Inquiry";
      const vehicle = formData.get("vehicle") || "Vehicle Inquiry";
      const origin = formData.get("origin") || "Japan";
      const county = formData.get("county") || "Ireland";
      const vin = formData.get("vin") ? `(VIN: ${formData.get("vin")})` : "";

      const refId = `TWM-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      if (contactSummaryBox) {
        contactSummaryBox.innerHTML = `
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E2E8F0; padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
            <strong style="color: var(--royal-blue);">Inquiry Reference:</strong>
            <span style="font-family: monospace; font-weight: 700; color: var(--gold-dark);">${refId}</span>
          </div>
          <div><strong>Client:</strong> ${name} (${email} • ${phone})</div>
          <div><strong>Service:</strong> ${service}</div>
          <div><strong>Vehicle:</strong> ${vehicle} ${vin} (${origin})</div>
          <div><strong>Destination:</strong> Co. ${county} • Preferred via ${method}</div>
        `;
      }

      if (contactWhatsAppDirect) {
        const waText = encodeURIComponent(
          `Hello True Wheel Motors, I have submitted an import inquiry (Ref: ${refId}) for ${service} regarding ${vehicle}. Client: ${name}.`
        );
        contactWhatsAppDirect.href = `https://wa.me/353894787642?text=${waText}`;
      }

      contactForm.style.display = "none";
      contactSuccess?.classList.remove("hidden");
      contactSuccess?.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    if (contactResetBtn) {
      contactResetBtn.addEventListener("click", () => {
        contactForm.reset();
        contactSuccess?.classList.add("hidden");
        contactForm.style.display = "block";
      });
    }
  }

  // Modal close handlers
  const carModal = document.getElementById("car-detail-modal");
  const carModalCloseBtn = document.getElementById("close-car-modal");
  
  if (carModalCloseBtn) {
    carModalCloseBtn.addEventListener("click", closeCarModal);
  }

  if (carModal) {
    carModal.addEventListener("click", (e) => {
      if (e.target === carModal) {
        closeCarModal();
      }
    });
  }

  // Keyboard escape key to close modals
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCarModal();
      if (window.closeSourcingModal) window.closeSourcingModal();
      if (mobileNav) {
        mobileNav.classList.remove("active");
        document.body.style.overflow = "";
      }
    }
  });
});
