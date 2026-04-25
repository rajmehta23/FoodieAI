export enum DietaryPreference {
  VEG = "Veg",
  NON_VEG = "Non-Veg",
  VEGAN = "Vegan",
  JAIN = "Jain",
}

export enum SpiceLevel {
  MILD = "Mild",
  MEDIUM = "Medium",
  SPICY = "Spicy",
}

export enum Cuisine {
  INDIAN = "Indian",
  CHINESE = "Chinese",
  ITALIAN = "Italian",
  FAST_FOOD = "Fast Food",
  SOUTH_INDIAN = "South Indian",
  DESSERTS = "Desserts",
}

export enum Allergy {
  NUTS = "Nuts",
  DAIRY = "Dairy",
  GLUTEN = "Gluten",
  NONE = "None",
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface UserProfile {
  dietary: DietaryPreference;
  spice: SpiceLevel;
  cuisines: Cuisine[];
  allergies: Allergy[];
  budget: number;
}

export interface PlatformLink {
  name: string;
  price: number;
  url: string;
}

export interface Dish {
  id: string;
  name: string;
  price: number;
  rating: number;
  cuisine: Cuisine;
  dietary: DietaryPreference;
  spice: SpiceLevel;
  image: string;
  category: string;
  description: string;
  ingredients?: string[];
  calories?: number;
  prepTime?: string;
  allergies?: Allergy[];
  platforms?: PlatformLink[];
}

export interface Recommendation {
  dish: Dish;
  reason: string;
  badge: "For You" | "Matches Spice Preference" | "Popular in Cuisine" | "Budget Friendly" | "Top Pick";
}
