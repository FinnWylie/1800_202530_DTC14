import { auth, db } from "/src/firebaseConfig.js";
import { doc, getDoc, collection, getDocs, updateDoc, arrayUnion } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";


// -----------------------------------------
// Add page to user history
// -----------------------------------------
async function getHistoryPlaces(userId) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists) {
        const historyArray = userSnap.data().history;
        // console.log(historyArray);

        if (historyArray.length > 0) {
            const recentlyViewed = document.getElementById('recentlyViewed')
            recentlyViewed.innerHTML = `
                <h1>Recently Searched</h1>
                    <div id="history" class="flex flex-col border-2 border-[#5d866c] rounded-xl bg-[#F5F3f1] text-lg max-h-min ">
                        <history-place id="history-place"></history-place>
                    </div>
            `
        }

        // -----------------------------------------------------------------//
        // for each item in the history array, add it below the search bar. //
        // -----------------------------------------------------------------//
        const historyDiv = document.getElementById('history-place')
        for (let history_index = -1; history_index >= historyArray.length * -1; history_index --) { // or length of history array
            let historyArrayElement = historyArray.at(history_index);

            try {
                let eachPlace = document.createElement("div");
                if (historyArray.length === 1) {
                    eachPlace.innerHTML = `
                    <div class="historyPlace rounded-xl flex flex-row autocomplete-suggestion p-2.5 cursor-pointer hover:bg-[#e6d8c3] duration-100
                     text-[#254430] bg-[#F5F3F1] text-xl max-h-min h-[52px] font-semibold">
                        <p class="historyPlaceName my-auto pl-2 text-xl">${historyArrayElement}</p>
                    </div>`
                } else if (history_index === -1) {
                    eachPlace.innerHTML = `
                    <div class="historyPlace rounded-t-xl flex flex-row autocomplete-suggestion p-2.5 cursor-pointer hover:bg-[#e6d8c3] border-b border-gray-400 duration-100
                     text-[#254430] bg-[#F5F3F1] text-xl max-h-min h-[52px] font-semibold">
                        <p class="historyPlaceName my-auto pl-2 text-xl">${historyArrayElement}</p>
                    </div>`
                } else if (history_index === historyArray.length * -1) {
                    eachPlace.innerHTML = `
                    <div class="historyPlace rounded-b-xl flex flex-row autocomplete-suggestion p-2.5 cursor-pointer hover:bg-[#e6d8c3] duration-100
                     text-[#254430] bg-[#F5F3F1] text-xl max-h-min h-[52px] font-semibold">
                        <p class="historyPlaceName my-auto pl-2 text-xl">${historyArrayElement}</p>
                    </div>`
                } else {
                    eachPlace.innerHTML = `
                    <div class="historyPlace flex flex-row autocomplete-suggestion p-2.5 cursor-pointer hover:bg-[#e6d8c3] border-b border-gray-400 duration-100
                     text-[#254430] bg-[#F5F3F1] text-xl max-h-min h-[52px] font-semibold">
                        <p class="historyPlaceName my-auto pl-2 text-xl">${historyArrayElement}</p>
                    </div>`
                }
                eachPlace.addEventListener('click', () => {
                    localStorage["location_name"] = historyArrayElement
                    location.href = `../eachPlace.html`
                })
                historyDiv.appendChild(eachPlace)
                console.log("place added")


            }
            catch (error) {
                console.log(error)
            }
        }

    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");

    }

}

// Save history when user is ready (FIXED)
onAuthStateChanged(auth, (user) => {
    if (user) {
        getHistoryPlaces(user.uid);
    }
});

