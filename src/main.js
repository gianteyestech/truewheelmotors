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
