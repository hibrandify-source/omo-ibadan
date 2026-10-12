// Omo Ibadan — groceries and cooking from your own pot.
// Prices are per typical market unit (see prices.ts note: estimates to verify).

export interface Grocery { id: string; name: string; price: number; hunger: number; spoilsDays: number; }

export const GROCERIES: Grocery[] = [
  { id: "rice", name: "Rice (1 congo)", price: 4500, hunger: 20, spoilsDays: 30 },
  { id: "beans", name: "Beans (1 congo)", price: 3500, hunger: 20, spoilsDays: 30 },
  { id: "garri", name: "Garri (1 congo)", price: 2000, hunger: 18, spoilsDays: 60 },
  { id: "yam", name: "Yam tuber", price: 4000, hunger: 26, spoilsDays: 14 },
  { id: "amala-flour", name: "Elubo (amala flour, 1 congo)", price: 3500, hunger: 24, spoilsDays: 60 },
  { id: "egusi", name: "Egusi (1 cup)", price: 2500, hunger: 16, spoilsDays: 30 },
  { id: "efo", name: "Efo bundle", price: 1000, hunger: 12, spoilsDays: 3 },
  { id: "ewedu", name: "Ewedu bundle", price: 500, hunger: 10, spoilsDays: 3 },
  { id: "palm-oil", name: "Palm oil (1 litre)", price: 3000, hunger: 10, spoilsDays: 90 },
  { id: "pepper", name: "Ata dudu mix", price: 1500, hunger: 6, spoilsDays: 7 },
  { id: "tomatoes", name: "Tomatoes (small paint bucket)", price: 6000, hunger: 14, spoilsDays: 4 },
  { id: "chicken", name: "Chicken (1 kg)", price: 7000, hunger: 30, spoilsDays: 3 },
  { id: "beef", name: "Beef (1 kg)", price: 8000, hunger: 28, spoilsDays: 3 },
  { id: "ponmo", name: "Ponmo", price: 1500, hunger: 14, spoilsDays: 3 },
  { id: "fish", name: "Smoked fish", price: 3000, hunger: 22, spoilsDays: 7 },
  { id: "egg", name: "Egg crate", price: 5500, hunger: 24, spoilsDays: 14 },
  { id: "bread", name: "Agege bread", price: 1500, hunger: 18, spoilsDays: 4 },
  { id: "indomie", name: "Indomie carton", price: 14000, hunger: 30, spoilsDays: 90 },
  { id: "plantain", name: "Plantain (5 fingers)", price: 3000, hunger: 20, spoilsDays: 5 },
  { id: "ofada-rice", name: "Ofada rice (1 congo)", price: 5000, hunger: 26, spoilsDays: 30 },
  { id: "zobo", name: "Zobo pack", price: 1000, hunger: 8, spoilsDays: 5 },
];

export interface FridgeItem { groceryId: string; qty: number; dayBought: number; }

/** Cooking: 2+ items → meal. Cooking skill raises how much a meal restores. */
export function cookMeal(items: FridgeItem[], cookingLevel: number): { hunger: number; msg: string } {
  const total = items.reduce((s, it) => {
    const g = GROCERIES.find((x) => x.id === it.groceryId);
    return s + (g ? g.hunger * it.qty : 0);
  }, 0);
  const bonus = 1 + cookingLevel * 0.08;
  const hunger = Math.round(Math.min(70, total * 0.6 * bonus));
  return { hunger, msg: `Cooked ${items.length} ingredients (cooking Lv${cookingLevel}). Hunger +${hunger}.` };
}
