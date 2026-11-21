// ITEMS below is FICTIONAL demo data (dataset 'demo'). REAL_ITEMS further down is information the restaurants
// themselves published (dataset 'real'), with the source link and the date we read it.
export const SEED_VERSION = 2;

// Which questions each food category asks.
export const CATEGORIES = {
  fries:  { label: 'Fries',  dims: ['cut', 'texture', 'seasoning', 'topping'] },
  burger: { label: 'Burgers', dims: ['cheese', 'sauce', 'bun'] },
  drink:  { label: 'Drinks', dims: ['ice', 'fizz'] },
};

export const DIMENSIONS = {
  cut:       { label: 'Cut',        values: ['shoestring', 'standard', 'thick', 'waffle', 'crinkle'] },
  texture:   { label: 'Texture',    values: ['crispy', 'soft'] },
  seasoning: { label: 'Seasoning',  values: ['none', 'salt only', 'spiced'] },
  topping:   { label: 'Topping',    values: ['none', 'cheese', 'chili'] },
  cheese:    { label: 'Cheese',     values: ['none', 'american'] },
  sauce:     { label: 'Sauce',      values: ['ketchup only', 'special sauce', 'mustard'] },
  bun:       { label: 'Bun',        values: ['plain', 'sesame'] },
  ice:       { label: 'Ice',        values: ['none', 'light', 'regular'] },
  fizz:      { label: 'Fizz',       values: ['still', 'sparkling'] },
};

// Evidence kinds shown in the "why?" panel. Every kind here is a fictional demo fixture.
export const EVIDENCE_KINDS = {
  menu: 'Menu listing (fictional demo)',
  report: 'Diner report (fictional demo)',
  official: "The restaurant's own published information",
  secondary: 'Third-party report (not the restaurant)',
};

