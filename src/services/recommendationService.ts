import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Dish } from "../types";
import { MENU_DATA } from "../constants";

// Lazy initialization to prevent crashing if key is missing during build
let engineInstance: GoogleGenAI | null = null;
const getEngine = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn("Recommendation key is missing. Features will use fallback logic.");
    return null;
  }
  if (!engineInstance) {
    engineInstance = new GoogleGenAI({ apiKey: key });
  }
  return engineInstance;
};

export async function getPersonalizedRecommendations(profile: UserProfile): Promise<{ dishId: string; reason: string; badge: string }[]> {
  try {
    const engine = getEngine();
    if (!engine) throw new Error("Service not configured");

    const prompt = `User: ${profile.dietary}, ${profile.spice}, Cuisines: ${profile.cuisines.join(", ")}, Allergies: ${profile.allergies.join(", ")}, Budget: ${profile.budget}.
    Menu IDs/Data: ${MENU_DATA.map(d => `${d.id}: ${d.name}, ${d.price}, ${d.cuisine}, ${d.dietary}, ${d.spice}`).join("|")}.
    Recommend 4 dishes match User. JSON array: [{dishId: string, reason: string, badge: string (values: "For You", "Matches Spice Preference", "Popular in Cuisine", "Budget Friendly")}]`;

    const response = await engine.models.generateContent({
      model: "gemini-1.5-flash", // Fast menu processing
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
              badge: { type: Type.STRING }
            },
            required: ["dishId", "reason", "badge"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Personalization Error:", error);
    // Fallback: simple filtering
    return MENU_DATA
      .filter(d => d.dietary === profile.dietary && profile.cuisines.includes(d.cuisine) && d.price <= profile.budget)
      .slice(0, 4)
      .map(d => ({
        dishId: d.id,
        reason: "Matches your basic preferences.",
        badge: "For You"
      }));
  }
}

export async function getSurpriseMe(profile: UserProfile): Promise<{ dishId: string; reason: string }[]> {
  try {
    const engine = getEngine();
    if (!engine) throw new Error("Service not configured");

    const prompt = `Profile: ${profile.dietary}, ${profile.spice}, Allergies: ${profile.allergies.join(", ")}, Budget: ${profile.budget}.
    Menu: ${MENU_DATA.map(d => `${d.id}: ${d.name}, ${d.price}, ${d.cuisine}, ${d.dietary}, ${d.spice}`).join("|")}.
    Select 3 random surprise dishes. JSON array: [{ "dishId": "id", "reason": "creative short reason" }]`;

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
              reason: { type: Type.STRING }
            },
            required: ["dishId", "reason"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Discovery Error:", error);
    return MENU_DATA.sort(() => 0.5 - Math.random()).slice(0, 3).map(d => ({
      dishId: d.id,
      reason: "A delicious random pick just for you!"
    }));
  }
}
