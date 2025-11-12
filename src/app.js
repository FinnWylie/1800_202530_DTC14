// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap';

//--------------------------------------------------------------
// If you have custom global styles, import them as well:
//--------------------------------------------------------------
import '/src/styles/style.css';
import {
  onAuthReady
} from "/src/authentication.js"
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

//--------------------------------------------------------------
// Custom global JS code (shared with all pages)can go here.
//--------------------------------------------------------------

// This is an example function. Replace it with your own logic.
function sayHello() {
  // TODO: implement your logic here
}
function showDashboard() {


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
    if (e4) {
      e4.innerHTML = `${name}!`;
      console.log("Dashboard shown")
    }
  });
}

showDashboard();