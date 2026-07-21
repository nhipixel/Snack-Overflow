/* Pantry — add ingredients by dragging or tapping to build a basket.
   Provides real-time recipe matching and enforces constraints
   (Generate disabled until >=1 item; "coming soon" items un-addable).
   Basket persists to localStorage for the Results page. */

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
        return `<button class="item ${added?'added':''}" data-n="${it.n}" draggable="${added?'false':'true'}"
            ${added?'disabled aria-label="'+it.n+' — already in basket"':'aria-label="Add '+it.n+'"'}
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
  document.getElementById('bcount').textContent = basket.length + (basket.length===1?' item':' items');
  document.getElementById('basketph').style.display = basket.length ? 'none' : 'grid';
  document.getElementById('basketitems').innerHTML = basket.map(n=>
    `<span class="bchip" data-n="${n}">${emojiFor(n)} ${n}<button aria-label="Remove ${n}" onclick="removeItem('${n}')">×</button></span>`
  ).join('');

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
  if(!b.includes(n)){ b.push(n); STORE.basket = b; refresh(); }
}
function removeItem(n){ STORE.basket = STORE.basket.filter(x=>x!==n); refresh(); }
function clearBasket(){ if(STORE.basket.length){ STORE.basket = []; refresh(); toast('Basket cleared'); } }
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
function generate(){ if(STORE.basket.length) location.href = 'result.html'; }

refresh();
