// src/homescript.js
// Home page - fetches data from Firestore and displays recommendations

import { db, auth } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
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

  let pathElement = null;
  let savedDocId = null;

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

// Create card components
const createCard = (type, data, heartData) => {
  const div = document.createElement("div");
  div.className =
    "relative bg-neutral-300 rounded-2xl w-44 h-36 py-4 px-5 shrink-0 overflow-hidden";

  div.appendChild(createHeartButton(`Save this ${type}`, type, heartData));

  const content = document.createElement("div");
  content.className = "flex h-full flex-col justify-end gap-1";

  if (type === "place") {
    content.innerHTML = `<h1 class="font-bold">${data.countryName}</h1><h1>${data.cityName}</h1>`;
  } else if (type === "restaurant") {
    content.innerHTML = `<p>${data.name}</p><p>${generateStars(
      data.rating
    )}</p>`;
  } else {
    content.innerHTML = `<p>${data.name}</p>`;
  }

  div.appendChild(content);
  return div;
};

// Fetch places from countries subcollections
const fetchPlaces = async (count = 6) => {
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
  const restaurants = await fetchData("restaurants", restaurantsData, 6);
  const activities = await fetchData("activities", activitiesData, 6);

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
      createCard("restaurant", r, { name: r.name, rating: r.rating })
    )
  );
  displayCards(
    "popular-container",
    activities.map((a) =>
      createCard("activity", a, { name: a.name, activityType: a.type || "" })
    )
  );
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage);
} else {
  initializePage();
}
