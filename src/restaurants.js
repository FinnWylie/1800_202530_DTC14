// Handles restaurant cards: fetching restaurants and creating restaurant cards

import { db } from "./firebaseConfig.js";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getRandomItems,
  generateStars,
  createHeartButton,
  displayCards,
  searchWikipedia,
  getWikipediaPage,
} from "./cardUtils.js";

// ============================================
// FETCH RESTAURANTS FROM WIKIPEDIA - Get restaurants based on cities
// ============================================

// Get restaurants for a city using Wikipedia
const getRestaurantsFromWikipedia = async (
  cityName,
  countryName,
  count = 6
) => {
  const queries = [
    `restaurant ${cityName}`,
    `restaurants ${cityName} ${countryName}`,
    `famous restaurant ${cityName}`,
  ];

  const allResults = [];

  for (const query of queries) {
    const titles = await searchWikipedia(query, 15);

    for (const title of titles) {
      const titleLower = title.toLowerCase();

      // Skip list pages, categories, and pages that are not actual restaurant names
      if (
        titleLower.includes("list of") ||
        titleLower.includes("category:") ||
        titleLower.includes("restaurants in") ||
        titleLower.includes("dining in") ||
        titleLower.startsWith("category")
      ) {
        continue;
      }

      // EXCLUDE non-restaurant places (airports, hospitals, schools, etc.)
      const nonRestaurantPlaces = [
        "airport",
        "hospital",
        "university",
        "college",
        "school",
        "museum",
        "library",
        "stadium",
        "arena",
        "theater",
        "cinema",
        "hotel",
        "park",
        "beach",
        "monument",
        "landmark",
        "tower",
        "bridge",
        "station",
        "terminal",
        "harbor",
        "harbour",
        "port",
        "market",
      ];

      const isNonRestaurantPlace = nonRestaurantPlaces.some((place) =>
        titleLower.includes(place)
      );

      if (isNonRestaurantPlace) {
        continue;
      }

      // Skip cuisine types and generic restaurant categories
      const cuisineTypes = [
        "seafood restaurant",
        "italian restaurant",
        "chinese restaurant",
        "japanese restaurant",
        "mexican restaurant",
        "french restaurant",
        "indian restaurant",
        "thai restaurant",
        "fast food restaurant",
        "chain restaurant",
        "casual dining restaurant",
        "fine dining restaurant",
        "buffet restaurant",
        "vegetarian restaurant",
        "vegan restaurant",
        "pizza restaurant",
        "sushi restaurant",
        "steakhouse restaurant",
        "barbecue restaurant",
        "soul food restaurant",
      ];

      const isCuisineType = cuisineTypes.some(
        (cuisine) =>
          titleLower === cuisine ||
          titleLower.startsWith(cuisine + " ") ||
          titleLower === cuisine.replace(" restaurant", "")
      );

      if (isCuisineType) {
        continue;
      }

      // Skip generic restaurant type pages (not actual restaurant names)
      const genericTypes = [
        "restaurant",
        "cafe",
        "bistro",
        "bar",
        "grill",
        "diner",
      ];

      // If the title is JUST a generic type (like "Restaurant", "Cafe"), skip it
      if (genericTypes.some((type) => titleLower === type)) {
        continue;
      }

      // REQUIRE restaurant-related keywords in the title
      // Must contain at least one of these: restaurant, cafe, bistro, bar, grill, diner, pub, tavern, eatery
      const restaurantKeywords = [
        "restaurant",
        "cafe",
        "café",
        "bistro",
        "bar",
        "grill",
        "diner",
        "pub",
        "tavern",
        "eatery",
        "brasserie",
        "steakhouse",
        "pizzeria",
        "bakery",
        "deli",
        "deli",
        "cantina",
        "trattoria",
        "osteria",
      ];

      const hasRestaurantKeyword = restaurantKeywords.some((keyword) =>
        titleLower.includes(keyword)
      );

      // Also allow disambiguated titles like "Joey (restaurant)"
      const hasDisambiguation =
        title.includes("(") && titleLower.includes("restaurant");

      // Skip if it doesn't have restaurant keywords or disambiguation
      if (!hasRestaurantKeyword && !hasDisambiguation) {
        continue;
      }

      // Only include pages that look like actual restaurant names
      if (
        title.length < 50 &&
        !titleLower.includes(" in ") &&
        !titleLower.includes(" of ") &&
        !titleLower.includes("list of")
      ) {
        const page = await getWikipediaPage(title);
        if (page && !allResults.find((r) => r.name === page.title)) {
          // Check the page content to verify it's about a specific restaurant
          const extract = page.extract.toLowerCase();

          // Exclude non-restaurant content in the extract
          const excludeKeywords = [
            "airport",
            "hospital",
            "university",
            "school",
            "monument",
            "landmark",
            "museum",
            "park",
            "stadium",
            "theater",
            "cinema",
          ];

          const containsExcludedContent = excludeKeywords.some((keyword) =>
            extract.includes(keyword)
          );

          if (containsExcludedContent) {
            continue;
          }

          // Verify it's about a restaurant business
          const isSpecificRestaurant =
            extract.includes("restaurant") ||
            extract.includes("cafe") ||
            extract.includes("café") ||
            extract.includes("dining") ||
            extract.includes("menu") ||
            extract.includes("chef") ||
            extract.includes("cuisine") ||
            extract.includes("founded") ||
            extract.includes("opened") ||
            extract.includes("chain") ||
            extract.includes("location") ||
            extract.includes("owner") ||
            page.title.includes("(restaurant)") ||
            page.title.includes("(cafe)") ||
            page.title.includes("(café)") ||
            page.title.includes("(bistro)");

          // Only add if it's actually about a restaurant
          if (isSpecificRestaurant) {
            allResults.push({
              name: page.title,
              rating: 4.0 + Math.random() * 1.0,
              type: "Restaurant",
              photoUrl: page.imageUrl,
              city: cityName,
              country: countryName,
            });
          }
        }
      }
    }

    if (allResults.length >= count) break;
  }

  return allResults.slice(0, count);
};

