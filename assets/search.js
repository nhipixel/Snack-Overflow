/* Faceted search with live-updating filters and result count. */
let filters = {diet:new Set(), meal:new Set(), time:new Set()};

function toggleChip(btn){
  const f=btn.closest('.chips').dataset.facet, v=btn.dataset.v;
  if(filters[f].has(v)){ filters[f].delete(v); btn.classList.remove('on'); }
  else { filters[f].add(v); btn.classList.add('on'); }
  renderCards();
}
function clearFilters(){
  for(const k in filters) filters[k].clear();
  document.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));
  document.getElementById('searchq').value='';
  document.getElementById('calslider').value=900;
  renderCards();
}
function removeActive(v){
  for(const k in filters) filters[k].delete(v);
  document.querySelectorAll('.chip').forEach(c=>{ if(c.dataset.v===v) c.classList.remove('on'); });
  renderCards();
}
function renderCards(){
  const q=document.getElementById('searchq').value.toLowerCase().trim();
  const calmax=+document.getElementById('calslider').value;
  document.getElementById('calmax').textContent=calmax;

  let list=RECIPES.filter(r=>{
    if(r.kc>calmax) return false;
    if(filters.diet.size && ![...filters.diet].every(d=>r.diet.includes(d))) return false;
    if(filters.meal.size && !filters.meal.has(r.meal)) return false;
    if(filters.time.size){
      const ok=(filters.time.has('under15')&&r.time<=15)||(filters.time.has('under30')&&r.time<=30);
      if(!ok) return false;
    }
    if(q && !(r.n.toLowerCase().includes(q)||r.q.includes(q))) return false;
    return true;
  });

  const wrap=document.getElementById('cards'), empty=document.getElementById('emptystate');
  document.getElementById('rescount').textContent=list.length;

  const all=[...filters.diet,...filters.meal,...filters.time];
  const ac=document.getElementById('activechips');
  if(all.length||q||calmax<900){
    ac.innerHTML=all.map(v=>`<button class="chip on" onclick="removeActive('${v}')">${v} <span class="x">×</span></button>`).join('')
      +(calmax<900?`<span class="lbl">≤ ${calmax} kcal</span>`:'');
  } else ac.innerHTML='<span class="lbl">No filters — showing all</span>';

  if(!list.length){ wrap.style.display='none'; empty.style.display='block'; return; }
  wrap.style.display='grid'; empty.style.display='none';
  wrap.innerHTML=list.map(r=>`<a class="rcard" href="recipe.html">
    <div class="img" aria-hidden="true">${r.e}</div><div class="cb"><h3>${r.n}</h3>
    <div class="kc">${r.kc} kcal</div>
    <div class="tags">${r.diet.map(d=>`<span class="tg">${d}</span>`).join('')}<span class="tg">${r.meal}</span><span class="tg">${r.time}m</span></div>
    </div></a>`).join('');
}
renderCards();
