// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap';

//--------------------------------------------------------------
// If you have custom global styles, import them as well:
//--------------------------------------------------------------
import '/src/styles/style.css';
import {
  onAuthReady
} from "/src/authentication.js"
import { db } from "./firebaseConfig.js";
console.log(db)
import { getDoc, doc, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// This is an example function. Replace it with your own logic.
function showDashboard() {

  const submenu = document.getElementById('submenu');
  onAuthReady(async (user) => {
    if (!user) {
      // If no user is signed in → redirect back to login page.
      // location.href = "index.html";
      console.log("No user logged in");
      return;
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));
    const name = userDoc.exists()
      ? userDoc.data().name
      : user.displayName || user.email;

    // Update the welcome message with their name/email.
    if (submenu) {
      submenu.textContent = `Username: ${name}!`;
      console.log(`Welcome, ${name}!`);
    }
  });
}

showDashboard();