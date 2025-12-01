// Saved items page - displays all saved items for the logged-in user
// Includes delete functionality, categories, click navigation, and images

import { db } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import {
  generateStars,
  fetchWikipediaImage,
  getWikipediaPage,
} from "./cardUtils.js";
import { getPlaceImageUrl } from "./places.js";

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
    const typeMap = [
      { field: "savedCountries", type: "place" },
      { field: "savedRestaurants", type: "restaurant" },
      { field: "savedActivities", type: "activity" },
    ];
    const items = typeMap.flatMap(({ field, type }) =>
      (userData[field] || []).map((item) => ({ ...item, type }))
    );

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

// Display saved items organized by categories
const displaySavedItems = (items) => {
  const container = document.getElementById("bookmarked-container");
  if (!container) return;

  container.innerHTML = "";

  if (items.length === 0) {
    displayEmptyState();
    return;
  }

  // Display each category if it has items
  const categories = [
    {
      type: "place",
      title: "Cities",
      items: items.filter((item) => item.type === "place"),
    },
    {
      type: "restaurant",
      title: "Restaurants",
      items: items.filter((item) => item.type === "restaurant"),
    },
    {
      type: "activity",
      title: "Tourist Attractions",
      items: items.filter((item) => item.type === "activity"),
    },
  ];

  categories.forEach((category) => {
    if (category.items.length > 0) {
      container.appendChild(
        createCategorySection(category.title, category.items)
      );
    }
  });
};

// Create a category section with title and cards (with simple dropdown)
const createCategorySection = (categoryTitle, items) => {
  const section = document.createElement("div");
  section.className = "pt-12 px-4";

  // Create category title (clickable for dropdown)
  const titleContainer = document.createElement("div");
  titleContainer.className =
    "bg-[#F5F3F1] text-[#254430] rounded-xl p-2 h-[52px] px-3 text-xl font-semibold border-2 border-[#5d866c] mb-6 cursor-pointer";
  titleContainer.innerHTML = `<h2>${categoryTitle}</h2>`;
  section.appendChild(titleContainer);

  const cardsContainer = document.createElement("div");
  cardsContainer.className = "cards-container mt-6";
  items.forEach((item) =>
    cardsContainer.appendChild(createSavedItemCard(item))
  );
  section.appendChild(cardsContainer);

  // Toggle dropdown on title click
  let isExpanded = true;
  titleContainer.addEventListener("click", () => {
    isExpanded = !isExpanded;
    cardsContainer.style.display = isExpanded ? "block" : "none";
  });

  return section;
};

// Create saved item card with delete button
const createSavedItemCard = (item) => {
  const card = document.createElement("div");
  card.className = "mb-6";

  const inner = document.createElement("div");
  inner.className =
    "bg-neutral-300 rounded-2xl font-medium flex items-center gap-4 px-4 py-3 relative cursor-pointer";
  // Ensure enough bottom padding so delete button area doesn't get cut off
  inner.style.paddingBottom = "0.75rem";

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.className =
    "absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors text-lg font-bold z-10";
  deleteBtn.innerHTML = "×";
  deleteBtn.setAttribute("aria-label", "Delete saved item");
  deleteBtn.style.lineHeight = "1";
  deleteBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (
      confirm("Are you sure you want to remove this item from your saved list?")
    ) {
      if (await deleteSavedItem(item)) {
        const cardsContainer = card.parentElement;
        const section = cardsContainer?.parentElement;

        if (cardsContainer.children.length === 1 && section) {
          section.remove();
        } else {
          card.remove();
        }

        if (!document.getElementById("bookmarked-container")?.children.length) {
          displayEmptyState();
        }
      }
    }
  });
  inner.appendChild(deleteBtn);

  // Image container
  const imageDiv = document.createElement("div");
  imageDiv.className =
    "bg-neutral-300 w-36 h-24 flex items-center justify-center overflow-hidden rounded";

  // Load image asynchronously (use saved image or fetch from Wikipedia)
  (async () => {
    let imageUrl = item.imageUrl?.trim();

    // If no image URL, try to fetch from Wikipedia
    if (!imageUrl) {
      if (item.type === "place") {
        // For places, use the same function as home page (tries multiple queries)
        imageUrl = await getPlaceImageUrl(item.city, item.country);
      } else if (item.type === "restaurant" || item.type === "activity") {
        // For restaurants and activities, get page data
        const page = await getWikipediaPage(item.name);
        imageUrl = page?.imageUrl || null;
      }
    }

    // Apply image if found
    if (imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = item.name || `${item.country} ${item.city}`;
      img.className = "w-full h-full object-cover";
      imageDiv.appendChild(img);
    } else {
      // Keep the grey background if no image found
      imageDiv.innerHTML = '<p class="text-gray-400 text-sm">Image</p>';
    }
  })();

  // Content
  const content = document.createElement("div");
  content.className = "text-left leading-tight flex-1";

  const contentMap = {
    place: `<h1 class="font-bold">${item.country || "Country"}</h1><h1>${
      item.city || "City"
    }</h1>`,
    restaurant: `<h1 class="font-bold">${item.name || "Restaurant"}</h1>${
      item.rating ? `<p>${generateStars(item.rating)}</p>` : ""
    }`,
    activity: `<h1 class="font-bold">${item.name || "Activity"}</h1>${
      item.activityType
        ? `<p class="text-gray-600 text-sm">${item.activityType}</p>`
        : ""
    }`,
  };
  content.innerHTML = contentMap[item.type] || "";

  inner.appendChild(imageDiv);
  inner.appendChild(content);

  // Make card clickable - redirect to detail page
  inner.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;

    const pageMap = {
      place: {
        key: "location_name",
        value: item.city || "",
        page: "eachPlace.html",
      },
      restaurant: {
        key: "restaurant_name",
        value: item.name || "",
        page: "eachRestaurant.html",
      },
      activity: {
        key: "activity_name",
        value: item.name || "",
        page: "eachActivity.html",
      },
    };

    const nav = pageMap[item.type];
    if (nav) {
      localStorage.setItem(nav.key, nav.value);
      window.location.href = nav.page;
    }
  });

  card.appendChild(inner);

  return card;
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
  console.log("highlighting page");
  let homeBtn = document.getElementById("homeSVG");
  let searchSVG = document.getElementById("searchSVG");
  let reviewSVG = document.getElementById("reviewSVG");
  let savedSVG = document.getElementById("savedSVG");
  let settingsSVG = document.getElementById("settingsSVG");
  homeBtn.setAttribute("stroke", "#3a4f41ff");
  searchSVG.setAttribute("stroke", "#3a4f41ff");
  reviewSVG.setAttribute("stroke", "#3a4f41ff");
  savedSVG.setAttribute("stroke", "#61b07eff");
  settingsSVG.setAttribute("stroke", "#3a4f41ff");
}
highlightCurrentPage();