// claims: only the dimensions we "know". A missing dimension is UNKNOWN, never assumed.
// evidence: omit for "no evidence on file". fryer: dedicated | shared | (omit = unknown)
export const ITEMS = [
  // ---- fries
  { id: 'f01', cat: 'fries', name: 'Plain Jane Shoestrings', place: 'Plain Jane Diner',
    claims: { cut: 'shoestring', texture: 'crispy', seasoning: 'none', topping: 'none' },
    evidence: { kind: 'menu', checked: '2026-11-12', note: 'Demo menu says "unsalted on request"' }, fryer: 'dedicated' },
  { id: 'f02', cat: 'fries', name: 'Checkerboard Classic Fries', place: 'Checkerboard Grill',
    claims: { cut: 'standard', texture: 'crispy', seasoning: 'salt only', topping: 'none' },
    evidence: { kind: 'menu', checked: '2026-11-14', note: 'Demo menu lists salt only' }, fryer: 'shared' },
  { id: 'f03', cat: 'fries', name: 'Waffle Wonders', place: 'Checkerboard Grill',
    claims: { cut: 'waffle', texture: 'crispy', seasoning: 'spiced', topping: 'none' },
    evidence: { kind: 'menu', checked: '2026-11-14', note: 'Demo menu lists house spice mix' }, fryer: 'shared' },
  { id: 'f04', cat: 'fries', name: 'Chili Cheese Mountain', place: 'Ketchup & Co.',
    claims: { cut: 'thick', texture: 'soft', seasoning: 'spiced', topping: 'chili' },
    evidence: { kind: 'menu', checked: '2026-11-10', note: 'Demo menu lists chili topping' }, fryer: 'shared' },
  { id: 'f05', cat: 'fries', name: 'Mystery Basket Fries', place: 'Ketchup & Co.',
    claims: { cut: 'standard', texture: 'crispy' },
    evidence: { kind: 'report', checked: '2026-11-08', note: 'One diner report; seasoning not stated' } },
  { id: 'f06', cat: 'fries', name: 'Crinkle Crunch', place: 'Plain Jane Diner',
    claims: { cut: 'crinkle', texture: 'crispy', seasoning: 'none', topping: 'none' },
    evidence: { kind: 'report', checked: '2026-11-09', note: 'Diner report says plain' }, fryer: 'dedicated' },
  { id: 'f07', cat: 'fries', name: 'Soft Steak Fries', place: 'Sunny Side Counter',
    claims: { cut: 'thick', texture: 'soft', seasoning: 'salt only', topping: 'none' },
    evidence: { kind: 'menu', checked: '2026-11-11', note: 'Demo menu' } },
  { id: 'f08', cat: 'fries', name: 'Back-of-Menu Fries', place: 'Sunny Side Counter',
    claims: { cut: 'shoestring', seasoning: 'none' } },
  { id: 'f09', cat: 'fries', name: 'Thin & Crispy (unsalted on request)', place: 'Sunny Side Counter',
    claims: { cut: 'shoestring', texture: 'crispy', seasoning: 'salt only', topping: 'none' },
    requests: { seasoning: ['none'] },
    evidence: { kind: 'menu', checked: '2026-11-13', note: 'Demo menu lists unsalted option' }, fryer: 'shared' },
  // ---- burgers
  { id: 'b01', cat: 'burger', name: 'Ketchup-Only Cheeseburger', place: 'Ketchup & Co.',
    claims: { cheese: 'american', sauce: 'ketchup only', bun: 'sesame' },
    evidence: { kind: 'menu', checked: '2026-11-10', note: 'Demo menu' }, fryer: 'dedicated' },
  { id: 'b02', cat: 'burger', name: 'Plain Hamburger', place: 'Plain Jane Diner',
    claims: { cheese: 'none', sauce: 'ketchup only', bun: 'plain' },
    evidence: { kind: 'menu', checked: '2026-11-12', note: 'Demo menu' } },
  { id: 'b03', cat: 'burger', name: 'Special Sauce Stack', place: 'Checkerboard Grill',
    claims: { cheese: 'american', sauce: 'special sauce', bun: 'sesame' },
    evidence: { kind: 'menu', checked: '2026-11-14', note: 'Demo menu' } },
  { id: 'b04', cat: 'burger', name: 'Mustard Melt', place: 'Sunny Side Counter',
    claims: { cheese: 'american', sauce: 'mustard', bun: 'plain' },
    evidence: { kind: 'report', checked: '2026-11-07', note: 'Diner report' } },
  { id: 'b05', cat: 'burger', name: 'Mystery Slider', place: 'Sunny Side Counter',
    claims: { bun: 'plain' } },
  // ---- drinks
  { id: 'd01', cat: 'drink', name: 'Cola, No Ice', place: 'Plain Jane Diner',
    claims: { ice: 'none', fizz: 'sparkling' },
    evidence: { kind: 'menu', checked: '2026-11-12', note: 'Demo menu: "no ice on request"' } },
  { id: 'd02', cat: 'drink', name: 'Lemonade, Regular Ice', place: 'Checkerboard Grill',
    claims: { ice: 'regular', fizz: 'still' },
    evidence: { kind: 'menu', checked: '2026-11-14', note: 'Demo menu' } },
  { id: 'd03', cat: 'drink', name: 'Mystery Soda', place: 'Ketchup & Co.',
    claims: { fizz: 'sparkling' },
    evidence: { kind: 'report', checked: '2026-11-06', note: 'Ice level not stated' } },
  { id: 'd04', cat: 'drink', name: 'Light-Ice Iced Tea', place: 'Sunny Side Counter',
    claims: { ice: 'light', fizz: 'still' } },
];

// Preset profiles for the demo buttons. Users can edit every value.
export const PRESETS = {
  fries:  { 'Just fries, I said plain': { cut: 'shoestring', texture: 'crispy', seasoning: 'none', topping: 'none' } },
  burger: { 'Only ketchup': { sauce: 'ketchup only' } },
  drink:  { 'No ice': { ice: 'none' } },
};

