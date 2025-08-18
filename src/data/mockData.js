export const mockRecipes = [
  {
    id: 1,
    title: "Classic Spaghetti Carbonara",
    image: "https://images.unsplash.com/photo-1608756687911-aa1ba497938c?w=400&h=300&fit=crop",
    cookTime: "20 min",
    servings: 4,
    difficulty: "Easy",
    ingredients: [
      "400g spaghetti",
      "200g pancetta or guanciale, diced",
      "4 large eggs",
      "100g Pecorino Romano cheese, grated",
      "2 cloves garlic, minced",
      "Black pepper, freshly ground",
      "Salt to taste"
    ],
    instructions: [
      "Cook spaghetti in salted boiling water until al dente.",
      "In a large skillet, cook pancetta until crispy.",
      "In a bowl, whisk eggs with grated cheese and black pepper.",
      "Drain pasta, reserving 1 cup pasta water.",
      "Add pasta to skillet with pancetta, remove from heat.",
      "Quickly stir in egg mixture, adding pasta water as needed.",
      "Serve immediately with extra cheese and black pepper."
    ]
  },
  {
    id: 2,
    title: "Chicken Tikka Masala",
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=300&fit=crop",
    cookTime: "45 min",
    servings: 6,
    difficulty: "Medium",
    ingredients: [
      "1kg chicken breast, cubed",
      "200ml yogurt",
      "2 tbsp tikka masala paste",
      "1 onion, diced",
      "400ml coconut milk",
      "400g canned tomatoes",
      "2 tsp garam masala",
      "1 tsp turmeric",
      "Fresh cilantro for garnish"
    ],
    instructions: [
      "Marinate chicken in yogurt and tikka paste for 30 minutes.",
      "Cook chicken in a large pan until golden brown.",
      "Sauté onions until soft and translucent.",
      "Add spices and cook for 1 minute.",
      "Add tomatoes and coconut milk, simmer for 15 minutes.",
      "Return chicken to the sauce and simmer for 10 minutes.",
      "Garnish with fresh cilantro and serve with rice."
    ]
  },
  {
    id: 3,
    title: "Classic Caesar Salad",
    image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&h=300&fit=crop",
    cookTime: "15 min",
    servings: 4,
    difficulty: "Easy",
    ingredients: [
      "2 large romaine lettuce heads",
      "100g Parmesan cheese, grated",
      "1 cup croutons",
      "4 anchovy fillets",
      "2 cloves garlic",
      "1 egg yolk",
      "2 tbsp lemon juice",
      "1/2 cup olive oil",
      "1 tsp Worcestershire sauce"
    ],
    instructions: [
      "Wash and chop romaine lettuce into bite-sized pieces.",
      "Make dressing by whisking egg yolk, lemon juice, and Worcestershire.",
      "Slowly add olive oil while whisking to emulsify.",
      "Add minced garlic and anchovies to dressing.",
      "Toss lettuce with dressing until well coated.",
      "Top with croutons and grated Parmesan cheese.",
      "Serve immediately."
    ]
  },
  {
    id: 4,
    title: "Beef Stir Fry",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    cookTime: "25 min",
    servings: 4,
    difficulty: "Easy",
    ingredients: [
      "500g beef sirloin, sliced thin",
      "2 bell peppers, sliced",
      "1 onion, sliced",
      "2 cups broccoli florets",
      "3 tbsp soy sauce",
      "2 tbsp oyster sauce",
      "1 tbsp cornstarch",
      "2 tsp sesame oil",
      "3 cloves garlic, minced"
    ],
    instructions: [
      "Marinate beef in soy sauce and cornstarch for 15 minutes.",
      "Heat oil in a wok or large skillet over high heat.",
      "Stir-fry beef until browned, about 3-4 minutes.",
      "Add vegetables and stir-fry for 5-6 minutes.",
      "Mix oyster sauce with remaining soy sauce.",
      "Add sauce to the wok and stir to combine.",
      "Drizzle with sesame oil before serving."
    ]
  },
  {
    id: 5,
    title: "Chocolate Chip Cookies",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop",
    cookTime: "25 min",
    servings: 24,
    difficulty: "Easy",
    ingredients: [
      "2 1/4 cups all-purpose flour",
      "1 tsp baking soda",
      "1 cup butter, softened",
      "3/4 cup granulated sugar",
      "3/4 cup brown sugar",
      "2 large eggs",
      "2 tsp vanilla extract",
      "2 cups chocolate chips"
    ],
    instructions: [
      "Preheat oven to 375°F (190°C).",
      "Mix flour and baking soda in a bowl.",
      "Cream butter and both sugars until fluffy.",
      "Beat in eggs and vanilla extract.",
      "Gradually blend in flour mixture.",
      "Stir in chocolate chips.",
      "Drop rounded tablespoons on ungreased baking sheets.",
      "Bake 9-11 minutes until golden brown."
    ]
  },
  {
    id: 6,
    title: "Greek Salad",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
    cookTime: "10 min",
    servings: 4,
    difficulty: "Easy",
    ingredients: [
      "4 large tomatoes, chunked",
      "1 cucumber, sliced",
      "1 red onion, thinly sliced",
      "200g feta cheese, cubed",
      "1/2 cup Kalamata olives",
      "1/4 cup olive oil",
      "2 tbsp red wine vinegar",
      "1 tsp dried oregano",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Combine tomatoes, cucumber, and red onion in a large bowl.",
      "Add feta cheese and olives.",
      "Whisk together olive oil, vinegar, and oregano.",
      "Pour dressing over salad and toss gently.",
      "Season with salt and pepper.",
      "Let sit for 10 minutes before serving.",
      "Serve chilled or at room temperature."
    ]
  }
];

