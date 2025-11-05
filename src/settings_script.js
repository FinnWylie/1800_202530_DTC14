const notif = document.getElementById('notif');
const submenu = document.getElementById('submenu');
const submenus = document.getElementById('submenus');
const clm = document.getElementById('clm');
const padding = document.getElementById('padding');
const signo = document.getElementById('so');

// import {
//     onAuthStateChanged,
// } from "firebase/auth";

// import { auth } from '/src/firebaseConfig.js';
// import { logoutUser } from '/src/authentication.js';
//submenu for notification container

notif.addEventListener('click', () => {

    submenu.style.display = "block";
    submenus.style.display = "block";
    clm.style.display = "block";
    notif.classList.remove('nohover');
    notif.style.backgroundColor = "white";
    padding.style.display = "block";
    notif.firstChild.textContent = "Notification Settings:  ";

});

clm.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent notif's click from firing
    submenu.style.display = "none";
    submenus.style.display = "none";
    notif.classList.add('nohover');
    clm.style.display = "none";
    padding.style.display = "none";
    notif.firstChild.textContent = "Notifications";
    notif.style.backgroundColor = "#e6d8c3";
    console.log("Closed");
});
// signo?.addEventListener('click', logoutUser);
