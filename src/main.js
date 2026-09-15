import { initInventory, closeCarModal } from "./modules/inventory.js";
import { initCalculator } from "./modules/calculator.js";
import { initSourcingModal } from "./modules/sourcingModal.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize inventory, calculator, and custom sourcing modal
  initInventory();
  initCalculator();
  initSourcingModal();

  // Glass header scroll effect
  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }
  });

  // Mobile menu toggle
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const mobileNav = document.getElementById("mobile-nav-drawer");
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", () => {
      mobileNav.classList.toggle("active");
    });
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("active");
      });
    });
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
    }
  });
});
