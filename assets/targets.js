/* Daily target calculator (Mifflin-St Jeor BMR).
   Every input recalculates instantly; age clamped 0–120.
   Results saved to localStorage for other pages. */
let statState = {sex:'female', act:1.55, goal:0};

function pick(btn,key){
  btn.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  if(key==='sex')  statState.sex = btn.dataset.sex;
  if(key==='act')  statState.act = +btn.dataset.f;
  if(key==='goal') statState.goal = +btn.dataset.d;
  calc();
}
function bump(id,d){
  const el = document.getElementById(id);
  el.value = Math.max(0, Math.min(120, (+el.value||0)+d));   // constraint
  calc();
}
function setm(g,gv,p,pv,bar,bw){
  document.getElementById(g).textContent=gv;
  document.getElementById(p).textContent=pv;
  document.getElementById(bar).style.width=bw+'%';
}
function setFill(id,min,max){
  const el=document.getElementById(id);
  const pct=(el.value-min)/(max-min)*100;
  el.style.background=`linear-gradient(90deg,var(--persimmon) ${pct}%,var(--hair) ${pct}%)`;
}
function calc(){
  const age=Math.max(0,Math.min(120,+document.getElementById('age').value||0));
  const w=+document.getElementById('weight').value, h=+document.getElementById('height').value;
  document.getElementById('wv').textContent=w+' kg';
  document.getElementById('hv').textContent=h+' cm';
  setFill('weight',35,160); setFill('height',130,215);

  let bmr=10*w+6.25*h-5*age+(statState.sex==='male'?5:-161);
  let target=Math.max(1000,Math.round((bmr*statState.act+statState.goal)/10)*10);
  let protein=Math.round(w*1.8), fat=Math.round(target*0.25/9);
  let carbs=Math.max(0,Math.round((target-protein*4-fat*9)/4));
  let pk=protein*4, ck=carbs*4, fk=fat*9, tot=pk+ck+fk||1;

  document.getElementById('kcal').innerHTML=target.toLocaleString()+'<small>kcal</small>';
  setm('pg',protein+' g','pp',Math.round(pk/tot*100)+'%','pbar',pk/tot*100);
  setm('cg',carbs+' g','cp',Math.round(ck/tot*100)+'%','cbar',ck/tot*100);
  setm('fg',fat+' g','fp',Math.round(fk/tot*100)+'%','fbar',fk/tot*100);

  STORE.target = {kcal:target, protein, carbs, fat};   // persist for other pages
}
calc();
