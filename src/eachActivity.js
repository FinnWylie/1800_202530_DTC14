// Activity detail page - loads Wikipedia content for an activity

import { auth, db } from "./firebaseConfig.js";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { saveItem, deleteItem, isItemSaved } from "./cardUtils.js";

// Get activity name from localStorage (set when clicking an activity card)
const ACTIVITY_NAME = localStorage["activity_name"];

const data = {
  name: ACTIVITY_NAME,
};
let saved = false;

// ============================================
// LOAD WIKIPEDIA PAGE - Fetch activity info from Wikipedia
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
        ACTIVITY_NAME
      )}&exintro=1&explaintext=1&piprop=original`
    );

    const data = await response.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];

    if (pageId === "-1") {
      throw new Error("Activity not found");
    }

    const page = pages[pageId];

    // Get first paragraph (first non-empty text block)
    const extract = page.extract;
    const firstParagraph = extract.split("\n").find((p) => p.trim()) || extract;

    // Populate the page with activity info
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
// ADD TO HISTORY - Save activity to user history
// ============================================

async function addHistoryActivity(userId, activityName) {
  const userRef = doc(db, "users", userId);

  try {
    await updateDoc(userRef, {
      history: arrayUnion(activityName),
    });
    console.log("History activity saved!");
  } catch (error) {
    console.error("Error adding activity:", error);
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

// ============================================
// favorite the page
// ============================================

const checkIfSaved = async () => {
  const heartBtn = document.getElementById("heartBtn");

  if (heartBtn) {
    heartBtn.addEventListener("click", toggleSaved);
    const isSaved = await isItemSaved("activity", data);
    saved = isSaved;
    updateHeartState();
  }
};

const updateHeartState = () => {
  let heartBtn = document.getElementById("heartBtn");
  if (!heartBtn) return;

  const path = heartBtn.querySelector("path");
  if (!path) return;

  heartBtn.setAttribute("aria-pressed", saved);
  if (saved) {
    path.setAttribute("fill", "#FF2D55");
    path.setAttribute("stroke", "#FF2D55");
  } else {
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#000000");
  }
};

const toggleSaved = async () => {
  if (saved) {
    const success = await deleteItem("activity", data);
    if (success) {
      saved = false;
      updateHeartState();
    }
  } else {
    const success = await saveItem("activity", data);
    if (success) {
      saved = true;
      updateHeartState();
    }
  }
};

// Save to history and check if saved when user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    addHistoryActivity(user.uid, ACTIVITY_NAME);
    checkIfSaved();
  }
});
