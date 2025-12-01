// src/places.js
// Handles place cards: fetching places and creating place cards

import { db } from "./firebaseConfig.js";
import { collection, getDocs } from "firebase/firestore";
import { 
  getRandomItems, 
  formatName, 
  createHeartButton, 
  fetchWikipediaImage,
  displayCards 
} from "./cardUtils.js";

// ============================================
// FETCH PLACES - Get places from Firestore
// ============================================

// Fetch places from countries subcollections in Firestore
export const fetchPlaces = async (count = 6) => {
  // List of countries that exist in the database
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
  
  // Get cities from each country
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

  // Return random selection of places
  return allPlaces.length > 0 ? getRandomItems(allPlaces, count) : [];
};

// ============================================
// GET PLACE IMAGE - Fetch image from Wikipedia
// ============================================

// Try multiple search queries to find an image for the place
export const getPlaceImageUrl = async (cityName, countryName) => {
  const queries = [
    `${cityName}, ${countryName}`,
    cityName,
    `${cityName} ${countryName}`,
    countryName,
    `Flag of the ${countryName}`,
    `Flag of ${countryName}`,
    `${countryName} flag`,
  ];
  
  // Try each query until we find an image
  for (const query of queries) {
    const url = await fetchWikipediaImage(query);
    if (url) return url;
  }
  return null;
};

// ============================================
// CREATE PLACE CARD - Build the place card element
// ============================================

// Create a place card with image, country/city name, and heart button
export const createPlaceCard = (placeData) => {
  const div = document.createElement("div");
  div.className =
    "relative rounded-2xl w-44 h-36 py-4 px-5 shrink-0 overflow-hidden cursor-pointer";
  // Set grey background while image loads
  div.style.backgroundColor = "#d4d4d4";

  // Dark overlay for better text visibility
  const overlay = document.createElement("div");
  overlay.className = "absolute inset-0 rounded-2xl";
  Object.assign(overlay.style, {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    pointerEvents: "none",
    zIndex: "1",
    display: "none",
  });
  div.appendChild(overlay);

  // Content with country and city name
  const content = document.createElement("div");
  content.className = "flex h-full flex-col justify-end gap-1 relative z-10";
  content.innerHTML = `<h1 class="font-bold">${placeData.countryName}</h1><h1>${placeData.cityName}</h1>`;
  div.appendChild(content);

  // When card is clicked, go to detail page (but not if clicking heart button)
  div.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    // Store city name for the detail page
    localStorage.setItem("location_name", placeData.cityName);
    window.location.href = "eachPlace.html";
  });

  // Load image asynchronously
  (async () => {
    const imageUrl =
      placeData.imageUrl?.trim() ||
      (await getPlaceImageUrl(placeData.cityName, placeData.countryName));
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

  // Add heart button for saving
  const heartButton = createHeartButton("Save this place", "place", {
    country: placeData.countryName,
    city: placeData.cityName,
    imageUrl: placeData.imageUrl,
  });
  heartButton.style.zIndex = "20";
  div.appendChild(heartButton);

  return div;
};

// ============================================
// INITIALIZE PLACES - Load and display places
// ============================================

// Fetch places and display them on the page
// Optionally accepts places array to avoid fetching twice
export const initializePlaces = async (places = null) => {
  const placesToUse = places || await fetchPlaces(6);
  const placeCards = placesToUse.map((place) => createPlaceCard(place));
  displayCards("places-container", placeCards);
  return placesToUse; // Return places so we can reuse them
};