export const mockShoppingList = [
  { id: 1, item: "Eggs", quantity: "1 dozen", completed: false },
  { id: 2, item: "Milk", quantity: "1 gallon", completed: true },
  { id: 3, item: "Bread", quantity: "1 loaf", completed: false },
  { id: 4, item: "Chicken breast", quantity: "2 lbs", completed: false },
  { id: 5, item: "Olive oil", quantity: "1 bottle", completed: true }
];

export const mockPantryItems = [
  { id: 1, item: "Rice", quantity: "5 lbs", category: "Grains", expiryDate: "2024-12-31" },
  { id: 2, item: "Pasta", quantity: "2 boxes", category: "Grains", expiryDate: "2024-11-15" },
  { id: 3, item: "Olive Oil", quantity: "1 bottle", category: "Oils", expiryDate: "2025-06-01" },
  { id: 4, item: "Salt", quantity: "1 container", category: "Spices", expiryDate: "2026-01-01" },
  { id: 5, item: "Black Pepper", quantity: "1 jar", category: "Spices", expiryDate: "2025-03-15" }
];

export const mockMealPlan = {
  week: "December 16-22, 2024",
  meals: [
    {
      day: "Monday",
      date: "Dec 16",
      breakfast: { id: 5, title: "Chocolate Chip Cookies", image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop" },
      lunch: { id: 3, title: "Classic Caesar Salad", image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&h=300&fit=crop" },
      dinner: { id: 1, title: "Classic Spaghetti Carbonara", image: "https://images.unsplash.com/photo-1608756687911-aa1ba497938c?w=400&h=300&fit=crop" }
    },
    {
      day: "Tuesday",
      date: "Dec 17",
      breakfast: null,
      lunch: { id: 6, title: "Greek Salad", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop" },
      dinner: { id: 2, title: "Chicken Tikka Masala", image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=300&fit=crop" }
    },
    {
      day: "Wednesday",
      date: "Dec 18",
      breakfast: null,
      lunch: null,
      dinner: { id: 4, title: "Beef Stir Fry", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop" }
    },
    {
      day: "Thursday",
      date: "Dec 19",
      breakfast: null,
      lunch: { id: 3, title: "Classic Caesar Salad", image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&h=300&fit=crop" },
      dinner: { id: 1, title: "Classic Spaghetti Carbonara", image: "https://images.unsplash.com/photo-1608756687911-aa1ba497938c?w=400&h=300&fit=crop" }
    },
    {
      day: "Friday",
      date: "Dec 20",
      breakfast: null,
      lunch: null,
      dinner: { id: 2, title: "Chicken Tikka Masala", image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=300&fit=crop" }
    },
    {
      day: "Saturday",
      date: "Dec 21",
      breakfast: null,
      lunch: { id: 6, title: "Greek Salad", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop" },
      dinner: { id: 4, title: "Beef Stir Fry", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop" }
    },
    {
      day: "Sunday",
      date: "Dec 22",
      breakfast: { id: 5, title: "Chocolate Chip Cookies", image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop" },
      lunch: null,
      dinner: { id: 1, title: "Classic Spaghetti Carbonara", image: "https://images.unsplash.com/photo-1608756687911-aa1ba497938c?w=400&h=300&fit=crop" }
    }
  ]
};
