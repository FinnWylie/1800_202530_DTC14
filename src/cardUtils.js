// src/cardUtils.js
// Shared utility functions used by all card types (places, restaurants, activities)

import { db, auth } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

const HEART_ICON_PATH = "/images/heart-svgrepo-com.svg";
let currentUser = null;
let heartIconMarkup = null;

// Get the current user when authentication is ready
onAuthReady((user) => {
  currentUser = user;
});

// ============================================
// HELPER FUNCTIONS - Simple utilities
// ============================================

// Get random items from an array
export const getRandomItems = (arr, count) => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Generate star rating display (yellow stars for rating, white for empty)
export const generateStars = (rating) => {
  // Round to nearest whole number and make sure it's between 0 and 5
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

// Format names: convert "New_York" to "New York"
export const formatName = (name) => {
  return name
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Load heart icon from file
const loadHeartIcon = async () => {
  if (heartIconMarkup) return heartIconMarkup;
  try {
    const response = await fetch(HEART_ICON_PATH);
    heartIconMarkup = await response.text();
    return heartIconMarkup;
  } catch {
    // If file not found, use a simple SVG fallback
    heartIconMarkup =
      '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 21l-8-8a5.5 5.5 0 0 1 7.778-7.778L12 5.444l.222-.222A5.5 5.5 0 0 1 20 13l-8 8z" stroke="#ccc" fill="none"/></svg>';
    return heartIconMarkup;
  }
};

// ============================================
// SAVE/DELETE FUNCTIONS - For saving items to user profile
// ============================================

// Map item type to the field name in user document
const getFieldName = (type) => {
  const fieldMap = {
    place: "savedCountries",
    restaurant: "savedRestaurants",
    activity: "savedActivities",
  };
  return fieldMap[type] || null;
};

// Check if two items match (used to find saved items)
const itemsMatch = (type, item1, item2) => {
  if (type === "place") {
    return item1.country === item2.country && item1.city === item2.city;
  }
  return item1.name === item2.name;
};

// Get user document data from Firestore
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

// Check if an item is already saved by the user
export const isItemSaved = async (type, data) => {
  const userData = await getUserData();
  if (!userData) return false;

  const fieldName = getFieldName(type);
  if (!fieldName) return false;

  const savedArray = userData[fieldName] || [];
  return savedArray.some((item) => itemsMatch(type, item, data));
};

// Save an item to user's saved list
export const saveItem = async (type, data) => {
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

// Delete an item from user's saved list
export const deleteItem = async (type, data) => {
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

// ============================================
// HEART BUTTON - Create the save/delete heart button for cards
// ============================================

// Create a heart button that can save or delete items
export const createHeartButton = (label, type, data) => {
  const button = document.createElement("button");
  button.className =
    "absolute top-3 right-3 rounded-full shadow-sm p-1.5 bg-white/90 hover:scale-105 transition-all";
  button.setAttribute("aria-label", label);
  button.setAttribute("aria-pressed", "false");
  button.style.cursor = "pointer";
  button.style.pointerEvents = "auto";

  let pathElement = null;

  // Update heart appearance (filled = saved, outline = not saved)
  const updateHeartState = (saved) => {
    button.setAttribute("aria-pressed", saved);
    if (pathElement) {
      if (saved) {
        // Filled red heart when saved
        pathElement.setAttribute("fill", "#FF2D55");
        pathElement.setAttribute("stroke", "#FF2D55");
        button.style.backgroundColor = "rgba(255,45,85,0.12)";
      } else {
        // Outline heart when not saved
        pathElement.setAttribute("fill", "none");
        pathElement.setAttribute("stroke", "#000");
        button.style.backgroundColor = "rgba(255,255,255,0.92)";
      }
    }
  };

  // Load the heart icon
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

  // Check if item is already saved when button is created
  isItemSaved(type, data).then((saved) => {
    if (saved) updateHeartState(true);
  });

  // Handle click: save or delete the item
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

// ============================================
// WIKIPEDIA FUNCTIONS - Fetch images from Wikipedia
// ============================================

// Fetch Wikipedia image for a search query
export const fetchWikipediaImage = async (searchQuery) => {
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

// ============================================
// WIKIPEDIA SEARCH FUNCTIONS - Search Wikipedia for pages
// ============================================

// Search Wikipedia for pages matching a query
export const searchWikipedia = async (query, limit = 10) => {
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
export const getWikipediaPage = async (pageTitle) => {
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

// ============================================
// DISPLAY FUNCTION - Show cards in a container
// ============================================

// Display cards in a container on the page
export const displayCards = (containerId, cards) => {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = "";
    cards.forEach((card) => container.appendChild(card));
  }
};
