// import { db } from "./firebaseConfig.js";
// import { doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ============================================
// CHANGE THIS TO USE A DIFFERENT PAGE
// ============================================
const PAGE_TITLE = 'Vancouver';  // Replace with any Wikipedia page title
// ============================================

async function loadWikipediaPage() {
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
            `https://en.wikipedia.org/w/api.php?` +
            `action=query&format=json&origin=*&prop=extracts|pageimages&` +
            `titles=${encodeURIComponent(PAGE_TITLE)}&` +
            `exintro=1&explaintext=1&piprop=original`
        );

        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];

        if (pageId === '-1') {
            throw new Error('Page not found');
        }

        const page = pages[pageId];

        // Get first paragraph (first non-empty text block)
        const extract = page.extract;
        const firstParagraph = extract.split('\n').find(p => p.trim().length > 0) || extract;

        // Populate the page
        title.textContent = page.title;
        paragraph.textContent = firstParagraph;
        link.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`;

        // Handle image
        if (page.original && page.original.source) {
            image.src = page.original.source;
            image.alt = page.title;
        } else {
            image.style.display = 'none';
        }

        // Show content
        loading.classList.add('hidden');
        content.classList.remove('hidden');
        title.classList.remove('hidden');

    } catch (err) {
        loading.classList.add('hidden');
        error.classList.remove('hidden');
        error.querySelector('p').textContent = err.message || 'An error occurred while loading the page.';
    }
}

// Load the page when DOM is ready
// Load the page when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWikipediaPage);
} else {
    loadWikipediaPage();
}