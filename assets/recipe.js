/* Recipe detail with ingredient swap.
   Modal shows valid substitutes and calorie delta; swapping
   recalculates totals instantly with feedback. */
let ingredients = INGREDIENTS.map(i=>({...i}));   // work on a copy
let swapId = null;

const SWAP_SVG = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px"><polyline points="17 2 21 6 17 10"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 22 3 18 7 14"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>';

function renderIng(){
  document.getElementById('inglist').innerHTML = ingredients.map(i=>`<div class="ing">
    <div class="em" aria-hidden="true">${i.e}</div>
    <div class="nm">${i.n}<small>${i.sub}</small></div>
    <div class="kc">${i.kc} kcal</div>
    ${i.swap?`<button class="swapbtn ${i.swapped?'swapped':''}" onclick="openSwap('${i.id}')">${i.swapped?'✓ Swapped':SWAP_SVG+' Swap'}</button>`:''}
  </div>`).join('');
  const total = ingredients.reduce((s,i)=>s+i.kc,0);
  document.getElementById('rdtotal').textContent = total+' kcal';
  document.getElementById('rdkcal').textContent  = total+' kcal';
  const target = STORE.target.kcal;
  const pct = Math.round(total/target*100);
  document.getElementById('rddelta').textContent = `≈ ${pct}% of your ${target.toLocaleString()} target`;
}
function openSwap(id){
  swapId=id;
  const ing=ingredients.find(i=>i.id===id);
  document.getElementById('swaptarget').textContent=ing.n.toLowerCase();
  document.getElementById('altlist').innerHTML = ALTS[ing.kind].map((a,idx)=>{
    const d=a.kc-ing.kc; const cls=d<=0?'down':'up'; const sign=d>0?'+':'';
    return `<button class="alt" onclick="doSwap(${idx})"><div class="em" aria-hidden="true">${a.e}</div><div class="nm">${a.n}<small>${a.sub}</small></div><div class="d ${cls}">${sign}${d} kcal</div></button>`;
  }).join('');
  const ov=document.getElementById('overlay');
  ov.classList.add('on');
  ov.querySelector('.alt')?.focus();
}
function doSwap(idx){
  const ing=ingredients.find(i=>i.id===swapId);
  const a=ALTS[ing.kind][idx];
  ing.e=a.e; ing.n=a.n; ing.sub=a.sub; ing.kc=a.kc; ing.swapped=true;
  closeModal(); renderIng(); toast(`Swapped to ${a.n}`);
}
function closeModal(){ document.getElementById('overlay').classList.remove('on'); }

document.getElementById('overlay').addEventListener('click',e=>{ if(e.target.id==='overlay') closeModal(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); });
renderIng();