// ============================================
// FETCH RESTAURANTS FROM FIRESTORE - Fallback seed data
// ============================================

// Seed data: restaurants to add if collection is empty
const restaurantsSeedData = [
  { name: "Olive Garden", rating: 4.5, type: "Italian" },
  { name: "La Piazza", rating: 4.8, type: "Italian" },
  { name: "Nobu", rating: 4.7, type: "Japanese" },
  { name: "Sushi Go", rating: 4.3, type: "Japanese" },
  { name: "Le Gourmet", rating: 4.9, type: "French" },
  { name: "BBQ Nation", rating: 4.4, type: "American" },
  { name: "Taco Fiesta", rating: 4.2, type: "Mexican" },
  { name: "Burger Boss", rating: 4.6, type: "American" },
  { name: "Thai House", rating: 4.5, type: "Thai" },
  { name: "Curry House", rating: 4.4, type: "Indian" },
];

// Fetch restaurants from Firestore (fallback only)
const fetchRestaurantsFromFirestore = async (count = 6) => {
  try {
    const ref = collection(db, "restaurants");
    const snapshot = await getDocs(ref);

    // If no restaurants exist, add seed data
    if (snapshot.empty) {
      for (const item of restaurantsSeedData) {
        await addDoc(ref, { ...item, createdAt: serverTimestamp() });
      }
    }

    // Get all restaurants
    const items = [];
    (await getDocs(ref)).forEach((doc) =>
      items.push({ id: doc.id, ...doc.data() })
    );

    // Return random selection
    return getRandomItems(items, count);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return [];
  }
};

// ============================================
// CREATE RESTAURANT CARD - Build the restaurant card element
// ============================================

// Create a restaurant card with name, rating, image, and heart button
export const createRestaurantCard = (restaurantData) => {
  const div = document.createElement("div");
  div.className =
    "relative bg-neutral-300 rounded-2xl w-44 h-36 py-4 px-5 shrink-0 overflow-hidden cursor-pointer";

  // Add image if photoUrl exists
  if (restaurantData.photoUrl) {
    div.style.backgroundImage = `url("${restaurantData.photoUrl}")`;
    div.style.backgroundSize = "cover";
    div.style.backgroundPosition = "center";

    // Add dark overlay for better text readability
    const overlay = document.createElement("div");
    overlay.className = "absolute inset-0 rounded-2xl bg-black/30";
    overlay.style.pointerEvents = "none";
    div.appendChild(overlay);
  }

  // Content with restaurant name and star rating
  const content = document.createElement("div");
  content.className = "flex h-full flex-col justify-end gap-1 relative z-10";

  // Make text white if there's an image
  if (restaurantData.photoUrl) {
    content.style.color = "white";
    content.style.textShadow = "0 1px 3px rgba(0,0,0,0.5)";
  }

  content.innerHTML = `<p class="font-medium">${
    restaurantData.name
  }</p><p>${generateStars(restaurantData.rating)}</p>`;
  div.appendChild(content);

  // When card is clicked, go to detail page (but not if clicking heart button)
  div.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    // Store restaurant name for the detail page
    localStorage.setItem("restaurant_name", restaurantData.name);
    window.location.href = "eachRestaurant.html";
  });

  // Add heart button for saving
  const heartButton = createHeartButton("Save this restaurant", "restaurant", {
    name: restaurantData.name,
    rating: restaurantData.rating,
  });
  heartButton.style.zIndex = "20";
  div.appendChild(heartButton);

  return div;
};

// ============================================
// INITIALIZE RESTAURANTS - Load and display restaurants
// ============================================

// Fetch restaurants and display them on the page
// Takes places array to fetch restaurants from those cities
export const initializeRestaurants = async (places = []) => {
  let restaurants = [];

  // Try to get restaurants from Wikipedia based on places
  if (places.length > 0) {
    const allRestaurants = [];
    const restaurantsPerCity = Math.ceil(6 / places.length); // Distribute across cities

    // Fetch restaurants from each city
    for (const place of places) {
      try {
        const cityRestaurants = await getRestaurantsFromWikipedia(
          place.cityName,
          place.countryName,
          restaurantsPerCity + 1 // Get a few extra in case some fail
        );
        allRestaurants.push(...cityRestaurants);
      } catch (error) {
        console.warn(
          `Error fetching restaurants for ${place.cityName}:`,
          error
        );
      }
    }

    // Randomize and take 6
    restaurants = getRandomItems(allRestaurants, 6);
  }

  // Fallback to Firestore seed data if Wikipedia returns nothing
  if (restaurants.length === 0) {
    restaurants = await fetchRestaurantsFromFirestore(6);
  }

  // Create and display cards
  const restaurantCards = restaurants.map((restaurant) =>
    createRestaurantCard(restaurant)
  );
  displayCards("restaurants-container", restaurantCards);
};
