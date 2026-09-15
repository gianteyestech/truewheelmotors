// GDPR & Irish Data Protection Commission (DPC) Compliant Cookie Consent Module
export function initCookieConsent() {
  const STORAGE_KEY = "twm_cookie_consent_v1";

  // Check if consent has already been given
  const existingConsent = localStorage.getItem(STORAGE_KEY);

  // Render Banner and Modal into DOM if not present
  if (!document.getElementById("cookie-consent-banner")) {
    const bannerHTML = `
      <div id="cookie-consent-banner" class="cookie-banner hidden" role="region" aria-label="Cookie consent">
        <div class="cookie-banner-inner">
          <p class="cookie-banner-text">
            This website uses cookies to ensure that you have the best possible experience. You can give permission for the use of all cookies by choosing 'Accept', or set your own preferences via 'Settings'. Please note; not accepting functional cookies may disrupt the website experience.
          </p>
          <div class="cookie-banner-actions">
            <button id="cookie-settings-btn" class="cookie-btn cookie-btn-link" type="button">Settings</button>
            <button id="cookie-decline-btn" class="cookie-btn cookie-btn-secondary" type="button">Decline All</button>
            <button id="cookie-accept-btn" class="cookie-btn cookie-btn-primary" type="button">Accept</button>
            <button id="cookie-close-btn" class="cookie-close-icon" type="button" aria-label="Dismiss cookie notice">&times;</button>
          </div>
        </div>
      </div>

      <!-- Cookie Preferences Modal -->
      <div id="cookie-modal" class="modal-backdrop hidden" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
        <div class="modal-container cookie-modal-wrap">
          <button class="modal-close-btn" id="close-cookie-modal" aria-label="Close settings">&times;</button>
          <div class="modal-body" style="padding: 2rem;">
            <div class="mb-3">
              <span class="section-kicker">Data Protection & Privacy</span>
              <h3 id="cookie-modal-title" style="font-family: var(--font-heading); color: var(--royal-blue); margin: 0.4rem 0 0.8rem; font-size: 1.5rem;">
                Cookie Preferences
              </h3>
              <p class="text-sm text-muted">
                In compliance with Irish ePrivacy Regulations (SI 336/2011) and the EU GDPR, you have the right to decide which categories of cookies are stored on your device when visiting True Wheel Motors.
              </p>
            </div>

            <div class="cookie-prefs-list">
              <!-- Essential -->
              <div class="cookie-pref-item">
                <div class="cookie-pref-info">
                  <strong>Strictly Necessary & Functional Cookies</strong>
                  <span class="badge-always-active">Always Active</span>
                  <p>Required for secure browsing, session integrity, vehicle sourcing forms, and live VRT calculation states.</p>
                </div>
                <input type="checkbox" checked disabled class="cookie-checkbox" />
              </div>

              <!-- Analytics -->
              <div class="cookie-pref-item">
                <div class="cookie-pref-info">
                  <strong>Performance & Analytics Cookies</strong>
                  <p>Enables anonymous traffic metrics to help us measure showroom popularity and optimize search speed.</p>
                </div>
                <input type="checkbox" id="cookie-pref-analytics" checked class="cookie-checkbox" />
              </div>

              <!-- Functional Preferences -->
              <div class="cookie-pref-item">
                <div class="cookie-pref-info">
                  <strong>Customer Preference Cookies</strong>
                  <p>Remembers your selected VRT vehicle configurations and filters across Dublin visits.</p>
                </div>
                <input type="checkbox" id="cookie-pref-functional" checked class="cookie-checkbox" />
              </div>
            </div>

            <div class="flex gap-3 mt-4" style="display: flex; gap: 0.85rem; justify-content: flex-end; margin-top: 1.5rem;">
              <button type="button" id="cookie-save-prefs-btn" class="btn btn-gold">
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", bannerHTML);
  }

  const banner = document.getElementById("cookie-consent-banner");
  const modal = document.getElementById("cookie-modal");

  function showBanner() {
    if (banner) banner.classList.remove("hidden");
  }

  function hideBanner() {
    if (banner) banner.classList.add("hidden");
  }

  function openSettings() {
    if (modal) modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeSettings() {
    if (modal) modal.classList.add("hidden");
    document.body.style.overflow = "";
  }

  window.openCookieSettings = openSettings;

  // Bind Banner Buttons
  document.getElementById("cookie-accept-btn")?.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice: "accept_all", timestamp: Date.now() }));
    hideBanner();
  });

  document.getElementById("cookie-decline-btn")?.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice: "decline_all", timestamp: Date.now() }));
    hideBanner();
  });

  document.getElementById("cookie-close-btn")?.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice: "dismissed", timestamp: Date.now() }));
    hideBanner();
  });

  document.getElementById("cookie-settings-btn")?.addEventListener("click", openSettings);
  document.getElementById("close-cookie-modal")?.addEventListener("click", closeSettings);

  document.getElementById("cookie-save-prefs-btn")?.addEventListener("click", () => {
    const analytics = document.getElementById("cookie-pref-analytics")?.checked ?? true;
    const functional = document.getElementById("cookie-pref-functional")?.checked ?? true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice: "custom", analytics, functional, timestamp: Date.now() }));
    closeSettings();
    hideBanner();
  });

  // If no decision recorded, show banner after a gentle delay
  if (!existingConsent) {
    setTimeout(showBanner, 900);
  }
}
