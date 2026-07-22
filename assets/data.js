/* Shared data layer — recipes, ingredients, pantry.
   All in-memory; no backend database. */

/* Searchable recipes with ingredient requirements for matching.
   `img` links to a freely-licensed Wikimedia Commons photo; `e` is
   kept as an emoji fallback for alt text / no-connection states. */
const RECIPES = [
  {n:'Creamy Tuscan Pasta',     e:'🍝', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Simple_pasta_with_creamy_sauce.jpg?width=500', kc:640, diet:['vegetarian'],                       meal:'dinner',    time:25, q:'pasta tuscan creamy', needs:['Pasta','Spinach','Parmesan','Tomato']},
  {n:'Crispy Tofu Power Bowl',  e:'🥗', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Rice_bowl_topped_with_tofu_(7960798384).jpg?width=500', kc:520, diet:['vegan','high-protein','gluten-free'],meal:'lunch',     time:20, q:'tofu bowl rice',      needs:['Tofu','Rice','Broccoli']},
  {n:'Greek Yogurt Berry Parfait',e:'🍓',img:'https://commons.wikimedia.org/wiki/Special:FilePath/Berry_Parfait,_Chick-fil%E2%80%90A,_Northern_Blvd.jpg?width=500', kc:280, diet:['vegetarian','high-protein','gluten-free'],meal:'breakfast',time:5,q:'yogurt berry parfait',needs:['Greek yogurt']},
  {n:'Chickpea Shakshuka',      e:'🍳', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Shakshuka_by_Calliopejen1.jpg?width=500', kc:430, diet:['vegetarian','gluten-free'],          meal:'breakfast', time:25, q:'egg chickpea shakshuka',needs:['Chickpeas','Tomato','Eggs','Bell pepper']},
  {n:'Sesame Salmon &amp; Greens',e:'🐟',img:'https://commons.wikimedia.org/wiki/Special:FilePath/Salmon_dish_2.jpg?width=500', kc:560, diet:['high-protein','gluten-free'],         meal:'dinner',    time:30, q:'salmon fish greens',  needs:['Salmon','Spinach','Rice']},
  {n:'15-Min Veggie Stir-Fry',  e:'🥦', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Stir_fried_mixed_vegetables.jpg?width=500', kc:380, diet:['vegan'],                             meal:'dinner',    time:15, q:'stir fry veggie noodle',needs:['Tofu','Broccoli','Bell pepper']},
  {n:'Garden Omelette',         e:'🍳', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Vegetable_Omelette_with_slice_of_bread_and_chutney.JPG?width=500', kc:290, diet:['vegetarian','high-protein','gluten-free'],meal:'breakfast',time:12,q:'omelette egg spinach',needs:['Eggs','Spinach','Mushroom','Tomato']},
  {n:'Veggie Fried Rice',       e:'🍚', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Malapascua,_Vegetable_fried_rice,_Philippines.jpg?width=500', kc:440, diet:['vegetarian'],                        meal:'dinner',    time:18, q:'fried rice egg',      needs:['Rice','Eggs','Broccoli','Bell pepper']},
  {n:'Loaded Avocado Toast',    e:'🥑', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Avocado_toast_with_sesame_seeds.jpg?width=500', kc:330, diet:['vegetarian'],                        meal:'breakfast', time:8,  q:'avocado toast bread',  needs:['Bread','Avocado','Eggs']},
  {n:'Mushroom Quinoa Bowl',    e:'🍄', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Kale_and_Mushroom_Quinoa_(4257979482).jpg?width=500', kc:410, diet:['vegan','gluten-free'],               meal:'lunch',     time:22, q:'mushroom quinoa bowl', needs:['Quinoa','Mushroom','Spinach']},
];

/* Task 3 — the fixed demo recipe's ingredient list + valid swaps */
const INGREDIENTS = [
  {id:'pasta',e:'🍝',n:'Pasta',sub:'2 servings',kc:280,swap:false},
  {id:'cream',e:'🥛',n:'Heavy cream',sub:'½ cup',kc:200,swap:true,kind:'cream'},
  {id:'parm', e:'🧀',n:'Parmesan',sub:'¼ cup',kc:90,swap:true,kind:'cheese'},
  {id:'spin', e:'🥬',n:'Spinach',sub:'2 cups',kc:15,swap:false},
  {id:'tom',  e:'🍅',n:'Sun-dried tomatoes',sub:'⅓ cup',kc:35,swap:false},
  {id:'oil',  e:'🫒',n:'Olive oil + garlic',sub:'1 tbsp',kc:120,swap:false},
];
const ALTS = {
  cream:[{e:'🥥',n:'Coconut cream',sub:'½ cup',kc:140},{e:'🌰',n:'Cashew cream',sub:'½ cup',kc:120},{e:'🥛',n:'Oat cream',sub:'½ cup',kc:90}],
  cheese:[{e:'🌱',n:'Nutritional yeast',sub:'2 tbsp',kc:40},{e:'🧀',n:'Vegan parmesan',sub:'¼ cup',kc:70}],
};

/* Pantry shelves, ordered the way you'd actually scan a fridge:
   produce (crisper) → protein (mid shelf) → dairy (door) → dry
   goods last, since grains live in the cupboard, not the fridge.
   Items marked `soon` cannot be added. */
const PANTRY = {
  'Produce':      [{n:'Spinach',e:'🥬'},{n:'Tomato',e:'🍅'},{n:'Broccoli',e:'🥦'},{n:'Bell pepper',e:'🫑'},{n:'Avocado',e:'🥑'},{n:'Mushroom',e:'🍄'}],
  'Proteins':     [{n:'Tofu',e:'🧊'},{n:'Eggs',e:'🥚'},{n:'Chicken',e:'🍗'},{n:'Chickpeas',e:'🫘'},{n:'Salmon',e:'🐟',soon:true}],
  'Dairy & alt':  [{n:'Greek yogurt',e:'🥛'},{n:'Parmesan',e:'🧀'},{n:'Oat milk',e:'🥥'}],
  'Grains':       [{n:'Rice',e:'🍚'},{n:'Pasta',e:'🍝'},{n:'Quinoa',e:'🌾'},{n:'Bread',e:'🍞'}],
};

/* look up an ingredient's emoji by name (used by basket chips + results) */
function emojiFor(name){
  for(const items of Object.values(PANTRY)){
    const f = items.find(i=>i.n===name);
    if(f) return f.e;
  }
  return '🥄';
}

/* Match a basket of ingredient names against every recipe.
   Returns recipes sorted by coverage (how much of the recipe you
   already have), each annotated with have/missing lists. */
function matchRecipes(basket){
  const set = new Set(basket);
  return RECIPES.map(r=>{
    const have = r.needs.filter(n=>set.has(n));
    const missing = r.needs.filter(n=>!set.has(n));
    const coverage = r.needs.length ? have.length/r.needs.length : 0;
    return {...r, have, missing, coverage, pct:Math.round(coverage*100)};
  }).sort((a,b)=> b.coverage-a.coverage || a.missing.length-b.missing.length || a.kc-b.kc);
}
