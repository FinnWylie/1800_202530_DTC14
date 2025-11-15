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

function showDashboard() {

  const submenu = document.getElementById('submenu');
  const sub = document.getElementById('sub');
  const submenus = document.getElementById('submenus');

  onAuthReady(async (user) => {
    if (!user) {

      setTimeout(function () {
        alert("no user logged in, redirecting to home page");
        location.href = "index.html";
      }, 1500)
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
    }

  });
}



showDashboard();