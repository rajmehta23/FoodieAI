import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Dish } from "../types";
import { MENU_DATA } from "../constants";

// Lazy initialization to prevent crashing if key is missing during build
let engineInstance: GoogleGenAI | null = null;
const getEngine = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn("Recommendation key is missing. Features will use enhanced fallback logic.");
    return null;
  }
  if (!engineInstance) {
    engineInstance = new GoogleGenAI({ apiKey: key });
  }
  return engineInstance;
};

// ─── Smart Rule-Based Fallback ─────────────────────────────────────────────────
// Scores each dish based on how well it matches the user's profile
function scoreAndRankDishes(profile: UserProfile): { dishId: string; reason: string; badge: string }[] {
  const scored = MENU_DATA.map((dish) => {
    let score = 0;
    const reasons: string[] = [];

    // Dietary match — highest priority
    if (dish.dietary === profile.dietary) {
      score += 40;
      reasons.push(`Matches your ${profile.dietary} preference`);
    }

    // Spice level match
    if (dish.spice === profile.spice) {
      score += 20;
      reasons.push(`${dish.spice} spice — just how you like it`);
    }

    // Cuisine preference
    if (profile.cuisines.includes(dish.cuisine)) {
      score += 20;
      reasons.push(`Picked from your favourite ${dish.cuisine} cuisine`);
    }

    // Budget friendly
    if (dish.price <= profile.budget) {
      score += 15;
      if (dish.price <= profile.budget * 0.6) {
        reasons.push(`Great value at ₹${dish.price} — well within your budget`);
      }
    } else {
      score -= 20; // penalize over-budget dishes
    }

    // Allergy safety — penalize if allergen matches
    if (dish.allergies) {
      const hasRiskyAllergen = dish.allergies.some(
        (a) => profile.allergies.includes(a) && a !== "None" && profile.allergies[0] !== "None"
      );
      if (hasRiskyAllergen) score -= 50;
    }

    // Popularity boost from rating
    score += dish.rating * 2;

    // Pick the best reason
    const primaryReason =
      reasons.length > 0
        ? reasons[0]
        : `Highly rated ${dish.cuisine} dish (${dish.rating}★) we think you'll love`;

    // Determine badge
    let badge = "For You";
    if (reasons.some((r) => r.includes("spice"))) badge = "Matches Spice Preference";
    else if (reasons.some((r) => r.includes("cuisine"))) badge = "Popular in Cuisine";
    else if (reasons.some((r) => r.includes("value") || r.includes("budget"))) badge = "Budget Friendly";

    return { dish, score, reason: primaryReason, badge };
  });

  // Sort by score, take top 4, ensure variety (different cuisines if possible)
  scored.sort((a, b) => b.score - a.score);
  const selected: typeof scored = [];
  const usedCuisines = new Set<string>();

  for (const item of scored) {
    if (selected.length >= 4) break;
    // Allow duplicate cuisines only if we can't fill 4 with unique
    if (!usedCuisines.has(item.dish.cuisine) || selected.length >= 3) {
      selected.push(item);
      usedCuisines.add(item.dish.cuisine);
    }
  }
  // If still not 4, fill remaining
  if (selected.length < 4) {
    for (const item of scored) {
      if (selected.length >= 4) break;
      if (!selected.includes(item)) selected.push(item);
    }
  }

  return selected.map((s) => ({ dishId: s.dish.id, reason: s.reason, badge: s.badge }));
}

function smartSurpriseFallback(profile: UserProfile): { dishId: string; reason: string }[] {
  // Pick dishes the user might not have expected — different from top picks
  const safe = MENU_DATA.filter((d) => {
    if (d.price > profile.budget * 1.2) return false;
    if (d.allergies && profile.allergies[0] !== "None") {
      return !d.allergies.some((a) => profile.allergies.includes(a));
    }
    return true;
  });

  const surpriseReasons = [
    "Step outside your comfort zone — our chefs' pick for adventurous foodies!",
    "Trending dish loved by thousands — time to give it a try!",
    "Hidden gem on our menu — you might just fall in love with it!",
    "A surprise pick that pairs perfectly with your taste profile.",
    "Unexpectedly delicious — our top recommendation for your next adventure!",
  ];

  // Shuffle and pick 3 diverse dishes
  const shuffled = safe.sort(() => Math.random() - 0.5);
  const picks: typeof safe = [];
  const usedCuisines = new Set<string>();
  for (const d of shuffled) {
    if (picks.length >= 3) break;
    if (!usedCuisines.has(d.cuisine)) {
      picks.push(d);
      usedCuisines.add(d.cuisine);
    }
  }
  if (picks.length < 3) {
    for (const d of shuffled) {
      if (picks.length >= 3) break;
      if (!picks.includes(d)) picks.push(d);
    }
  }

  return picks.map((d, i) => ({
    dishId: d.id,
    reason: surpriseReasons[i % surpriseReasons.length],
  }));
}

// ─── Main Exports ──────────────────────────────────────────────────────────────

export async function getPersonalizedRecommendations(
  profile: UserProfile
): Promise<{ dishId: string; reason: string; badge: string }[]> {
  try {
    const engine = getEngine();
    if (!engine) throw new Error("Service not configured");

    const prompt = `User: ${profile.dietary}, ${profile.spice}, Cuisines: ${profile.cuisines.join(", ")}, Allergies: ${profile.allergies.join(", ")}, Budget: ₹${profile.budget}.
    Menu IDs/Data: ${MENU_DATA.map((d) => `${d.id}: ${d.name}, ₹${d.price}, ${d.cuisine}, ${d.dietary}, ${d.spice}`).join("|")}.
    Recommend 4 dishes that best match the user. Return JSON array: [{dishId: string, reason: string (personalized, conversational, max 12 words), badge: string (one of: "For You", "Matches Spice Preference", "Popular in Cuisine", "Budget Friendly")}]`;

    const response = await engine.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              dishId: { type: Type.STRING },
              reason: { type: Type.STRING },
              badge: { type: Type.STRING },
            },
            required: ["dishId", "reason", "badge"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text);
  } catch (error) {
    console.warn("Gemini unavailable, using smart fallback:", error);
    return scoreAndRankDishes(profile);
  }
}

export async function getSurpriseMe(
  profile: UserProfile
): Promise<{ dishId: string; reason: string }[]> {
  try {
    const engine = getEngine();
    if (!engine) throw new Error("Service not configured");

    const prompt = `Profile: ${profile.dietary}, ${profile.spice}, Allergies: ${profile.allergies.join(", ")}, Budget: ₹${profile.budget}.
    Menu: ${MENU_DATA.map((d) => `${d.id}: ${d.name}, ₹${d.price}, ${d.cuisine}, ${d.dietary}, ${d.spice}`).join("|")}.
    Select 3 diverse surprise dishes (different cuisines). Make reasons creative and exciting. JSON array: [{ "dishId": "id", "reason": "creative short reason (max 10 words)" }]`;

    const response = await engine.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              dishId: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
            required: ["dishId", "reason"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text);
  } catch (error) {
    console.warn("Gemini unavailable, using smart surprise fallback:", error);
    return smartSurpriseFallback(profile);
  }
}
