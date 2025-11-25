import '/src/styles/style.css';
import {
    onAuthReady
} from "/src/authentication.js"
import { db } from "./firebaseConfig.js";

import { getDoc, doc } from "firebase/firestore";
import { logoutUser } from '/src/authentication.js';

let something = false // variable will be used later
function showDashboard() {

  const submenu = document.getElementById('submenu');
  const sub = document.getElementById('sub');
  const submenus = document.getElementById('submenus');
  const but = document.getElementById('contin');
  const signOutBtn = document.getElementById('so');
  onAuthReady(async (user) => {
    if (!user) {

      submenu.textContent = `No user logged in`;
      but.innerHTML = "Sign in / Sign up"
      something = true // variable will be used later
      signOutBtn?.addEventListener('click', () => {
        window.location.href = 'loginSignup.html';
      });

    }
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const name = userDoc.exists()
      ? userDoc.data().name
      : user.displayName || user.email

    // Update the welcome message with their name/email.
    if (user) {

      signOutBtn?.addEventListener('click', logoutUser);
      but.innerHTML = "Sign out"

    }
    if (submenu) {
      submenu.textContent = `Username: ${name}!`;
      sub.textContent = "Email: " + user.email
      submenus.textContent = "Country: " + userDoc.data().country
    }

  });
}


showDashboard();