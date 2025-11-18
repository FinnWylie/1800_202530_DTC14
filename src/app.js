import '/src/styles/style.css';
import {
  onAuthReady
} from "/src/authentication.js"
import { db } from "./firebaseConfig.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { logoutUser } from '/src/authentication.js';
// import {
//   onAuthStateChanged,
// } from "firebase/auth";

// import { auth } from '/src/firebaseConfig.js';
let something = false
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
      something = true
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