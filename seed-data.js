// All data below is FICTIONAL demo data. No real restaurant, menu or kitchen is described.
export const SEED_VERSION = 1;

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
  { id: 'f09', cat: 'fries', name: 'Thin & Crispy, No Salt', place: 'Sunny Side Counter',
    claims: { cut: 'shoestring', texture: 'crispy', seasoning: 'none', topping: 'none' },
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
