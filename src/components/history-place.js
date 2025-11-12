// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// ^^^ in demo code is replaced by vvv
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { auth, db } from "/src/firebaseConfig.js";
import {collection, getDocs} from "firebase/firestore";

// Function to populate search history places
function populateSearchHistory() {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const userId = user.uid;

                // Get the searchHistory collection
                const searchHistoryRef = firebase.firestore()
                    .collection("users")
                    .doc(userId)
                    .collection("searchHistory");

                const searchSnapshot = await searchHistoryRef.get();

                // Create array to store unique places
                const places = [];
                const seenPlaces = new Set(); // To track unique place names

                searchSnapshot.forEach((doc) => {
                    const data = doc.data();
                    const placeName = data.place || data.name; // Adjust field name as needed

                    // Only add if we haven't seen this place before
                    if (placeName && !seenPlaces.has(placeName)) {
                        seenPlaces.add(placeName);
                        places.push({
                            id: doc.id,
                            name: placeName,
                            ...data // Include all other data if needed
                        });
                    }
                });

                // Sort places (optional - by name alphabetically)
                places.sort((a, b) => a.name.localeCompare(b.name));

                // Get the container where you want to add the history places
                const container = document.getElementById("history-place"); // Replace with your container ID

                // Clear existing content (optional)
                container.innerHTML = '';

                // Create a history-place element for each unique place
                places.forEach((place) => {
                    const historyPlaceElement = document.createElement('history-place');
                    historyPlaceElement.setAttribute('data-place-name', place.name);
                    historyPlaceElement.setAttribute('data-doc-id', place.id);
                    container.appendChild(historyPlaceElement);
                });

                console.log("Unique places:", places);

            } catch (error) {
                console.error("Error getting search history:", error);
            }
        } else {
            console.log("No user is signed in");
        }
    });
}

// Call the function
populateSearchHistory();


class HistoryPlace extends HTMLElement {
    connectedCallback() {
        const placeName = this.getAttribute('data-place-name') || 'Unknown Place';
        const docId = this.getAttribute('data-doc-id') || '';

        this.innerHTML = `
            <div class="historyPlace flex flex-row" onclick="location.href='#${docId}'">
                <div class="historyIcon">
                    <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#3C3E7C"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                    >
                        <path d="M4 21v-15c0 -1 1 -2 2 -2h5c1 0 2 1 2 2v15" />
                        <path d="M16 8h2c1 0 2 1 2 2v11" />
                        <path d="M3 21h18" />
                        <path d="M10 12v0" />
                        <path d="M10 16v0" />
                        <path d="M10 8v0" />
                        <path d="M7 12v0" />
                        <path d="M7 16v0" />
                        <path d="M7 8v0" />
                        <path d="M17 12v0" />
                        <path d="M17 16v0" />
                    </svg>
                </div>
                <p class="historyPlaceName my-auto pl-2 text-xl">${placeName}</p>
            </div>
        `;
    }
}

customElements.define('history-place', HistoryPlace);