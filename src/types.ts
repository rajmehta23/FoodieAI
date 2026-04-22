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
}

export interface CartItem {
  id: string;
  dish: Dish;
  quantity: number;
}

export interface Order {
  id: string;
  dishId: string;
  dishName: string;
  price: number;
  timestamp: number;
}

export interface Recommendation {
  dish: Dish;
  reason: string;
  badge: "For You" | "Matches Spice Preference" | "Popular in Cuisine" | "Budget Friendly" | "Top Pick";
}
