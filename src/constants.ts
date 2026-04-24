import { Allergy, Cuisine, DietaryPreference, Dish, SpiceLevel } from "./types";

export const MENU_DATA: Dish[] = [
  {
    id: "1",
    platforms: [
      { name: 'Zomato', price: 224, url: 'https://www.zomato.com/search?keyword=Butter%20Paneer%20Masala' },
      { name: 'Swiggy', price: 262, url: 'https://www.swiggy.com/search?query=Butter%20Paneer%20Masala' },
      { name: 'Uber Eats', price: 230, url: 'https://www.ubereats.com/search?q=Butter%20Paneer%20Masala' }
    ],
    name: "Butter Paneer Masala",
    price: 350,
    rating: 4.8,
    cuisine: Cuisine.INDIAN,
    dietary: DietaryPreference.VEG,
    spice: SpiceLevel.MEDIUM,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800",
    category: "Main Course",
    description: "Creamy cottage cheese cubes in a rich tomato-based gravy.",
    ingredients: ["Paneer", "Tomato", "Cream", "Butter", "Spices"],
    calories: 450,
    prepTime: "25 mins",
    allergies: [Allergy.DAIRY]
  },
  {
    id: "2",
    platforms: [
      { name: 'Zomato', price: 208, url: 'https://www.zomato.com/search?keyword=Chicken%20Biryani' },
      { name: 'Swiggy', price: 237, url: 'https://www.swiggy.com/search?query=Chicken%20Biryani' },
      { name: 'Uber Eats', price: 221, url: 'https://www.ubereats.com/search?q=Chicken%20Biryani' }
    ],
    name: "Chicken Biryani",
    price: 450,
    rating: 4.9,
    cuisine: Cuisine.INDIAN,
    dietary: DietaryPreference.NON_VEG,
    spice: SpiceLevel.SPICY,
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=800",
    category: "Main Course",
    description: "Fragrant basmati rice cooked with succulent chicken and aromatic spices.",
    ingredients: ["Basmati Rice", "Chicken", "Saffron", "Yogurt", "Mint"],
    calories: 620,
    prepTime: "45 mins",
    allergies: [Allergy.DAIRY]
  },
  {
    id: "3",
    platforms: [
      { name: 'Zomato', price: 240, url: 'https://www.zomato.com/search?keyword=Schezwan%20Noodles' },
      { name: 'Swiggy', price: 227, url: 'https://www.swiggy.com/search?query=Schezwan%20Noodles' },
      { name: 'Uber Eats', price: 249, url: 'https://www.ubereats.com/search?q=Schezwan%20Noodles' }
    ],
    name: "Schezwan Noodles",
    price: 280,
    rating: 4.5,
    cuisine: Cuisine.CHINESE,
    dietary: DietaryPreference.VEGAN,
    spice: SpiceLevel.SPICY,
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800",
    category: "Noodles",
    description: "Spicy stir-fried noodles with crisp vegetables and Schezwan sauce.",
    ingredients: ["Wheat Noodles", "Bell Peppers", "Carrot", "Schezwan Sauce", "Spring Onion"],
    calories: 380,
    prepTime: "15 mins",
    allergies: [Allergy.GLUTEN]
  },
  {
    id: "4",
    platforms: [
      { name: 'Zomato', price: 241, url: 'https://www.zomato.com/search?keyword=Margherita%20Pizza' },
      { name: 'Swiggy', price: 236, url: 'https://www.swiggy.com/search?query=Margherita%20Pizza' },
      { name: 'Uber Eats', price: 251, url: 'https://www.ubereats.com/search?q=Margherita%20Pizza' }
    ],
    name: "Margherita Pizza",
    price: 320,
    rating: 4.7,
    cuisine: Cuisine.ITALIAN,
    dietary: DietaryPreference.VEG,
    spice: SpiceLevel.MILD,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?auto=format&fit=crop&q=80&w=800",
    category: "Pizza",
    description: "Classic pizza with tomato sauce, fresh mozzarella, and basil.",
    allergies: [Allergy.DAIRY, Allergy.GLUTEN]
  },
  {
    id: "5",
    platforms: [
      { name: 'Zomato', price: 203, url: 'https://www.zomato.com/search?keyword=Masala%20Dosa' },
      { name: 'Swiggy', price: 251, url: 'https://www.swiggy.com/search?query=Masala%20Dosa' },
      { name: 'Uber Eats', price: 235, url: 'https://www.ubereats.com/search?q=Masala%20Dosa' }
    ],
    name: "Masala Dosa",
    price: 180,
    rating: 4.6,
    cuisine: Cuisine.SOUTH_INDIAN,
    dietary: DietaryPreference.VEG,
    spice: SpiceLevel.MEDIUM,
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=800",
    category: "Breakfast",
    description: "Crispy rice crepe stuffed with spiced potato filling."
  },
  {
    id: "6",
    platforms: [
      { name: 'Zomato', price: 201, url: 'https://www.zomato.com/search?keyword=Chocochip%20Brownie' },
      { name: 'Swiggy', price: 235, url: 'https://www.swiggy.com/search?query=Chocochip%20Brownie' },
      { name: 'Uber Eats', price: 212, url: 'https://www.ubereats.com/search?q=Chocochip%20Brownie' }
    ],
    name: "Chocochip Brownie",
    price: 150,
    rating: 4.9,
    cuisine: Cuisine.DESSERTS,
    dietary: DietaryPreference.VEG,
    spice: SpiceLevel.MILD,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=800",
    category: "Dessert",
    description: "Fudgy chocolate brownie with melt-in-your-mouth chocochips."
  },
  {
    id: "7",
    platforms: [
      { name: 'Zomato', price: 239, url: 'https://www.zomato.com/search?keyword=Kung%20Pao%20Chicken' },
      { name: 'Swiggy', price: 221, url: 'https://www.swiggy.com/search?query=Kung%20Pao%20Chicken' },
      { name: 'Uber Eats', price: 242, url: 'https://www.ubereats.com/search?q=Kung%20Pao%20Chicken' }
    ],
    name: "Kung Pao Chicken",
    price: 380,
    rating: 4.4,
    cuisine: Cuisine.CHINESE,
    dietary: DietaryPreference.NON_VEG,
    spice: SpiceLevel.SPICY,
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&q=80&w=800",
    category: "Main Course",
    description: "Spicy, stir-fried Chinese dish made with chicken, peanuts, and vegetables."
  },
  {
    id: "8",
    platforms: [
      { name: 'Zomato', price: 216, url: 'https://www.zomato.com/search?keyword=Dal%20Makhani%20(Jain)' },
      { name: 'Swiggy', price: 240, url: 'https://www.swiggy.com/search?query=Dal%20Makhani%20(Jain)' },
      { name: 'Uber Eats', price: 225, url: 'https://www.ubereats.com/search?q=Dal%20Makhani%20(Jain)' }
    ],
    name: "Dal Makhani (Jain)",
    price: 260,
    rating: 4.7,
    cuisine: Cuisine.INDIAN,
    dietary: DietaryPreference.JAIN,
    spice: SpiceLevel.MEDIUM,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800",
    category: "Main Course",
    description: "Slow-cooked black lentils with cream and butter, prepared without onion and garlic."
  },
  {
    id: "9",
    platforms: [
      { name: 'Zomato', price: 202, url: 'https://www.zomato.com/search?keyword=Pasta%20Primavera' },
      { name: 'Swiggy', price: 232, url: 'https://www.swiggy.com/search?query=Pasta%20Primavera' },
      { name: 'Uber Eats', price: 214, url: 'https://www.ubereats.com/search?q=Pasta%20Primavera' }
    ],
    name: "Pasta Primavera",
    price: 340,
    rating: 4.5,
    cuisine: Cuisine.ITALIAN,
    dietary: DietaryPreference.VEGAN,
    spice: SpiceLevel.MILD,
    image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800",
    category: "Pasta",
    description: "Pasta tossed with fresh seasonal vegetables and garlic olive oil."
  },
  {
    id: "10",
    platforms: [
      { name: 'Zomato', price: 225, url: 'https://www.zomato.com/search?keyword=Idli%20Sambar' },
      { name: 'Swiggy', price: 260, url: 'https://www.swiggy.com/search?query=Idli%20Sambar' },
      { name: 'Uber Eats', price: 257, url: 'https://www.ubereats.com/search?q=Idli%20Sambar' }
    ],
    name: "Idli Sambar",
    price: 120,
    rating: 4.8,
    cuisine: Cuisine.SOUTH_INDIAN,
    dietary: DietaryPreference.VEG,
    spice: SpiceLevel.MILD,
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=800",
    category: "Breakfast",
    description: "Steamed rice cakes served with flavorful lentil soup (sambar)."
  },
  {
    id: "11",
    platforms: [
      { name: 'Zomato', price: 215, url: 'https://www.zomato.com/search?keyword=Double%20Cheese%20Burger' },
      { name: 'Swiggy', price: 250, url: 'https://www.swiggy.com/search?query=Double%20Cheese%20Burger' },
      { name: 'Uber Eats', price: 231, url: 'https://www.ubereats.com/search?q=Double%20Cheese%20Burger' }
    ],
    name: "Double Cheese Burger",
    price: 250,
    rating: 4.6,
    cuisine: Cuisine.FAST_FOOD,
    dietary: DietaryPreference.NON_VEG,
    spice: SpiceLevel.MEDIUM,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
    category: "Fast Food",
    description: "Juicy chicken patty with double layers of cheese and fresh veggies."
  },
  {
    id: "12",
    platforms: [
      { name: 'Zomato', price: 211, url: 'https://www.zomato.com/search?keyword=Gulab%20Jamun' },
      { name: 'Swiggy', price: 264, url: 'https://www.swiggy.com/search?query=Gulab%20Jamun' },
      { name: 'Uber Eats', price: 231, url: 'https://www.ubereats.com/search?q=Gulab%20Jamun' }
    ],
    name: "Gulab Jamun",
    price: 100,
    rating: 4.9,
    cuisine: Cuisine.DESSERTS,
    dietary: DietaryPreference.VEG,
    spice: SpiceLevel.MILD,
    image: "https://images.unsplash.com/photo-1589113730245-8025e1a39641?auto=format&fit=crop&q=80&w=800",
    category: "Dessert",
    description: "Deep-fried milk dumplings soaked in rose-flavored sugar syrup."
  },
  {
    id: "13",
    platforms: [
      { name: 'Zomato', price: 217, url: 'https://www.zomato.com/search?keyword=Loaded%20Veggie%20Sandwich' },
      { name: 'Swiggy', price: 269, url: 'https://www.swiggy.com/search?query=Loaded%20Veggie%20Sandwich' },
      { name: 'Uber Eats', price: 244, url: 'https://www.ubereats.com/search?q=Loaded%20Veggie%20Sandwich' }
    ],
    name: "Loaded Veggie Sandwich",
    price: 180,
    rating: 4.4,
    cuisine: Cuisine.FAST_FOOD,
    dietary: DietaryPreference.VEGAN,
    spice: SpiceLevel.MILD,
    image: "https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?auto=format&fit=crop&q=80&w=800",
    category: "Fast Food",
    description: "Toasted bread filled with avocado, lettuce, tomatoes, and cucumber."
  },
  {
    id: "14",
    platforms: [
      { name: 'Zomato', price: 229, url: 'https://www.zomato.com/search?keyword=Prawns%20Fry' },
      { name: 'Swiggy', price: 223, url: 'https://www.swiggy.com/search?query=Prawns%20Fry' },
      { name: 'Uber Eats', price: 239, url: 'https://www.ubereats.com/search?q=Prawns%20Fry' }
    ],
    name: "Prawns Fry",
    price: 550,
    rating: 4.8,
    cuisine: Cuisine.INDIAN,
    dietary: DietaryPreference.NON_VEG,
    spice: SpiceLevel.SPICY,
    image: "https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&q=80&w=800",
    category: "Appetizer",
    description: "Spicy pan-fried prawns with curry leaves and coastal spices."
  },
  {
    id: "15",
    platforms: [
      { name: 'Zomato', price: 214, url: 'https://www.zomato.com/search?keyword=Jain%20Cheese%20Pizza' },
      { name: 'Swiggy', price: 267, url: 'https://www.swiggy.com/search?query=Jain%20Cheese%20Pizza' },
      { name: 'Uber Eats', price: 221, url: 'https://www.ubereats.com/search?q=Jain%20Cheese%20Pizza' }
    ],
    name: "Jain Cheese Pizza",
    price: 360,
    rating: 4.5,
    cuisine: Cuisine.ITALIAN,
    dietary: DietaryPreference.JAIN,
    spice: SpiceLevel.MILD,
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&q=80&w=800",
    category: "Pizza",
    description: "Pizza with Jain-friendly tomato sauce and mozzarella."
  },
  {
    id: "16",
    platforms: [
      { name: 'Zomato', price: 246, url: 'https://www.zomato.com/search?keyword=Crispy%20Honey%20Chili%20Potato' },
      { name: 'Swiggy', price: 252, url: 'https://www.swiggy.com/search?query=Crispy%20Honey%20Chili%20Potato' },
      { name: 'Uber Eats', price: 251, url: 'https://www.ubereats.com/search?q=Crispy%20Honey%20Chili%20Potato' }
    ],
    name: "Crispy Honey Chili Potato",
    price: 240,
    rating: 4.6,
    cuisine: Cuisine.CHINESE,
    dietary: DietaryPreference.VEG,
    spice: SpiceLevel.MEDIUM,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
    category: "Appetizer",
    description: "Fried potato fingers tossed in a sweet and spicy honey chili sauce."
  },
  {
    id: "17",
    platforms: [
      { name: 'Zomato', price: 210, url: 'https://www.zomato.com/search?keyword=Vada%20Pav' },
      { name: 'Swiggy', price: 224, url: 'https://www.swiggy.com/search?query=Vada%20Pav' },
      { name: 'Uber Eats', price: 249, url: 'https://www.ubereats.com/search?q=Vada%20Pav' }
    ],
    name: "Vada Pav",
    price: 60,
    rating: 4.9,
    cuisine: Cuisine.FAST_FOOD,
    dietary: DietaryPreference.VEG,
    spice: SpiceLevel.SPICY,
    image: "https://images.unsplash.com/photo-1601050690597-df056fb69595?auto=format&fit=crop&q=80&w=800",
    category: "Street Food",
    description: "The classic Mumbai street burger with a spicy potato fritter."
  },
  {
    id: "18",
    platforms: [
      { name: 'Zomato', price: 207, url: 'https://www.zomato.com/search?keyword=Hyderabadi%20Shahi%20Tukda' },
      { name: 'Swiggy', price: 224, url: 'https://www.swiggy.com/search?query=Hyderabadi%20Shahi%20Tukda' },
      { name: 'Uber Eats', price: 247, url: 'https://www.ubereats.com/search?q=Hyderabadi%20Shahi%20Tukda' }
    ],
    name: "Hyderabadi Shahi Tukda",
    price: 220,
    rating: 4.9,
    cuisine: Cuisine.DESSERTS,
    dietary: DietaryPreference.VEG,
    spice: SpiceLevel.MILD,
    image: "https://images.unsplash.com/photo-1541944743827-e04bb645d993?auto=format&fit=crop&q=80&w=800",
    category: "Dessert",
    description: "Royal bread pudding fried in ghee and soaked in condensed milk."
  },
  {
    id: "19",
    platforms: [
      { name: 'Zomato', price: 200, url: 'https://www.zomato.com/search?keyword=Butter%20Chicken' },
      { name: 'Swiggy', price: 224, url: 'https://www.swiggy.com/search?query=Butter%20Chicken' },
      { name: 'Uber Eats', price: 252, url: 'https://www.ubereats.com/search?q=Butter%20Chicken' }
    ],
    name: "Butter Chicken",
    price: 420,
    rating: 4.9,
    cuisine: Cuisine.INDIAN,
    dietary: DietaryPreference.NON_VEG,
    spice: SpiceLevel.MEDIUM,
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800",
    category: "Main Course",
    description: "Tender chicken chunks in a buttery, creamy tomato sauce."
  },
  {
    id: "20",
    platforms: [
      { name: 'Zomato', price: 232, url: 'https://www.zomato.com/search?keyword=Medu%20Vada' },
      { name: 'Swiggy', price: 242, url: 'https://www.swiggy.com/search?query=Medu%20Vada' },
      { name: 'Uber Eats', price: 239, url: 'https://www.ubereats.com/search?q=Medu%20Vada' }
    ],
    name: "Medu Vada",
    price: 150,
    rating: 4.7,
    cuisine: Cuisine.SOUTH_INDIAN,
    dietary: DietaryPreference.VEGAN,
    spice: SpiceLevel.MEDIUM,
    image: "https://images.unsplash.com/photo-1626132646529-5006375bc9f1?auto=format&fit=crop&q=80&w=800",
    category: "Breakfast",
    description: "Crispy savory donuts made from lentils, served with coconut chutney."
  }
];
