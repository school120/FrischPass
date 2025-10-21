// https://school120.github.io/FrischPass/inject.js
// Load this via bookmarklet on the Veracross tab to enable message-based submit.

(function(){
  console.log("[Frisch VC Injector] ready on", location.href);

  // Visual cue that listener is active
  try {
    const banner = document.createElement('div');
    banner.textContent = "Frisch listener active";
    banner.style.cssText = "position:fixed;right:8px;bottom:8px;background:#0b8b3b;color:#fff;padding:6px 10px;border-radius:8px;font:12px/1.2 sans-serif;z-index:99999;opacity:.9";
    document.documentElement.appendChild(banner);
    setTimeout(()=>banner.remove(), 3000);
  } catch(e){}

  window.addEventListener("message", (e)=>{
    // Only process messages from your kiosk page's origin and the VC origin itself (in case of redirects)
    const allowed = new Set([
      "https://school120.github.io",
      "https://checkin.veracross.com"
    ]);
    if (!allowed.has(e.origin)) return;

    const data = e.data || {};
    if (data.type !== "frisch_legacy_id") return;

    const id = String(data.id || "").trim();
    if (!id) return;

    try {
      const field = document.getElementById("legacy_id");
      if (!field) { console.warn("[Frisch VC Injector] #legacy_id not found"); return; }
      field.value = id;

      const form = field.form;
      if (form) {
        form.submit();
      } else {
        console.warn("[Frisch VC Injector] form not found for #legacy_id");
      }
    } catch(err) {
      console.error("[Frisch VC Injector] error", err);
    }
  }, false);
})();
