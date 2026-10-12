// IbadanLife — 24 groceries, cook-from-fridge (LagosLife parity).

export interface Grocery { id: string; name: string; price: number; hunger: number; spoilsDays: number; }
export const GROCERIES: Grocery[] = [
  { id: "rice", name: "Rice (congo)", price: 800, hunger: 20, spoilsDays: 30 },
  { id: "beans", name: "Beans", price: 700, hunger: 20, spoilsDays: 30 },
  { id: "garri", name: "Garri", price: 500, hunger: 18, spoilsDays: 60 },
  { id: "yam", name: "Yam tuber", price: 1200, hunger: 26, spoilsDays: 14 },
  { id: "amala-flour", name: "Elubo (amala flour)", price: 900, hunger: 24, spoilsDays: 60 },
  { id: "egusi", name: "Egusi", price: 1000, hunger: 16, spoilsDays: 30 },
  { id: "efo", name: "Efo bundle", price: 400, hunger: 12, spoilsDays: 3 },
  { id: "ogbono", name: "Ogbono", price: 1100, hunger: 16, spoilsDays: 30 },
  { id: "palm-oil", name: "Palm oil", price: 800, hunger: 10, spoilsDays: 90 },
  { id: "pepper", name: "Ata dudu", price: 300, hunger: 6, spoilsDays: 7 },
  { id: "tomatoes", name: "Tomatoes basket", price: 1500, hunger: 14, spoilsDays: 4 },
  { id: "chicken", name: "Chicken", price: 2500, hunger: 30, spoilsDays: 3 },
  { id: "beef", name: "Beef", price: 2000, hunger: 28, spoilsDays: 3 },
  { id: "ponmo", name: "Ponmo", price: 600, hunger: 14, spoilsDays: 3 },
  { id: "fish", name: "Smoked fish", price: 1200, hunger: 22, spoilsDays: 7 },
  { id: "egg", name: "Egg crate", price: 1800, hunger: 24, spoilsDays: 14 },
  { id: "bread", name: "Agege bread", price: 700, hunger: 18, spoilsDays: 4 },
  { id: "indomie", name: "Indomie carton", price: 2500, hunger: 30, spoilsDays: 90 },
  { id: "oats", name: "Oats", price: 1500, hunger: 20, spoilsDays: 60 },
  { id: "milk", name: "Milk", price: 900, hunger: 10, spoilsDays: 7 },
  { id: "plantain", name: "Plantain bunch", price: 1000, hunger: 20, spoilsDays: 5 },
  { id: "ofada-rice", name: "Ofada rice", price: 1400, hunger: 26, spoilsDays: 30 },
  { id: "suya-spice", name: "Suya spice", price: 400, hunger: 5, spoilsDays: 90 },
  { id: "zobo", name: "Zobo pack", price: 500, hunger: 8, spoilsDays: 5 },
];

export interface FridgeItem { groceryId: string; qty: number; dayBought: number; }

/** Cooking: 2+ items → meal. Cooking skill raises restore. */
export function cookMeal(items: FridgeItem[], cookingLevel: number): { hunger: number; msg: string } {
  const total = items.reduce((s, it) => {
    const g = GROCERIES.find((x) => x.id === it.groceryId);
    return s + (g ? g.hunger * it.qty : 0);
  }, 0);
  const bonus = 1 + cookingLevel * 0.08;
  const hunger = Math.round(Math.min(70, total * 0.6 * bonus));
  return { hunger, msg: `Cooked ${items.length} ingredients (lvl ${cookingLevel} bonus ×${bonus.toFixed(2)}). Hunger +${hunger}.` };
}
