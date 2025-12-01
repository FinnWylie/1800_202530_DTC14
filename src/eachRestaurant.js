// Restaurant detail page - loads Wikipedia content for a restaurant

import { auth, db } from "./firebaseConfig.js";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Get restaurant name from localStorage (set when clicking a restaurant card)
const RESTAURANT_NAME = localStorage["restaurant_name"];

// ============================================
// LOAD WIKIPEDIA PAGE - Fetch restaurant info from Wikipedia
// ============================================

async function loadWikipediaPage() {
  const loading = document.getElementById("loading");
  const error = document.getElementById("error");
  const content = document.getElementById("content");
  const title = document.getElementById("title");
  const image = document.getElementById("image");
  const paragraph = document.getElementById("paragraph");
  const link = document.getElementById("link");

  try {
    // Fetch page content from Wikipedia API
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts|pageimages&titles=${encodeURIComponent(
        RESTAURANT_NAME
      )}&exintro=1&explaintext=1&piprop=original`
    );

    const data = await response.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];

    if (pageId === "-1") {
      throw new Error("Restaurant not found");
    }

    const page = pages[pageId];

    // Get first paragraph (first non-empty text block)
    const extract = page.extract;
    const firstParagraph = extract.split("\n").find((p) => p.trim()) || extract;

    // Populate the page with restaurant info
    title.textContent = page.title;
    paragraph.textContent = firstParagraph;
    link.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(
      page.title
    )}`;

    // Show image if available
    if (page.original?.source) {
      image.src = page.original.source;
      image.alt = page.title;
    } else {
      image.style.display = "none";
    }

    // Hide loading, show content
    loading.classList.add("hidden");
    content.classList.remove("hidden");
    title.classList.remove("hidden");
  } catch (err) {
    loading.classList.add("hidden");
    error.classList.remove("hidden");
    error.querySelector("p").textContent = err.message;
  }
}

// ============================================
// ADD TO HISTORY - Save restaurant to user history
// ============================================

async function addHistoryRestaurant(userId, restaurantName) {
  const userRef = doc(db, "users", userId);

  try {
    await updateDoc(userRef, {
      history: arrayUnion(restaurantName),
    });
    console.log("History restaurant saved!");
  } catch (error) {
    console.error("Error adding restaurant:", error);
  }
}

// ============================================
// INITIALIZE PAGE - Load Wikipedia page when page loads
// ============================================

// Load the Wikipedia page
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadWikipediaPage);
} else {
  loadWikipediaPage();
}

// Save to history when user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    addHistoryRestaurant(user.uid, RESTAURANT_NAME);
  }
});
