import '/src/styles/style.css';
import {
  onAuthReady
} from "/src/authentication.js"
import { db } from "./firebaseConfig.js";
import { getDoc, doc, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { logoutUser } from '/src/authentication.js';
import {
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from '/src/firebaseConfig.js';
function showDashboard() {

  const submenu = document.getElementById('submenu');
  const sub = document.getElementById('sub');
  const submenus = document.getElementById('submenus');
  onAuthReady(async (user) => {
    if (!user) {
      // If no user is signed in → redirect back to login page.
      // location.href = "index.html";
      console.log("No user logged in");
      submenu.textContent = `No user logged in`;
      return;
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));
    const name = userDoc.exists()
      ? userDoc.data().name
      : user.displayName || user.email

    // Update the welcome message with their name/email.
    if (user) {
      const signOutBtn = document.getElementById('so');
      signOutBtn?.addEventListener('click', logoutUser);
    }
    if (submenu) {
      submenu.textContent = `Username: ${name}!`;
      sub.textContent = "Email: " + user.email
      submenus.textContent = "Country: " + userDoc.data().country
      console.log(`Welcome, ${name}!`);
    }

  });
}



showDashboard();