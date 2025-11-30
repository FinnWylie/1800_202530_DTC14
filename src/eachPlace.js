import {auth, db} from "./firebaseConfig.js";
import {doc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs, getDoc} from "firebase/firestore";
import {onAuthStateChanged} from "firebase/auth";
import {onAuthReady} from "./authentication";

// ============================================
const PAGE_TITLE = localStorage["location_name"];  // Replace with any Wikipedia page title
const data = {
    city: PAGE_TITLE,
    }
let saved = false
// ============================================
async function loadWikipediaPage() {
    console.log('loading wiki page')
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const content = document.getElementById('content');
    const title = document.getElementById('title');
    const image = document.getElementById('image');
    const paragraph = document.getElementById('paragraph');

    const link = document.getElementById('link');
    try {
        // Fetch page content from Wikipedia API
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

        // Get first paragraph (first non-empty text block)
        const extract = page.extract;
        const firstParagraph = extract.split("\n").find(p => p.trim()) || extract;

        // Populate the page
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
// -----------------------------------------
// Add page to user history
// -----------------------------------------
async function addHistoryPlace(userId, placeName) {

    const userRef = doc(db, "users", userId);
    // remove any instances of the place that are older

    try {
        await updateDoc(userRef, {
            history: arrayRemove(placeName)
        });
        console.log(`${placeName} removed`);
    } catch (error) {
        console.log("error removing place:", error)
    }
    // add the new place instance
    try {
        await updateDoc(userRef, {
            history: arrayUnion(placeName)
        });
        console.log("History place saved!");
    } catch (error) {
        console.error("Error adding place:", error);
    }

}
// Load the Wikipedia page
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadWikipediaPage);
} else {
    loadWikipediaPage();

}
// --------------------------------------
// ------ add reviews to the page -------
// --------------------------------------
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


// // ------------------------
// // -- favourite the page --
// // ------------------------
const checkIfSaved = async (userId) => {
    const userRef = doc(db, "users", userId);

    let heartBtn = document.getElementById('heartBtn')
    heartBtn.addEventListener("click", toggleSaved)

    try {
        const docSnap = await getDoc(userRef);
        if(await docSnap.exists()) {
            let saved_countries = docSnap.data()['savedCountries']
            for (let key in saved_countries) {
                if (saved_countries[key]['city'] === PAGE_TITLE) {
                    console.log("page has been found in db and saved is set to true")
                    saved = true
                    updateHeartState()
                }
            }
        } else {
            console.log("Document does not exist")
        }
    } catch(error) {
        console.log(error)
    }
}

const updateHeartState = () => {
    let heartBtn = document.getElementById('heartBtn')
    heartBtn.setAttribute("aria-pressed", saved);
    if (saved) {
        heartBtn.setAttribute("fill", "#FF2D55");
    } else {
        heartBtn.setAttribute("fill", "none");
    }
    console.log(`in ${saved} state after updating heart`)
};


const toggleSaved = () => {
    console.log(saved)
    console.log('place is in ^^^ state before toggle')
    if (saved) {
        console.log("Removing place")
        deleteItem(data).then(r => updateHeartState())
    } else if (!saved) {
        console.log("Saving place")
        saveItem(data).then(r => updateHeartState())
    }
    // if not saved saveItem(data)
};

// Save item to user document array
const saveItem = async (data) => {
    if (!currentUser) {
        alert("Please log in to save items");
        return false;
    }
    try {

        const fieldName = 'savedCountries';

        const itemToSave = {
            city: PAGE_TITLE,
        };

        await updateDoc(doc(db, "users", currentUser.uid), {
            [fieldName]: arrayUnion(itemToSave),
        });
        saved = true;
    } catch (error) {
        console.error("Error saving item:", error);
        alert("Failed to save item");
        return false;
    }

};

// Delete item from user document array
const deleteItem = async (data) => {
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    const userData = await userDoc.data();

    saved = false;
    console.log(data)
    console.log(`data = ^^^`)
    console.log(data['cityName'])

    try {
        const fieldName = 'savedCountries';
        const savedArray = userData[fieldName] || [];

        console.log(savedArray)
        const itemToRemove = savedArray.find((item) => {
            console.log(`item.city = ${item.city}`)
            console.log(`data.city = ${data.city}`)
            return item.city === data.city;
        });
        console.log(`itemToRemove = ${itemToRemove}`)
        if (!itemToRemove) return false;


        await updateDoc(doc(db, "users", currentUser.uid), {
            [fieldName]: arrayRemove(itemToRemove),
        });
    } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item");
        return false;
    }
};


// Initialize auth
onAuthReady((user) => {
    currentUser = user;
    if (user) {
        loadReviews();
    } else {
        // If you want guest users to be redirected:
        window.location.href = "loginSignup.html";
    }
});


// Save history when user is ready (FIXED)
onAuthStateChanged(auth, (user) => {
    if (user) {
        addHistoryPlace(user.uid, PAGE_TITLE);
        console.log('called add place')
        loadReviews();
        console.log('called load saved')
        checkIfSaved(user.uid);
        console.log('called check saved')
    }
});
