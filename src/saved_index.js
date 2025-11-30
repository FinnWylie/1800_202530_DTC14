// src/saved_index.js
// Saved items page - displays all saved items for the logged-in user
// Includes delete functionality

import { db } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";

let currentUser = null;

// Initialize auth
onAuthReady((user) => {
  currentUser = user;
  if (user) {
    loadSavedItems();
  } else {
    window.location.href = "loginSignup.html";
  }
});

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

// Load saved items from user document
const loadSavedItems = async () => {
  if (!currentUser) return;

  try {
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    if (!userDoc.exists()) {
      displayEmptyState();
      return;
    }

    const userData = userDoc.data();
    const items = [
      ...(userData.savedCountries || []).map((item) => ({
        ...item,
        type: "place",
      })),
      ...(userData.savedRestaurants || []).map((item) => ({
        ...item,
        type: "restaurant",
      })),
      ...(userData.savedActivities || []).map((item) => ({
        ...item,
        type: "activity",
      })),
    ];

    // Sort by savedAt timestamp (most recent first)
    items.sort((a, b) => {
      const timeA = a.savedAt ? new Date(a.savedAt).getTime() : 0;
      const timeB = b.savedAt ? new Date(b.savedAt).getTime() : 0;
      return timeB - timeA;
    });

    displaySavedItems(items);
  } catch (error) {
    console.error("Error loading saved items:", error);
    displayEmptyState();
  }
};

// Delete item from user document array
const deleteSavedItem = async (item) => {
  if (!currentUser) return false;
  try {
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    if (!userDoc.exists()) return false;

    const userData = userDoc.data();
    const fieldName = getFieldName(item.type);
    if (!fieldName) return false;

    const savedArray = userData[fieldName] || [];
    const itemToRemove = savedArray.find((saved) =>
      itemsMatch(item.type, saved, item)
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

// Display saved items
const displaySavedItems = (items) => {
  const container = document.getElementById("bookmarked-container");
  if (!container) return;

  container.innerHTML = "";

  if (items.length === 0) {
    displayEmptyState();
    return;
  }

  items.forEach((item) => {
    container.appendChild(createSavedItemCard(item));
  });
};

// Create saved item card with delete button
const createSavedItemCard = (item) => {
  const card = document.createElement("div");
  card.className = "mb-6";

  const inner = document.createElement("div");
  inner.className =
    "bg-neutral-300 rounded-2xl font-medium flex items-center gap-4 px-4 py-3 relative";

  // Delete button (X icon)
  const deleteBtn = document.createElement("button");
  deleteBtn.className =
    "absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors text-lg font-bold z-10";
  deleteBtn.innerHTML = "×";
  deleteBtn.setAttribute("aria-label", "Delete saved item");
  deleteBtn.style.lineHeight = "1";
  deleteBtn.addEventListener("click", async () => {
    if (
      confirm("Are you sure you want to remove this item from your saved list?")
    ) {
      const success = await deleteSavedItem(item);
      if (success) {
        card.remove();
        // Check if list is now empty
        const container = document.getElementById("bookmarked-container");
        if (container && container.children.length === 0) {
          displayEmptyState();
        }
      }
    }
  });
  inner.appendChild(deleteBtn);

  // Image
  const imageDiv = document.createElement("div");
  imageDiv.className =
    "bg-white w-36 h-24 flex items-center justify-center overflow-hidden rounded";
  if (item.imageUrl) {
    const img = document.createElement("img");
    img.src = item.imageUrl;
    img.alt = item.name || `${item.country} ${item.city}`;
    img.className = "w-full h-full object-cover";
    imageDiv.appendChild(img);
  } else {
    imageDiv.innerHTML = '<p class="text-gray-400">Image</p>';
  }

  // Content
  const content = document.createElement("div");
  content.className = "text-left leading-tight flex-1";

  if (item.type === "place") {
    content.innerHTML = `<h1 class="font-bold">${
      item.country || "Country"
    }</h1><h1>${item.city || "City"}</h1>`;
  } else if (item.type === "restaurant") {
    const rating = item.rating ? generateStars(item.rating) : "";
    content.innerHTML = `<h1 class="font-bold">${
      item.name || "Restaurant"
    }</h1>${rating ? `<p>${rating}</p>` : ""}`;
  } else if (item.type === "activity") {
    content.innerHTML = `<h1 class="font-bold">${item.name || "Activity"}</h1>${
      item.activityType
        ? `<p class="text-gray-600 text-sm">${item.activityType}</p>`
        : ""
    }`;
  }

  inner.appendChild(imageDiv);
  inner.appendChild(content);
  card.appendChild(inner);

  return card;
};

// Generate stars
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

// Display empty state
const displayEmptyState = () => {
  const container = document.getElementById("bookmarked-container");
  if (!container) return;

  container.innerHTML = `
    <div class="text-center py-12">
      <p class="text-gray-600 text-lg mb-4">No saved items yet</p>
      <p class="text-gray-500">Start saving places, restaurants, and activities from the home page!</p>
    </div>
  `;
};

function highlightCurrentPage() {
    console.log('highlighting page')
    let homeBtn = document.getElementById('homeSVG')
    let searchSVG = document.getElementById('searchSVG')
    let reviewSVG = document.getElementById('reviewSVG')
    let savedSVG = document.getElementById('savedSVG')
    let settingsSVG = document.getElementById('settingsSVG')
    homeBtn.setAttribute('stroke', '#3a4f41ff')
    searchSVG.setAttribute('stroke', '#3a4f41ff')
    reviewSVG.setAttribute('stroke', '#3a4f41ff')
    savedSVG.setAttribute('stroke', '#61b07eff')
    settingsSVG.setAttribute('stroke', '#3a4f41ff')
}
highlightCurrentPage()
