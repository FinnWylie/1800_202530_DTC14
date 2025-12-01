// Handles activity cards: fetching activities and creating activity cards

import { db } from "./firebaseConfig.js";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getRandomItems,
  createHeartButton,
  displayCards,
  searchWikipedia,
  getWikipediaPage,
} from "./cardUtils.js";

// ============================================
// FETCH ACTIVITIES FROM WIKIPEDIA - Get activities based on cities
// ============================================

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

      // Only include pages that look like actual tourist attractions
      // Must contain attraction-related keywords in the title
      const attractionKeywords = [
        "museum",
        "park",
        "palace",
        "castle",
        "cathedral",
        "church",
        "temple",
        "monument",
        "bridge",
        "tower",
        "fort",
        "fortress",
        "plaza",
        "square",
        "garden",
        "zoo",
        "aquarium",
        "theater",
        "theatre",
        "opera",
        "hall",
        "center",
        "centre",
        "building",
        "market",
        "bazaar",
        "beach",
        "mountain",
        "hill",
        "lake",
        "river",
        "waterfall",
        "cave",
        "ruins",
        "archaeological",
      ];

      const hasAttractionKeyword = attractionKeywords.some((keyword) =>
        titleLower.includes(keyword)
      );

      // Skip if it doesn't have attraction keywords
      if (!hasAttractionKeyword) {
        continue;
      }

      // Skip products, brands, concepts, etc.
      const skipKeywords = [
        "eau de",
        "perfume",
        "cologne",
        "fragrance",
        "brand",
        "company",
        "corporation",
        "song",
        "album",
        "film",
        "movie",
        "book",
        "novel",
        "theory",
        "concept",
        "method",
        "technique",
      ];

      const hasSkipKeyword = skipKeywords.some((keyword) =>
        titleLower.includes(keyword)
      );

      if (hasSkipKeyword) {
        continue;
      }

      // Only include pages that look like actual attraction names
      // Attraction names are usually specific places
      if (
        title.length < 60 &&
        !titleLower.includes(" in ") &&
        !titleLower.includes(" of ") &&
        !allResults.find((a) => a.name === title)
      ) {
        const page = await getWikipediaPage(title);
        if (page) {
          // Double-check the page content mentions it's a place/attraction
          const extract = page.extract.toLowerCase();
          const isPlaceContent =
            extract.includes("located") ||
            extract.includes("built") ||
            extract.includes("construction") ||
            extract.includes("attraction") ||
            extract.includes("tourist") ||
            extract.includes("visitor") ||
            extract.includes("landmark") ||
            extract.includes("monument");

          // Only add if the content suggests it's actually a place/attraction
          if (isPlaceContent) {
            allResults.push({
              name: page.title,
              rating: 4.0 + Math.random() * 1.0,
              type: "Attraction",
              photoUrl: page.imageUrl,
            });
          }
        }
      }

      if (allResults.length >= count) break;
    }

    if (allResults.length >= count) break;
  }

  return allResults.slice(0, count);
};

// ============================================
// FETCH ACTIVITIES FROM FIRESTORE - Fallback seed data
// ============================================

// Seed data: activities to add if collection is empty
const activitiesSeedData = [
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

// Fetch activities from Firestore (fallback only)
const fetchActivitiesFromFirestore = async (count = 6) => {
  try {
    const ref = collection(db, "activities");
    const snapshot = await getDocs(ref);

    // If no activities exist, add seed data
    if (snapshot.empty) {
      for (const item of activitiesSeedData) {
        await addDoc(ref, { ...item, createdAt: serverTimestamp() });
      }
    }

    // Get all activities
    const items = [];
    (await getDocs(ref)).forEach((doc) =>
      items.push({ id: doc.id, ...doc.data() })
    );

    // Return random selection
    return getRandomItems(items, count);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
};

// ============================================
// CREATE ACTIVITY CARD - Build the activity card element
// ============================================

// Create an activity card with name, image, and heart button
export const createActivityCard = (activityData) => {
  const div = document.createElement("div");
  div.className =
    "relative bg-neutral-300 rounded-2xl w-44 h-36 py-4 px-5 shrink-0 overflow-hidden cursor-pointer";

  // Add image if photoUrl exists
  if (activityData.photoUrl) {
    div.style.backgroundImage = `url("${activityData.photoUrl}")`;
    div.style.backgroundSize = "cover";
    div.style.backgroundPosition = "center";

    // Add dark overlay for better text readability
    const overlay = document.createElement("div");
    overlay.className = "absolute inset-0 rounded-2xl bg-black/30";
    overlay.style.pointerEvents = "none";
    div.appendChild(overlay);
  }

  // Content with activity name
  const content = document.createElement("div");
  content.className = "flex h-full flex-col justify-end gap-1 relative z-10";

  // Make text white if there's an image
  if (activityData.photoUrl) {
    content.style.color = "white";
    content.style.textShadow = "0 1px 3px rgba(0,0,0,0.5)";
  }

  content.innerHTML = `<p class="font-medium">${activityData.name}</p>`;
  div.appendChild(content);

  // When card is clicked, go to detail page (but not if clicking heart button)
  div.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    // Store activity name for the detail page
    localStorage.setItem("activity_name", activityData.name);
    window.location.href = "eachActivity.html";
  });

  // Add heart button for saving
  const heartButton = createHeartButton("Save this activity", "activity", {
    name: activityData.name,
    activityType: activityData.type || "",
  });
  heartButton.style.zIndex = "20";
  div.appendChild(heartButton);

  return div;
};

// ============================================
// INITIALIZE ACTIVITIES - Load and display activities
// ============================================

// Fetch activities and display them on the page
// Takes places array to fetch activities from those cities
export const initializeActivities = async (places = []) => {
  let activities = [];

  // Try to get activities from Wikipedia based on places
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

  // Fallback to Firestore seed data if Wikipedia returns nothing
  if (activities.length === 0) {
    activities = await fetchActivitiesFromFirestore(6);
  }

  // Create and display cards
  const activityCards = activities.map((activity) =>
    createActivityCard(activity)
  );
  displayCards("popular-container", activityCards);
};
