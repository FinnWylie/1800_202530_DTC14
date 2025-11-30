// src/homescript.js
// Home page - fetches data from Firestore and displays recommendations

import { db, auth } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";

const HEART_ICON_PATH = "/images/heart-svgrepo-com.svg";
let currentUser = null;
let heartIconMarkup = null;

onAuthReady((user) => {
  currentUser = user;
});

// Helper functions
const getRandomItems = (arr, count) => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const generateStars = (rating) => {
  // Round to nearest whole number and clamp between 0 and 5
  const roundedRating = Math.min(5, Math.max(0, Math.round(rating)));
  const emptyStars = 5 - roundedRating;

  // Yellow stars for the rating
  const yellowStars = "★".repeat(roundedRating);

  // White stars for the remainder
  const whiteStars = "★".repeat(emptyStars);

  // Return HTML with proper styling
  if (emptyStars > 0) {
    return `<span class="text-yellow-600">${yellowStars}</span><span class="text-white">${whiteStars}</span>`;
  }
  return `<span class="text-yellow-600">${yellowStars}</span>`;
};

const formatName = (name) => {
  return name
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const loadHeartIcon = async () => {
  if (heartIconMarkup) return heartIconMarkup;
  try {
    const response = await fetch(HEART_ICON_PATH);
    heartIconMarkup = await response.text();
    return heartIconMarkup;
  } catch {
    heartIconMarkup =
      '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 21l-8-8a5.5 5.5 0 0 1 7.778-7.778L12 5.444l.222-.222A5.5 5.5 0 0 1 20 13l-8 8z" stroke="#ccc" fill="none"/></svg>';
    return heartIconMarkup;
  }
};

// Map item type to user document field name
const getFieldName = (type) => {
  const fieldMap = {
    place: "savedCountries",
    restaurant: "savedRestaurants",
    activity: "savedActivities",
  };
  return fieldMap[type] || null;
};

// Helper: Check if two items match based on type
const itemsMatch = (type, item1, item2) => {
  if (type === "place") {
    return item1.country === item2.country && item1.city === item2.city;
  }
  return item1.name === item2.name;
};

// Helper: Get user document data
const getUserData = async () => {
  if (!currentUser) return null;
  try {
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

// Check if item is saved
const isItemSaved = async (type, data) => {
  const userData = await getUserData();
  if (!userData) return false;

  const fieldName = getFieldName(type);
  if (!fieldName) return false;

  const savedArray = userData[fieldName] || [];
  return savedArray.some((item) => itemsMatch(type, item, data));
};

// Save item to user document array
const saveItem = async (type, data) => {
  if (!currentUser) {
    alert("Please log in to save items");
    return false;
  }
  try {
    const fieldName = getFieldName(type);
    if (!fieldName) {
      console.error("Invalid item type:", type);
      return false;
    }

    const itemToSave = {
      ...data,
      savedAt: new Date().toISOString(),
    };

    await updateDoc(doc(db, "users", currentUser.uid), {
      [fieldName]: arrayUnion(itemToSave),
    });

    return true;
  } catch (error) {
    console.error("Error saving item:", error);
    alert("Failed to save item");
    return false;
  }
};

// Delete item from user document array
const deleteItem = async (type, data) => {
  const userData = await getUserData();
  if (!userData) return false;

  try {
    const fieldName = getFieldName(type);
    if (!fieldName) return false;

    const savedArray = userData[fieldName] || [];
    const itemToRemove = savedArray.find((item) =>
      itemsMatch(type, item, data)
    );

    if (!itemToRemove) return false;

    await updateDoc(doc(db, "users", currentUser.uid), {
      [fieldName]: arrayRemove(itemToRemove),
    });

    return true;
  } catch (error) {
    console.error("Error deleting item:", error);
    alert("Failed to delete item");
    return false;
  }
};

// Create heart button with save/delete toggle
const createHeartButton = (label, type, data) => {
  const button = document.createElement("button");
  button.className =
    "absolute top-3 right-3 rounded-full shadow-sm p-1.5 bg-white/90 hover:scale-105 transition-all";
  button.setAttribute("aria-label", label);
  button.setAttribute("aria-pressed", "false");
  // Ensure entire button area is clickable
  button.style.cursor = "pointer";
  button.style.pointerEvents = "auto";

  let pathElement = null;

  const updateHeartState = (saved) => {
    button.setAttribute("aria-pressed", saved);
    if (pathElement) {
      if (saved) {
        pathElement.setAttribute("fill", "#FF2D55");
        pathElement.setAttribute("stroke", "#FF2D55");
        button.style.backgroundColor = "rgba(255,45,85,0.12)";
      } else {
        pathElement.setAttribute("fill", "none");
        pathElement.setAttribute("stroke", "#000");
        button.style.backgroundColor = "rgba(255,255,255,0.92)";
      }
    }
  };

  loadHeartIcon().then((markup) => {
    button.innerHTML = markup;
    const svg = button.querySelector("svg");
    svg?.setAttribute("width", "24");
    svg?.setAttribute("height", "24");
    pathElement = button.querySelector("path");
    if (pathElement) {
      pathElement.setAttribute("fill", "none");
      pathElement.setAttribute("stroke", "#000");
      pathElement.setAttribute("stroke-width", "1.8");
    }
  });

  // Check initial saved state
  isItemSaved(type, data).then((saved) => {
    if (saved) updateHeartState(true);
  });

  button.addEventListener("click", async () => {
    const isCurrentlySaved = button.getAttribute("aria-pressed") === "true";
    if (!isCurrentlySaved) {
      // Save item
      const success = await saveItem(type, data);
      if (success) {
        updateHeartState(true);
      }
    } else {
      // Delete item
      const success = await deleteItem(type, data);
      if (success) {
        updateHeartState(false);
      }
    }
  });

  return button;
};

// Helper function to fetch Wikipedia image for a given search query
const fetchWikipediaImage = async (searchQuery) => {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&titles=${encodeURIComponent(
        searchQuery
      )}&piprop=original`
    );
    const pages = (await response.json()).query?.pages;
    const page = pages?.[Object.keys(pages)[0]];
    return page && Object.keys(pages)[0] !== "-1" && page.original?.source
      ? page.original.source
      : null;
  } catch {
    return null;
  }
};

// Search Wikipedia for pages matching a query
const searchWikipedia = async (query, limit = 10) => {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(
      query
    )}&srlimit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.query?.search) {
      return data.query.search.map((item) => item.title);
    }
    return [];
  } catch (error) {
    console.error("Wikipedia search error:", error);
    return [];
  }
};

// Get page content and image from Wikipedia
const getWikipediaPage = async (pageTitle) => {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts|pageimages&titles=${encodeURIComponent(
      pageTitle
    )}&exintro=1&explaintext=1&piprop=original`;
    const response = await fetch(url);
    const data = await response.json();

    const pages = data.query?.pages;
    if (!pages) return null;

    const pageId = Object.keys(pages)[0];
    if (pageId === "-1") return null;

    const page = pages[pageId];
    return {
      title: page.title,
      extract: page.extract || "",
      imageUrl: page.original?.source || null,
    };
  } catch (error) {
    console.error("Wikipedia page error:", error);
    return null;
  }
};

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
      // Skip list pages, categories, and pages that are not actual restaurant names
      const titleLower = title.toLowerCase();
      if (
        titleLower.includes("list of") ||
        titleLower.includes("category:") ||
        titleLower.includes("restaurants in") ||
        titleLower.includes("dining in") ||
        titleLower.startsWith("category")
      ) {
        continue;
      }

      // Only include pages that look like actual restaurant names
      // Restaurant names are usually short and don't contain "in" or "of"
      if (
        title.length < 50 &&
        !titleLower.includes(" in ") &&
        !titleLower.includes(" of ") &&
        (titleLower.includes("restaurant") ||
          titleLower.includes("cafe") ||
          titleLower.includes("bistro") ||
          titleLower.includes("bar") ||
          titleLower.includes("grill"))
      ) {
        const page = await getWikipediaPage(title);
        if (page && !allResults.find((r) => r.name === page.title)) {
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

    if (allResults.length >= count) break;
  }

  return allResults.slice(0, count);
};

// Get tourist attractions for a city using Wikipedia
const getActivitiesFromWikipedia = async (cityName, countryName, count = 6) => {
  // Search for specific tourist attractions (not lists)
  const attractionQueries = [
    `tourist attraction ${cityName}`,
    `landmark ${cityName}`,
    `monument ${cityName}`,
    `museum ${cityName}`,
    `bridge ${cityName}`,
    `park ${cityName}`,
    `temple ${cityName}`,
    `cathedral ${cityName}`,
    `palace ${cityName}`,
    `castle ${cityName}`,
  ];

  const allResults = [];

  for (const query of attractionQueries) {
    const titles = await searchWikipedia(query, 10);

    for (const title of titles) {
      // Skip list pages, categories, and generic pages
      const titleLower = title.toLowerCase();
      if (
        titleLower.includes("list of") ||
        titleLower.includes("category:") ||
        titleLower.includes("tourist attractions in") ||
        titleLower.includes("landmarks in") ||
        titleLower.startsWith("category")
      ) {
        continue;
      }

      // Only include pages that look like actual attraction names
      // Attraction names are usually specific places, not generic terms
      if (
        title.length < 60 &&
        !titleLower.includes(" in ") &&
        !titleLower.includes(" of ") &&
        !allResults.find((a) => a.name === title)
      ) {
        const page = await getWikipediaPage(title);
        if (page) {
          allResults.push({
            name: page.title,
            rating: 4.0 + Math.random() * 1.0,
            type: "Attraction",
            photoUrl: page.imageUrl,
          });
        }
      }

      if (allResults.length >= count) break;
    }

    if (allResults.length >= count) break;
  }

  return allResults.slice(0, count);
};

// Generate image URL for places using Wikipedia API with multiple fallback strategies
const getPlaceImageUrl = async (cityName, countryName) => {
  const queries = [
    `${cityName}, ${countryName}`,
    cityName,
    `${cityName} ${countryName}`,
    countryName,
    `Flag of the ${countryName}`,
    `Flag of ${countryName}`,
    `${countryName} flag`,
  ];
  for (const query of queries) {
    const url = await fetchWikipediaImage(query);
    if (url) return url;
  }
  return null;
};

// Create card components
const createCard = (type, data, heartData) => {
  const div = document.createElement("div");

  // For place cards only: add background image, otherwise keep grey background
  if (type === "place") {
    div.className =
      "relative rounded-2xl w-44 h-36 py-4 px-5 shrink-0 overflow-hidden cursor-pointer";
    // Set fallback grey color while image loads
    div.style.backgroundColor = "#d4d4d4";

    const overlay = document.createElement("div");
    overlay.className = "absolute inset-0 rounded-2xl";
    Object.assign(overlay.style, {
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      pointerEvents: "none",
      zIndex: "1",
      display: "none",
    });
    div.appendChild(overlay);

    // Create content element first so we can reference it in async function
    const content = document.createElement("div");
    content.className = "flex h-full flex-col justify-end gap-1 relative z-10";
    content.innerHTML = `<h1 class="font-bold">${data.countryName}</h1><h1>${data.cityName}</h1>`;
    div.appendChild(content);

    // Make card clickable to navigate to eachPlace page
    div.addEventListener("click", (e) => {
      // Don't navigate if clicking on the heart button
      if (e.target.closest("button")) return;
      // Store only city name (same format as search functionality)
      localStorage.setItem("location_name", data.cityName);
      window.location.href = "eachPlace.html";
    });

    // Load image asynchronously
    (async () => {
      const imageUrl =
        data.imageUrl?.trim() ||
        (await getPlaceImageUrl(data.cityName, data.countryName));
      if (imageUrl) {
        Object.assign(div.style, {
          backgroundImage: `url("${imageUrl}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        });
        overlay.style.display = "block";
        Object.assign(content.style, {
          color: "white",
          textShadow: "0 1px 3px rgba(0,0,0,0.5)",
        });
      }
    })();
  } else {
    // Restaurants and activities: add image if available, otherwise grey background
    div.className =
      "relative bg-neutral-300 rounded-2xl w-44 h-36 py-4 px-5 shrink-0 overflow-hidden";

    // Add image if photoUrl exists
    if (data.photoUrl) {
      div.style.backgroundImage = `url("${data.photoUrl}")`;
      div.style.backgroundSize = "cover";
      div.style.backgroundPosition = "center";

      // Add dark overlay for better text readability
      const overlay = document.createElement("div");
      overlay.className = "absolute inset-0 rounded-2xl bg-black/30";
      overlay.style.pointerEvents = "none";
      div.appendChild(overlay);
    }
  }

  const heartButton = createHeartButton(`Save this ${type}`, type, heartData);
  heartButton.style.zIndex = "20";
  div.appendChild(heartButton);

  if (type !== "place") {
    const content = document.createElement("div");
    content.className = "flex h-full flex-col justify-end gap-1 relative z-10";

    // Make text white if there's an image
    if (data.photoUrl) {
      content.style.color = "white";
      content.style.textShadow = "0 1px 3px rgba(0,0,0,0.5)";
    }

    if (type === "restaurant") {
      // Just show restaurant name and stars (no location, no description)
      content.innerHTML = `<p class="font-medium">${
        data.name
      }</p><p>${generateStars(data.rating)}</p>`;
    } else {
      // Activities/Tourist attractions - just show the name
      content.innerHTML = `<p class="font-medium">${data.name}</p>`;
    }
    div.appendChild(content);
  }

  return div;
};

// Fetch places from countries subcollections
// Uses hardcoded country list for reliability and performance
const fetchPlaces = async (count = 6) => {
  // Hardcoded list of countries that exist in the database
  // To add/remove countries: update this list and ensure they exist in Firestore at countries/{countryId}/cities
  // Expanded list based on searchIndex.js suggestions for more variety on homepage
  const knownCountries = [
    "Argentina",
    "Australia",
    "Austria",
    "Belgium",
    "Brazil",
    "Canada",
    "Chile",
    "China",
    "Colombia",
    "Czech_Republic",
    "Denmark",
    "Egypt",
    "Finland",
    "France",
    "Germany",
    "Greece",
    "Hungary",
    "India",
    "Indonesia",
    "Ireland",
    "Italy",
    "Japan",
    "Kenya",
    "Malaysia",
    "Mexico",
    "Morocco",
    "Netherlands",
    "New_Zealand",
    "Norway",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Romania",
    "Russia",
    "Singapore",
    "South_Africa",
    "South_Korea",
    "Spain",
    "Sweden",
    "Switzerland",
    "Thailand",
    "Turkey",
    "Tuvalu",
    "United_Kingdom",
    "United_States",
    "Vietnam",
    "Maldives",
    "Honduras",
  ];

  const allPlaces = [];
  for (const countryId of knownCountries) {
    try {
      const citiesSnapshot = await getDocs(
        collection(db, "countries", countryId, "cities")
      );
      citiesSnapshot.forEach((cityDoc) => {
        const cityData = cityDoc.data();
        allPlaces.push({
          countryName: formatName(countryId),
          cityName: formatName(cityData.name || cityData.city || cityDoc.id),
          imageUrl: cityData.imageUrl || cityData.image || "",
        });
      });
    } catch (error) {
      console.warn(`Error accessing ${countryId}:`, error.message);
    }
  }

  return allPlaces.length > 0 ? getRandomItems(allPlaces, count) : [];
};

// Seed and fetch data
const fetchData = async (collectionName, seedData, count = 6) => {
  try {
    const ref = collection(db, collectionName);
    const snapshot = await getDocs(ref);
    if (snapshot.empty) {
      for (const item of seedData) {
        await addDoc(ref, { ...item, createdAt: serverTimestamp() });
      }
    }
    const items = [];
    (await getDocs(ref)).forEach((doc) =>
      items.push({ id: doc.id, ...doc.data() })
    );
    return getRandomItems(items, count);
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
};

// Initialize page
const initializePage = async () => {
  const restaurantsData = [
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

  const activitiesData = [
    { name: "Museum Tour", type: "Museum", rating: 4.5 },
    { name: "Central Park", type: "Park", rating: 4.8 },
    { name: "Beach Day", type: "Beach", rating: 4.7 },
    { name: "Mountain Hiking", type: "Mountain", rating: 4.6 },
    { name: "Temple Visit", type: "Temple", rating: 4.4 },
    { name: "Castle Tour", type: "Castle", rating: 4.9 },
    { name: "Local Market", type: "Market", rating: 4.3 },
    { name: "Botanical Garden", type: "Garden", rating: 4.5 },
    { name: "Historic Monument", type: "Monument", rating: 4.6 },
    { name: "Theater Show", type: "Theater", rating: 4.7 },
  ];

  const places = await fetchPlaces(6);

  // Get restaurants from multiple cities (use all cities from places)
  let restaurants = [];
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

  // Fallback to seed data if Wikipedia returns nothing
  if (restaurants.length === 0) {
    restaurants = await fetchData("restaurants", restaurantsData, 6);
  }

  // Get activities from multiple cities (use all cities from places)
  let activities = [];
  if (places.length > 0) {
    const allActivities = [];
    const activitiesPerCity = Math.ceil(6 / places.length); // Distribute across cities

    // Fetch activities from each city
    for (const place of places) {
      try {
        const cityActivities = await getActivitiesFromWikipedia(
          place.cityName,
          place.countryName,
          activitiesPerCity + 1 // Get a few extra in case some fail
        );
        allActivities.push(...cityActivities);
      } catch (error) {
        console.warn(`Error fetching activities for ${place.cityName}:`, error);
      }
    }

    // Randomize and take 6
    activities = getRandomItems(allActivities, 6);
  }

  // Fallback to seed data if Wikipedia returns nothing
  if (activities.length === 0) {
    activities = await fetchData("activities", activitiesData, 6);
  }

  const displayCards = (containerId, cards) => {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = "";
      cards.forEach((card) => container.appendChild(card));
    }
  };

  displayCards(
    "places-container",
    places.map((p) =>
      createCard("place", p, {
        country: p.countryName,
        city: p.cityName,
        imageUrl: p.imageUrl,
      })
    )
  );
  displayCards(
    "restaurants-container",
    restaurants.map((r) =>
      createCard("restaurant", r, {
        name: r.name,
        rating: r.rating,
      })
    )
  );
  displayCards(
    "popular-container",
    activities.map((a) => createCard("activity", a, { name: a.name }))
  );


};

function highlightCurrentPage() {
    console.log('highlighting page')
    let homeBtn = document.getElementById('homeSVG')
    let searchSVG = document.getElementById('searchSVG')
    let reviewSVG = document.getElementById('reviewSVG')
    let savedSVG = document.getElementById('savedSVG')
    let settingsSVG = document.getElementById('settingsSVG')
    homeBtn.setAttribute('stroke', '#61b07eff')
    searchSVG.setAttribute('stroke', '#3a4f41ff')
    reviewSVG.setAttribute('stroke', '#3a4f41ff')
    savedSVG.setAttribute('stroke', '#3a4f41ff')
    settingsSVG.setAttribute('stroke', '#3a4f41ff')
}
highlightCurrentPage()

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage);
} else {
  initializePage();
}
