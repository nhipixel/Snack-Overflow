/* Pantry — add ingredients by dragging or tapping to build a basket.
   Provides real-time recipe matching and enforces constraints
   (Generate disabled until >=1 item; "coming soon" items un-addable).
   Basket persists to localStorage for the Results page. */

const QTY_CYCLE = ['low','medium','high'];
let lastAddedName = null;   // drives the one-time "just added" flash

/* ---- render the shelves ----------------------------------- */
function renderShelves(){
  const basket = STORE.basket;
  document.getElementById('shelves').innerHTML = Object.entries(PANTRY).map(([cat,items])=>`
    <div class="shelf" data-cat="${cat}">
      <h4>${cat} <span class="cnt">${items.filter(i=>!i.soon).length} items</span></h4>
      <div class="items">
      ${items.map(it=>{
        if(it.soon){
          return `<button class="item out" data-n="${it.n}" onclick="soonInfo(this.dataset.n)" title="Coming soon — not in our catalogue yet">${it.e} ${it.n} <span class="hint" style="font-size:10px">soon</span></button>`;
        }
        const added = basket.includes(it.n);
        const flash = added && it.n===lastAddedName ? ' just-added' : '';
        return `<button class="item ${added?'added':''}${flash}" data-n="${it.n}" draggable="${added?'false':'true'}"
            ${added?'disabled aria-label="'+it.n+' — already in basket" title="Already in your basket — remove it there to add it again"':'aria-label="Add '+it.n+'"'}
            ondragstart="dragStart(event)" onclick="addItem(this.dataset.n)">
            ${it.e} ${it.n}${added?'':' <span class="plus" aria-hidden="true">+</span>'}</button>`;
      }).join('')}
      </div>
    </div>`).join('');
  applyFilter();   // keep any active search after a re-render
}

/* ---- basket ------------------------------------------------ */
function renderBasket(){
  const basket = STORE.basket;
  const qty = STORE.basketQty;
  document.getElementById('bcount').textContent = basket.length + (basket.length===1?' item':' items');
  document.getElementById('basketph').style.display = basket.length ? 'none' : 'grid';
  document.getElementById('basketitems').innerHTML = basket.map(n=>{
    const amt = qty[n] || 'medium';
    return `<span class="bchip" data-n="${n}">${emojiFor(n)} ${n}
      <button class="qty-btn" aria-label="Amount of ${n}: ${amt}. Tap to change." title="Tap to change amount" onclick="cycleQty('${n}')">${amt}</button>
      <button aria-label="Remove ${n}" onclick="removeItem('${n}')">×</button></span>`;
  }).join('');

  document.getElementById('genbtn').disabled   = basket.length===0;   // constraint
  document.getElementById('clearbtn').disabled = basket.length===0;

  const note = document.getElementById('gennote');
  if(basket.length===0){
    note.textContent = 'Add at least 1 ingredient to generate.';
    note.classList.remove('ok');
  } else {
    note.textContent = `Ready — ${basket.length} ingredient${basket.length===1?'':'s'} in your basket.`;
    note.classList.add('ok');
  }
}

/* ---- live recipe-match preview (feedback) ------------------ */
function updatePreview(){
  const basket = STORE.basket;
  const tx = document.getElementById('previewTx');
  if(!basket.length){
    tx.innerHTML = '<span class="muted">Add ingredients to see what you can cook.</span>';
    return;
  }
  const matches = matchRecipes(basket);
  const now = matches.filter(m=>m.missing.length===0);
  const one = matches.filter(m=>m.missing.length===1);
  if(now.length){
    tx.innerHTML = `You can make <b>${now.length}</b> recipe${now.length===1?'':'s'} right now`
      + (one.length ? ` <span class="muted">· ${one.length} more with 1 extra item</span>` : '');
  } else if(one.length){
    const best = one[0];
    tx.innerHTML = `<span class="muted">Almost —</span> add <b>${best.missing[0]}</b> to make <b>${best.n}</b>`;
  } else {
    const best = matches[0];
    tx.innerHTML = `<span class="muted">Closest match:</span> <b>${best.n}</b> <span class="muted">(you have ${best.have.length}/${best.needs.length})</span>`;
  }
}

/* ---- mutations -------------------------------------------- */
function addItem(n){
  const b = STORE.basket;
  if(b.includes(n)) return;
  b.push(n); STORE.basket = b;
  const q = STORE.basketQty; q[n] = 'medium'; STORE.basketQty = q;
  lastAddedName = n;
  refresh();
  setTimeout(()=>{ lastAddedName = null; }, 650);   // one-time flash, not on later re-renders
}
function removeItem(n){
  STORE.basket = STORE.basket.filter(x=>x!==n);
  const q = STORE.basketQty; delete q[n]; STORE.basketQty = q;
  refresh();
}
function cycleQty(n){
  const q = STORE.basketQty;
  const cur = q[n] || 'medium';
  q[n] = QTY_CYCLE[(QTY_CYCLE.indexOf(cur)+1) % QTY_CYCLE.length];
  STORE.basketQty = q;
  renderBasket();
}
function confirmClear(){
  const basket = STORE.basket;
  if(!basket.length) return;
  if(basket.length===1){ doClear(); return; }   // trivial to undo (re-add one item) — skip the interruption
  document.getElementById('clearlede').textContent =
    `This removes all ${basket.length} ingredients from your basket. You'll need to re-add them from the shelves — this can't be undone.`;
  document.getElementById('clearOverlay').classList.add('on');
}
function closeClearModal(){ document.getElementById('clearOverlay').classList.remove('on'); }
function doClear(){
  const count = STORE.basket.length;
  STORE.basket = []; STORE.basketQty = {};
  closeClearModal();
  refresh();
  toast(`Cleared ${count} ingredient${count===1?'':'s'}`);
}
function soonInfo(n){ toast(`${n} is coming soon — not available to add yet.`); }
function refresh(){ renderShelves(); renderBasket(); updatePreview(); }

/* ---- search filter ---------------------------------------- */
function applyFilter(){
  const q = (document.getElementById('pantryq').value||'').toLowerCase().trim();
  document.querySelectorAll('#shelves .item').forEach(it=>{
    it.style.display = it.dataset.n.toLowerCase().includes(q) ? '' : 'none';
  });
  document.querySelectorAll('#shelves .shelf').forEach(sh=>{
    const any = [...sh.querySelectorAll('.item')].some(i=>i.style.display!=='none');
    sh.style.display = any ? '' : 'none';
  });
}
function filterPantry(){ applyFilter(); }

/* ---- drag + drop (with tap fallback in addItem) ----------- */
let dragN = null;
function dragStart(e){ dragN = e.target.dataset.n; e.dataTransfer.effectAllowed='copy'; }
function dragOver(e){ e.preventDefault(); document.getElementById('basket').classList.add('drag'); }
function dragLeave(e){ document.getElementById('basket').classList.remove('drag'); }
function dropItem(e){ e.preventDefault(); document.getElementById('basket').classList.remove('drag'); if(dragN) addItem(dragN); dragN=null; }

/* ---- go to results ---------------------------------------- */
function generate(){
  if(!STORE.basket.length) return;
  const btn = document.getElementById('genbtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span>Generating…';
  setTimeout(()=>{ location.href = 'result.html'; }, 450);   // acknowledge the click before navigating
}

/* ---- clear-confirm modal dismissal ------------------------- */
document.getElementById('clearOverlay').addEventListener('click', e=>{ if(e.target.id==='clearOverlay') closeClearModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeClearModal(); });

refresh();
