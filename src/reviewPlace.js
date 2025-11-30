import { auth, db } from "./firebaseConfig.js";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";


// ============================================
const PAGE_TITLE = localStorage["review_location"];
const data = {
    city: PAGE_TITLE,
}
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
        const response = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts|pageimages&titles=${encodeURIComponent(PAGE_TITLE)}&exintro=1&explaintext=1&piprop=original`
        );

        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];

        if (pageId === "-1") {
            throw new Error("Page not found");
        }

        const page = pages[pageId];

        const extract = page.extract;
        const firstParagraph = extract.split("\n").find((p) => p.trim()) || extract;

        title.textContent = page.title;
        paragraph.textContent = firstParagraph;
        link.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`;

        if (page.original?.source) {
            image.src = page.original.source;
            image.alt = page.title;
        } else {
            image.style.display = "none";
        }

        loading.classList.add("hidden");
        content.classList.remove("hidden");
        title.classList.remove("hidden");
    } catch (err) {
        loading.classList.add("hidden");
        error.classList.remove("hidden");
        error.querySelector("p").textContent = err.message;
    }
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadWikipediaPage);
} else {
    loadWikipediaPage();
}
const no_items = `<p class="text-lg leading-relaxed mb-4">There are no reviews for this place.</p>`
const review_container = document.getElementById("reviewText");

// Load reviews for the signed-in user
const loadReviews = async () => {
    console.log('trying to load reviews')
    if (!currentUser) return;

    try {
        // for reviews
        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("country", "==", PAGE_TITLE));
        const snap = await getDocs(q);
        // for user ids
        const userRef = collection(db, "users");
        const userSnap = await getDocs(userRef);

        if (snap.empty) {
            review_container.innerHTML = no_items
            return;
        }

        const items = await Promise.all(snap.docs.map(d => ({
            id: d.id,
            ...d.data(),
            type: "review",
        })));

        const uNames = await Promise.all(userSnap.docs.map(d => ({
            id: d.id,
            ...d.data(),
            type: "user",
        })));


        displayReviews(items, uNames);
    } catch (error) {
        console.error("Error loading saved items:", error);
        review_container.innerHTML = no_items;
    }

};

let currentUser = null;
const displayReviews = (items, uNames) => {
    if (!review_container) return;

    review_container.innerHTML = "";
    if (!items || items.length === 0) {
        console.log("no items");
        review_container.innerHTML = no_items;
        return;
    }

    console.log(items[0])
    let counter = 0
    while (counter < items.length) {
        let new_review = document.createElement("div")


        // get username
        let review_author = ''
        for (let key in uNames) {
            if (uNames[key]['id'] === items[counter]['userId']) {
                review_author = uNames[key]['name']
            }
        }
        // set html
        new_review.innerHTML = `
            <p class="text-lg leading-relaxed mt-4">${items[counter]['text']}</p>
            <p class="text-xl font-bold leading-relaxed mt-1"><span class="font-medium">Review by: </span> ${review_author}</p>
        `
        review_container.appendChild(new_review)
        console.log(items[counter]['text'])
        counter += 1
    }
};

onAuthReady((user) => {
    currentUser = user;
    if (user) {
        loadReviews();
    } else {
        // If you want guest users to be redirected:
        window.location.href = "loginSignup.html";
    }
});
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadReviews();
        console.log('called load saved')
    }
});
