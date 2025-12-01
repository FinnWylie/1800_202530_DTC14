// Home page - loads and displays places, restaurants, and activities

// Import the three category modules
import { initializePlaces, fetchPlaces } from "./places.js";
import { initializeRestaurants } from "./restaurants.js";
import { initializeActivities } from "./activities.js";

// ============================================
// INITIALIZE PAGE - Load all three categories
// ============================================

// Initialize the page: load places, restaurants, and activities
const initializePage = async () => {
  // First, fetch places once and display them
  const places = await fetchPlaces(6);
  await initializePlaces(places);

  // Now load restaurants and activities in parallel (at the same time)
  // This makes them load simultaneously instead of one after another
  await Promise.all([
    initializeRestaurants(places),
    initializeActivities(places),
  ]);
};

// Start when page is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage);
} else {
  initializePage();
}
