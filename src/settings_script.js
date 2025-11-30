import {arrayRemove, arrayUnion, doc, updateDoc} from "firebase/firestore";
import {auth, db} from "./firebaseConfig";
import {onAuthStateChanged} from "firebase/auth";


const notif = document.getElementById('userp');
const submenu = document.getElementById('submenu');
const submenus = document.getElementById('submenus');
const clm = document.getElementById('clm');
const padding = document.getElementById('padding');
const signo = document.getElementById('so');
const sup = document.getElementById('supp');
const svgicon = document.getElementById('svgi');
const spanu = document.getElementById('spanu');
const sub = document.getElementById('sub');
const delSearchHistory = document.getElementById('delSearchHistory');

// Random Seperator 
const e1 = document.getElementById("❌")
const e2 = document.getElementById("🅿️")
const e3 = document.getElementById("📧")
const e4 = document.getElementById("🧲")
const appear = document.getElementById("notif")
const spanid = document.getElementById('😎');
const padd = document.getElementById('padding1');
const svg = document.getElementById('svgi1');

//All Event Listeners

appear.addEventListener('click', () => {
    e1.style.display = "block";
    e2.style.display = "block";
    e3.style.display = "block";
    e4.style.display = "block"
    spanid.textContent = "Appearance Settings: "
    appear.classList.remove('nohover')
    // appear.style.backgroundColor = "white";
    padd.style.display = "block";
    svg.style.display = "none"
})

e1.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent notif's click from firing
    e1.style.display = "none";
    e2.style.display = "none";
    e3.style.display = "none";
    e4.style.display = "none"
    padd.style.display = "none";
    // appear.style.backgroundColor = "#e6d8c3";
    svg.style.display = "block"
    spanid.textContent = "Appearance "
});

notif.addEventListener('click', () => {
    submenu.style.display = "block";
    submenus.style.display = "block";
    clm.style.display = "block";
    sub.style.display = "block";
    delSearchHistory.style.display = "block";
    svgicon.style.display = "none";
    notif.classList.remove('nohover');
    // notif.style.backgroundColor = "white";
    padding.style.display = "block";
    spanu.textContent = "User Settings:  ";

});

clm.addEventListener('click', (e) => {
    e.stopPropagation();
    submenu.style.display = "none";
    submenus.style.display = "none";
    notif.classList.add('nohover');
    clm.style.display = "none";
    sub.style.display = "none";
    delSearchHistory.style.display = "none";
    svgicon.style.display = "block"
    padding.style.display = "none";
    // notif.style.backgroundColor = "#e6d8c3";;
});



onAuthStateChanged(auth, (user) => {
    if (user) {
        let user_var = user.uid
        delSearchHistory.addEventListener('click', (event) => deleteHistory(user_var))

        async function deleteHistory(user) {
            if (confirm("Are you sure you want to delete your place history?")) {
                const userRef = doc(db, "users", (user));
                try {
                    await updateDoc(userRef, {
                            history: [],
                        }
                    );
                    console.log(`history removed`);
                } catch (error) {
                    console.log("error removing history:", error)
                }
            }
        }
        console.log('user_var set')
    }
});



// current page indicator
function highlightCurrentPage() {
    console.log('highlighting page')
    let homeBtn = document.getElementById('homeSVG')
    let searchSVG = document.getElementById('searchSVG')
    let reviewSVG = document.getElementById('reviewSVG')
    let savedSVG = document.getElementById('savedSVG')
    let settingsSVG = document.getElementById('settingsSVG')
    homeBtn.setAttribute('stroke', '#3a4f41ff')
    searchSVG.setAttribute('stroke', '#3a4f41ff')
    reviewSVG.setAttribute('stroke', '#3a4f41ff')
    savedSVG.setAttribute('stroke', '#3a4f41ff')
    settingsSVG.setAttribute('stroke', '#61b07eff')
}
highlightCurrentPage()

