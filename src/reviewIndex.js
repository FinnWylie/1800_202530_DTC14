import { db } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";
import {
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    doc as docRef
} from "firebase/firestore";
let testvar = false
const addReviewBtn = document.getElementById("areview");
if (addReviewBtn) {
    addReviewBtn.addEventListener("click", () => {
        window.location.replace("addReview.html");
    });
}

const displayEmptyState = () => {
    const container = document.getElementById("container");
    if (!container) return;

    container.innerHTML = `
    <div class="text-center py-12">
      <p class="text-gray-600 text-lg mb-4">You haven't left a review yet!</p>
      <p class="text-gray-500">Start by clicking the big green "Add Review" button</p>
    </div>
  `;
};

// Load reviews for the signed-in user
const loadSavedItems = async () => {
    if (!currentUser) return;

    try {
        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("userId", "==", currentUser.uid));
        const snap = await getDocs(q);

        if (snap.empty) {
            displayEmptyState();
            return;
        }

        const items = snap.docs.map(d => ({
            id: d.id,
            ...d.data(),
            type: "review",
        }));

        displaySavedItems(items);
    } catch (error) {
        console.error("Error loading saved items:", error);
        displayEmptyState();
    }
};

let currentUser = null;

// Initialize auth
onAuthReady((user) => {
    currentUser = user;
    if (user) {
        loadSavedItems();
    } else {
        // If you want guest users to be redirected:
        window.location.href = "loginSignup.html";
    }
});

// Delete a review doc from Firestore
async function deleteSavedItem(item) {
    if (!item || !item.id) return false;
    try {
        if (item.type === "review") {
            await deleteDoc(docRef(db, "reviews", item.id));
            localStorage.removeItem(
                "review_location",
                item.type === "review" ? item.country : item.city || item.country
            );
            return true;
        }
        return false;
    } catch (err) {
        console.error("Failed to delete item:", err);
        return false;
    }
}
async function test() {
    testvar = true
    // card.addEventListener("click", () => {
    //     if (testvar) {
    //         localStorage.setItem(
    //             "review_location",
    //             item.type === "review" ? item.country : item.city || item.country
    //         );
    //     }
    //     window.location.href = "../reviewPlace.html";
    // });
}

const createSavedItemCard = (item) => {
    const card = document.createElement("div");
    card.className = "mb-6 cursor-pointer";

    const inner = document.createElement("div");
    inner.className =
        "bg-neutral-300 rounded-2xl font-medium flex items-center gap-4 px-4 py-3 relative";


    const deleteBtn = document.createElement("button");
    deleteBtn.className =
        "absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors text-lg font-bold z-10";
    deleteBtn.innerHTML = "×";
    deleteBtn.setAttribute("aria-label", "Delete saved item");
    deleteBtn.style.lineHeight = "1";
    deleteBtn.addEventListener("click", async () => {
        if (confirm("Are you sure you want to delete this review?")) {
            const success = await deleteSavedItem(item);
            const idk = await test()
            if (success && idk) {
                testvar = false
                card.remove();
                const container = document.getElementById("container");
                if (container && container.children.length === 0) {
                    displayEmptyState();
                }
            } else {
                alert("Couldn't delete the review. Check console for errors.");

            }
        }
    });

    inner.appendChild(deleteBtn);

    // IMAGE
    const imageDiv = document.createElement("div");
    imageDiv.className =
        "bg-white w-36 h-24 flex items-center justify-center overflow-hidden rounded";

    const img = document.createElement("img");
    img.className = "w-full h-full object-cover";

    // If no valid imageURL exists, use a nice fallback image
    img.src = item.imageUrl && item.imageUrl.startsWith("http")
        ? item.imageUrl
        : "/assets/default-review.jpg"; // <-- add any image you want

    img.alt = "Review image";

    imageDiv.appendChild(img);



    const content = document.createElement("div");
    content.className = "text-left leading-tight flex-1";


    if (item.type === "review") {
        content.innerHTML = `
        <h1 class="font-bold text-lg mb-1"> ${escapeHtml(item.country || "Unknown Country")}</h1>
        <p class="text-sm text-gray-700 whitespace-pre-line mt-1">${escapeHtml(item.text || "No text")}</p>
    `;
    }

    card.addEventListener("click", () => {
        // Update localStorage with this card's location
        localStorage.setItem(
            "location_name",
            item.type === "review" ? item.country : item.city || item.country
        );

        // Navigate to review page
        window.location.href = "../eachPlace.html";
    });

    if (item.type === "place") {
        content.innerHTML = `
      <h1 class="font-bold">${escapeHtml(item.country || "Country")}</h1>
      <h1>${escapeHtml(item.city || "City")}</h1>
    `;

    }

    inner.appendChild(imageDiv);
    inner.appendChild(content);
    card.appendChild(inner);
    return card;

};

const displaySavedItems = (items) => {
    const container = document.getElementById("container");
    if (!container) return;

    container.innerHTML = "";

    if (!items || items.length === 0) {
        displayEmptyState();
        return;
    }

    items.forEach((item) => {
        container.appendChild(createSavedItemCard(item));
    });
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
    reviewSVG.setAttribute('stroke', '#61b07eff')
    savedSVG.setAttribute('stroke', '#3a4f41ff')
    settingsSVG.setAttribute('stroke', '#3a4f41ff')
}
highlightCurrentPage()

// Small helper to avoid HTML injection in card text
function escapeHtml(str) {
    if (!str) return "";
    return str
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
