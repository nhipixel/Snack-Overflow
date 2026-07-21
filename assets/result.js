/* Results page — reads basket from Pantry and computes best-match recipes
   ranked by ingredient coverage, with have/missing lists. */

/* if someone lands here directly, seed a sensible demo basket */
let basket = STORE.basket;
if(!basket.length){ basket = ['Tofu','Rice','Broccoli']; STORE.basket = basket; }

function fillResult(){
  const matches = matchRecipes(basket);
  const best = matches[0];

  document.getElementById('loadwrap').style.display='none';
  document.getElementById('resultbody').style.display='block';

  document.getElementById('matchImg').textContent = best.e;
  document.getElementById('matchName').innerHTML = best.n;
  document.getElementById('matchPills').innerHTML =
    `<span class="pill kc">${best.kc} kcal</span>`
    + `<span class="pill">⏱ ${best.time} min</span>`
    + best.diet.map(d=>`<span class="pill">${d}</span>`).join('');

  document.getElementById('matchpct').textContent = best.pct+'%';
  document.getElementById('matchbar').style.width = best.pct+'%';
  document.getElementById('matchbadge').textContent =
    `Best match · ${best.have.length}/${best.needs.length} ingredients`;

  document.getElementById('haves').innerHTML =
    best.have.map(n=>`<span class="have y">✓ ${n}</span>`).join('')
    + best.missing.map(n=>`<span class="have n">+ buy ${n}</span>`).join('');

  document.getElementById('altcards').innerHTML = matches.slice(1,4).map(r=>
    `<a class="rcard" href="recipe.html"><div class="img" aria-hidden="true">${r.e}</div>
      <div class="cb"><h3>${r.n}</h3><div class="kc">${r.kc} kcal</div>
      <div class="tags"><span class="tg">have ${r.have.length}/${r.needs.length}</span></div></div></a>`
  ).join('');

  toast(`Found ${matches.filter(m=>m.missing.length<=1).length} recipes you can make`);
}

/* brief processing state, then reveal (perceived-responsiveness feedback) */
setTimeout(fillResult, 1100);