// ---- REAL data: read from each restaurant's own pages on 2026-11-21. Only what was actually published is
// recorded; everything else is left out so it shows as UNKNOWN. Recipes and kitchens vary by location and change over time.
const READ_ON = '2026-11-21';
export const REAL_ITEMS = [
  { id: 'r01', cat: 'fries', name: 'Five Guys Style Fries', place: 'Five Guys',
    claims: { seasoning: 'salt only', topping: 'none' },
    fryerSource: { kind: 'official', url: 'https://www.fiveguys.co.uk/nutritional-allergy-information/', note: 'UK site only: fries fried in fryers that cook nothing else. No US statement found, so the US fryer stays unknown. Peanut oil is an allergen in its own right.' },
    evidence: { kind: 'official', checked: READ_ON,
      url: 'https://fiveguys.com/-/media/public-site/files/allergen-ingredients-and-nutrition-info/five-guys-us-nutrition--allergen-guide-english.pdf',
      note: 'US guide lists potatoes, refined peanut oil and salt. Cooked in 100% peanut oil. Cut shape and fryer sharing are not stated in the US pages we read (the UK site says dedicated fryers; US not confirmed).' } },
  { id: 'r02', cat: 'fries', name: 'Five Guys Cajun Style Fries', place: 'Five Guys',
    claims: { seasoning: 'spiced', topping: 'none' },
    fryerSource: { kind: 'official', url: 'https://www.fiveguys.co.uk/nutritional-allergy-information/', note: 'UK site only: fries fried in fryers that cook nothing else. No US statement found, so the US fryer stays unknown.' },
    evidence: { kind: 'official', checked: READ_ON,
      url: 'https://fiveguys.com/-/media/public-site/files/allergen-ingredients-and-nutrition-info/five-guys-us-nutrition--allergen-guide-english.pdf',
      note: 'US guide lists a Cajun seasoning blend on top of the salted fries. Cooked in 100% peanut oil.' } },
  { id: 'r03', cat: 'fries', name: 'World Famous Fries', place: "McDonald's (US)",
    claims: { seasoning: 'salt only', topping: 'none' }, requests: { seasoning: ['none'] },
    evidence: { kind: 'official', checked: READ_ON,
      url: 'https://www.mcdonalds.com/us/en-us/about-our-food/our-food-your-questions/snacks-and-sides.html',
      note: 'Salt is added after cooking. They say you can ask for no salt, with a small amount possibly transferred from the bin or scoop. Cut shape and fryer sharing not stated there.' } },
  { id: 'r04', cat: 'fries', name: 'Waffle Potato Fries', place: 'Chick-fil-A',
    claims: { cut: 'waffle', seasoning: 'salt only', topping: 'none' },
    evidence: { kind: 'official', checked: READ_ON,
      url: 'https://www.chick-fil-a.com/menu/sides/chick-fil-a-waffle-potato-fries',
      note: 'Menu page: waffle-cut potatoes cooked in canola oil, sprinkled with sea salt. Ingredients vary by location, so check your restaurant. Fryer sharing not stated.' } },
  { id: 'r05', cat: 'fries', name: 'Natural-Cut Fries with Sea Salt', place: "Wendy's (US)",
    claims: { seasoning: 'salt only', topping: 'none' },
    fryer: 'shared', fryerSource: { kind: 'secondary', url: 'https://www.vrg.org/blog/?p=1818', note: 'A Vegetarian Resource Group page quoting Wendys allergen wording: cooked in the same oil as items containing wheat, egg, milk and fish (where available). Not read on wendys.com.' },
    evidence: { kind: 'official', checked: READ_ON,
      url: 'https://wendys.com/hot-crispy-fries',
      note: "Wendy's says natural-cut, skin-on potatoes, vegetable oil and sea salt. That cut is not one of the shapes we track, so cut stays unknown. Fryer sharing not stated there." } },
  { id: 'r06', cat: 'fries', name: 'Crinkle Cut Fries', place: 'Shake Shack',
    claims: { cut: 'crinkle', topping: 'none' },
    fryerSource: { kind: 'secondary', url: 'https://www.foodrepublic.com/1857152/fast-food-chain-gluten-free-fries/', note: 'Sources conflict: Food Republic says a dedicated basket; ntro.it.com says a shared fryer. No Shake Shack statement found, so unknown.' },
    evidence: { kind: 'secondary', checked: READ_ON,
      url: 'https://www.mspairport.com/sites/default/files/attachments/Menu_ShakeShack.pdf',
      note: 'The crinkle-cut name comes from a Shake Shack menu hosted by an airport, not Shake Shack\'s own site. Third-party reports disagree about whether the fryer is shared; we found no official statement.' } },
  { id: 'r07', cat: 'fries', name: 'French Fries', place: 'In-N-Out Burger',
    claims: { topping: 'none' },
    fryer: 'dedicated', fryerSource: { kind: 'secondary', url: 'https://godairyfree.org/dining-out/in-n-out-burger-dairy-free', note: 'Third-party allergy guide: fries are the only fried food at In-N-Out. Not stated on in-n-out.com.' },
    evidence: { kind: 'official', checked: READ_ON,
      url: 'https://www.in-n-out.com/menu/food-quality',
      note: 'Official page says fresh potatoes cut in the store and cooked in 100% sunflower oil. It does not state cut shape or seasoning, so those stay unknown.' } },
];

export const PRESETS_REAL = {
  fries: {
    'Plain, no added salt': { seasoning: 'none' },
    'Waffle cut': { cut: 'waffle' },
  },
  burger: {}, drink: {},
};
