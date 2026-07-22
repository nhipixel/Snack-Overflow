/* Shared app shell — injects nav + footer, persists target and
   basket to localStorage, and provides a global toast helper. */

const DEFAULT_TARGET = {kcal:2210, protein:117, carbs:298, fat:61};

const STORE = {
  get target(){ try{ return JSON.parse(localStorage.getItem('so_target')) || DEFAULT_TARGET; }catch(e){ return DEFAULT_TARGET; } },
  set target(v){ localStorage.setItem('so_target', JSON.stringify(v)); },
  get basket(){ try{ return JSON.parse(localStorage.getItem('so_basket')) || []; }catch(e){ return []; } },
  set basket(v){ localStorage.setItem('so_basket', JSON.stringify(v)); },
  get basketQty(){ try{ return JSON.parse(localStorage.getItem('so_basket_qty')) || {}; }catch(e){ return {}; } },
  set basketQty(v){ localStorage.setItem('so_basket_qty', JSON.stringify(v)); },
};

const NAV_TABS = [
  ['targets','Daily Targets'],
  ['search','Search'],
  ['recipe','Recipe'],
  ['pantry','Pantry'],
];

function renderChrome(){
  const page = document.body.dataset.page || '';
  const nav = document.getElementById('nav');
  if(nav){
    nav.innerHTML = `<div class="nav-in">
      <a class="logo" href="index.html" aria-label="Snack Overflow home"><span class="mark" aria-hidden="true">{}</span>Snack<b>Overflow</b></a>
      <div class="tabs" role="navigation" aria-label="Primary">
        ${NAV_TABS.map(([id,label])=>`<a href="${id}.html"${page===id?' class="on" aria-current="page"':''}>${label}</a>`).join('')}
      </div>
      <span class="noacct">✓ No account needed</span>
    </div>`;
  }
  const foot = document.getElementById('foot');
  if(foot){
    foot.innerHTML = `<div class="wrap" style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <span>SNACK OVERFLOW · Diet Manager</span>
      <span class="foot-r">Plan meals around your numbers</span>
    </div>`;
  }
}

/* ---- toast (optional {actionLabel, onAction} shows an undo button) ---- */
let _toastT;
function toast(msg, opts){
  let t = document.getElementById('toast');
  if(!t){ t = document.createElement('div'); t.id='toast'; document.body.appendChild(t); }
  t.innerHTML = `<span class="ic" aria-hidden="true">✓</span><span id="toastmsg"></span>`;
  document.getElementById('toastmsg').textContent = msg;
  if(opts && opts.actionLabel){
    const b = document.createElement('button');
    b.className = 'toast-action';
    b.textContent = opts.actionLabel;
    b.onclick = () => { opts.onAction(); t.classList.remove('show'); };
    t.appendChild(b);
  }
  t.classList.add('show');
  clearTimeout(_toastT);
  _toastT = setTimeout(()=>t.classList.remove('show'), opts && opts.actionLabel ? 4500 : 2600);
}

document.addEventListener('DOMContentLoaded', renderChrome);
