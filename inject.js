// Runs on https://checkin.veracross.com/frisch/kiosk/soutoffice after you click the bookmarklet
(function () {
  function $(s){return document.querySelector(s)}
  function csrf(){ const m = $('meta[name="csrf-token"]'); return m ? m.content : ''; }

  // tiny “active” toast
  try{
    const b=document.createElement('div');
    b.textContent='Frisch listener active';
    b.style.cssText='position:fixed;right:8px;bottom:8px;background:#0b8b3b;color:#fff;padding:6px 10px;border-radius:8px;font:12px/1.2 sans-serif;z-index:99999;opacity:.9';
    document.documentElement.appendChild(b); setTimeout(()=>b.remove(),3000);
  }catch{}

  async function submitLegacyId(id){
    const token = csrf();
    if(!token) throw new Error('No CSRF token');
    const body = new URLSearchParams({
      legacy_id: id,
      kiosk_type: '5',
      check_in_method: '3',
      kiosk: '9'
    });

    const res = await fetch('/frisch/checkin/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-CSRF-Token': token,
        'X-Requested-With': 'XMLHttpRequest'
      },
      body,
      credentials: 'same-origin',
      redirect: 'follow',
      cache: 'no-store'
    });

    if(!res.ok) throw new Error('HTTP '+res.status);
    return await res.text(); // or .json() if endpoint returns JSON
  }

  window.addEventListener('message', async (e) => {
    // only accept from your GitHub Pages or same origin
    const okOrigins = new Set(['https://school120.github.io','https://checkin.veracross.com']);
    if(!okOrigins.has(e.origin)) return;
    const d = e.data || {};
    if(d.type !== 'frisch_legacy_id') return;

    try{
      await submitLegacyId(String(d.id||'').trim());
      e.source && e.source.postMessage({type:'frisch_ok', id:d.id}, e.origin);
    }catch(err){
      e.source && e.source.postMessage({type:'frisch_err', id:d.id, error:String(err)}, e.origin);
    }
  }, false);
})();
