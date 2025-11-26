// Get elements
const searchInput = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');
import { db } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// Mock data
const preDefinedSuggestions = [
    "Toronto, Canada",
    "Montreal, Canada",
    "Vancouver, Canada",
    "Calgary, Canada",
    "Edmonton, Canada",
    "Ottawa, Canada",
    "Winnipeg, Canada",
    "Quebec_City, Canada",
    "Hamilton, Canada",
    "Kitchener, Canada",
    "London, Canada",
    "Victoria, Canada",
    "Halifax, Canada",
    "Oshawa, Canada",
    "Windsor, Canada",
    "Saskatoon, Canada",
    "Regina, Canada",
    "Sherbrooke, Canada",
    "Barrie, Canada",
    "Kelowna, Canada",
    "Abbotsford, Canada",
    "Kingston, Canada",
    "Trois-Rivières, Canada",
    "Guelph, Canada",
    "Cambridge, Canada",
    "Whitby, Canada",
    "Sudbury, Canada",
    "Thunder_Bay, Canada",
    "Peterborough, Canada",
    "Lethbridge, Canada",
    "Moncton, Canada",
    "Brantford, Canada",
    "Red_Deer, Canada",
    "Nanaimo, Canada",
    "Kamloops, Canada",
    "Fredericton, Canada",
    "Charlottetown, Canada",
    "Saint_John, Canada",
    "Medicine_Hat, Canada",
    "Grande_Prairie, Canada",
    "Sarnia, Canada",
    "Wood_Buffalo, Canada",
    "Chilliwack, Canada",
    "Drummondville, Canada",
    "Cornwall, Canada",
    "Chatham, Canada",
    "North_Bay, Canada",
    "Prince_George, Canada",
    "Sault_Ste._Marie, Canada",
    "Belleville, Canada",
    "New_York_City, United_States",
    "Los_Angeles, United_States",
    "Chicago, United_States",
    "Houston, United_States",
    "Phoenix, United_States",
    "Philadelphia, United_States",
    "San_Antonio, United_States",
    "San_Diego, United_States",
    "Dallas, United_States",
    "San_Jose, United_States",
    "Austin, United_States",
    "Jacksonville, United_States",
    "Fort_Worth, United_States",
    "Columbus, United_States",
    "Charlotte, United_States",
    "San_Francisco, United_States",
    "Indianapolis, United_States",
    "Seattle, United_States",
    "Denver, United_States",
    "Boston, United_States",
    "Nashville, United_States",
    "Detroit, United_States",
    "Portland, United_States",
    "Las_Vegas, United_States",
    "Miami, United_States",
    "Atlanta, United_States",
    "Minneapolis, United_States",
    "Tampa, United_States",
    "New_Orleans, United_States",
    "Cleveland, United_States",
    "Pittsburgh, United_States",
    "Cincinnati, United_States",
    "Kansas_City, United_States",
    "Salt_Lake_City, United_States",
    "Milwaukee, United_States",
    "Baltimore, United_States",
    "Raleigh, United_States",
    "Buffalo, United_States",
    "Richmond, United_States",
    "Sacramento, United_States",
    "London, United_Kingdom",
    "Birmingham, United_Kingdom",
    "Manchester, United_Kingdom",
    "Glasgow, United_Kingdom",
    "Liverpool, United_Kingdom",
    "Edinburgh, United_Kingdom",
    "Leeds, United_Kingdom",
    "Sheffield, United_Kingdom",
    "Bristol, United_Kingdom",
    "Newcastle, United_Kingdom",
    "Cardiff, United_Kingdom",
    "Belfast, United_Kingdom",
    "Nottingham, United_Kingdom",
    "Leicester, United_Kingdom",
    "Southampton, United_Kingdom",
    "Portsmouth, United_Kingdom",
    "York, United_Kingdom",
    "Oxford, United_Kingdom",
    "Cambridge, United_Kingdom",
    "Brighton, United_Kingdom",
    "Paris, France",
    "Marseille, France",
    "Lyon, France",
    "Toulouse, France",
    "Nice, France",
    "Nantes, France",
    "Strasbourg, France",
    "Montpellier, France",
    "Bordeaux, France",
    "Lille, France",
    "Rennes, France",
    "Reims, France",
    "Toulon, France",
    "Grenoble, France",
    "Dijon, France",
    "Berlin, Germany",
    "Munich, Germany",
    "Hamburg, Germany",
    "Cologne, Germany",
    "Frankfurt, Germany",
    "Stuttgart, Germany",
    "Düsseldorf, Germany",
    "Dortmund, Germany",
    "Essen, Germany",
    "Leipzig, Germany",
    "Bremen, Germany",
    "Dresden, Germany",
    "Hanover, Germany",
    "Nuremberg, Germany",
    "Bonn, Germany",
    "Rome, Italy",
    "Milan, Italy",
    "Naples, Italy",
    "Turin, Italy",
    "Palermo, Italy",
    "Genoa, Italy",
    "Bologna, Italy",
    "Florence, Italy",
    "Bari, Italy",
    "Catania, Italy",
    "Venice, Italy",
    "Verona, Italy",
    "Messina, Italy",
    "Padua, Italy",
    "Trieste, Italy",
    "Madrid, Spain",
    "Barcelona, Spain",
    "Valencia, Spain",
    "Seville, Spain",
    "Zaragoza, Spain",
    "Málaga, Spain",
    "Murcia, Spain",
    "Palma, Spain",
    "Bilbao, Spain",
    "Alicante, Spain",
    "Córdoba, Spain",
    "Valladolid, Spain",
    "Granada, Spain",
    "Salamanca, Spain",
    "Toledo, Spain",
    "Tokyo, Japan",
    "Yokohama, Japan",
    "Osaka, Japan",
    "Nagoya, Japan",
    "Sapporo, Japan",
    "Fukuoka, Japan",
    "Kobe, Japan",
    "Kyoto, Japan",
    "Kawasaki, Japan",
    "Saitama, Japan",
    "Hiroshima, Japan",
    "Sendai, Japan",
    "Chiba, Japan",
    "Kitakyushu, Japan",
    "Sakai, Japan",
    "Beijing, China",
    "Shanghai, China",
    "Guangzhou, China",
    "Shenzhen, China",
    "Chongqing, China",
    "Tianjin, China",
    "Wuhan, China",
    "Chengdu, China",
    "Nanjing, China",
    "Hangzhou, China",
    "Xiamen, China",
    "Suzhou, China",
    "Kunming, China",
    "Qingdao, China",
    "Dalian, China",
    "Sydney, Australia",
    "Melbourne, Australia",
    "Brisbane, Australia",
    "Perth, Australia",
    "Adelaide, Australia",
    "Canberra, Australia",
    "Hobart, Australia",
    "Darwin, Australia",
    "Townsville, Australia",
    "Cairns, Australia",
    "Wollongong, Australia",
    "Geelong, Australia",
    "Newcastle, Australia",
    "Ballarat, Australia",
    "Bendigo, Australia",
    "Mumbai, India",
    "Delhi, India",
    "Bangalore, India",
    "Hyderabad, India",
    "Chennai, India",
    "Kolkata, India",
    "Pune, India",
    "Ahmedabad, India",
    "Jaipur, India",
    "Lucknow, India",
    "Kanpur, India",
    "Nagpur, India",
    "Indore, India",
    "Bhopal, India",
    "Patna, India",
    "Mexico_City, Mexico",
    "Guadalajara, Mexico",
    "Monterrey, Mexico",
    "Puebla, Mexico",
    "Tijuana, Mexico",
    "León, Mexico",
    "Cancún, Mexico",
    "Mérida, Mexico",
    "Querétaro, Mexico",
    "Acapulco, Mexico",
    "São_Paulo, Brazil",
    "Rio_De_Janeiro, Brazil",
    "Brasília, Brazil",
    "Salvador, Brazil",
    "Fortaleza, Brazil",
    "Belo_Horizonte, Brazil",
    "Manaus, Brazil",
    "Curitiba, Brazil",
    "Recife, Brazil",
    "Porto_Alegre, Brazil",
    "Amsterdam, Netherlands",
    "Rotterdam, Netherlands",
    "The_Hague, Netherlands",
    "Utrecht, Netherlands",
    "Eindhoven, Netherlands",
    "Groningen, Netherlands",
    "Brussels, Belgium",
    "Antwerp, Belgium",
    "Ghent, Belgium",
    "Bruges, Belgium",
    "Liège, Belgium",
    "Zürich, Switzerland",
    "Geneva, Switzerland",
    "Basel, Switzerland",
    "Bern, Switzerland",
    "Lausanne, Switzerland",
    "Vienna, Austria",
    "Salzburg, Austria",
    "Innsbruck, Austria",
    "Graz, Austria",
    "Warsaw, Poland",
    "Kraków, Poland",
    "Gdańsk, Poland",
    "Wrocław, Poland",
    "Poznań, Poland",
    "Stockholm, Sweden",
    "Gothenburg, Sweden",
    "Malmö, Sweden",
    "Uppsala, Sweden",
    "Oslo, Norway",
    "Bergen, Norway",
    "Trondheim, Norway",
    "Copenhagen, Denmark",
    "Aarhus, Denmark",
    "Helsinki, Finland",
    "Tampere, Finland",
    "Turku, Finland",
    "Moscow, Russia",
    "Saint_Petersburg, Russia",
    "Novosibirsk, Russia",
    "Yekaterinburg, Russia",
    "Kazan, Russia",
    "Istanbul, Turkey",
    "Ankara, Turkey",
    "Izmir, Turkey",
    "Antalya, Turkey",
    "Seoul, South_Korea",
    "Busan, South_Korea",
    "Incheon, South_Korea",
    "Daegu, South_Korea",
    "Singapore, Singapore",
    "Bangkok, Thailand",
    "Chiang_Mai, Thailand",
    "Kuala_Lumpur, Malaysia",
    "Jakarta, Indonesia",
    "Manila, Philippines",
    "Hanoi, Vietnam",
    "Ho_Chi_Minh_City, Vietnam",
    "Buenos_Aires, Argentina",
    "Córdoba, Argentina",
    "Rosario, Argentina",
    "Santiago, Chile",
    "Bogotá, Colombia",
    "Lima, Peru",
    "Cape_Town, South_Africa",
    "Johannesburg, South_Africa",
    "Durban, South_Africa",
    "Cairo, Egypt",
    "Casablanca, Morocco",
    "Nairobi, Kenya",
    "Auckland, New_Zealand",
    "Wellington, New_Zealand",
    "Christchurch, New_Zealand",
    "Dublin, Ireland",
    "Cork, Ireland",
    "Lisbon, Portugal",
    "Porto, Portugal",
    "Athens, Greece",
    "Thessaloniki, Greece",
    "Prague, Czech_Republic",
    "Budapest, Hungary",
    "Bucharest, Romania",
    "Tegucigalpa, Honduras",
    "Funafuti, Tuvalu",
    "Malé, Maldives"

];

// const btn = document.getElementById('donebtn');

// btn.addEventListener('click', () => {
//     const inp = document.getElementById('inp').value
//     if (inp == "") {
//         console.log("BAD!")

//     }
//     else {

//         console.log(inp.value)
//         localStorage.setItem("review", inp)
//         window.location.replace('review_index.html')
//     }
// })

// Add event listener to input
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    suggestions.innerHTML = '';

    if (query) {  // check for search in valid places
        const filteredResults = preDefinedSuggestions.filter(item =>
            item.toLowerCase().includes(query)
        );


        filteredResults.sort()  // make it alphabetical order

        filteredResults.forEach(result => {  // add to html
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('autocomplete-suggestion');
            suggestionItem.classList.add('p-2.5');
            suggestionItem.classList.add('cursor-pointer');
            suggestionItem.classList.add('hover:bg-[#e6d8c3]');
            suggestionItem.classList.add('border-t');
            suggestionItem.classList.add('border-gray-400');
            suggestionItem.classList.add('duration-100');
            suggestionItem.textContent = result;
            suggestionItem.addEventListener('click', () => {
                let reviewLocation = result.slice(0, result.indexOf(","))  // ensure only the city name is passed
                console.log(reviewLocation)



                // add the place to the review selection
                const chosenDiv = document.getElementById('chosen-place')
                chosenDiv.innerHTML = `
                    <h1>Location review is for</h1>
                    <div class="flex flex-col border-2 border-[#5d866c] rounded-xl bg-[#F5F3f1] text-lg max-h-min ">
                        <div id="chosen-place-inner" class="flex flex-row justify-between">
                            <div class="chosenPlace flex flex-row autocomplete-suggestion p-2.5 rounded-xl text-[#254430] bg-[#F5F3F1] text-xl max-h-min h-[52px] font-semibold">
                                <p class="chosenPlaceName my-auto pl-2 text-xl">${reviewLocation}</p>
                            </div>
                            <svg class="pr-2" id='closeBtn'
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="48"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#000000"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <path d="M18 6l-12 12" />
                              <path d="M6 6l12 12" />
                            </svg>

                        </div>
                    </div>`
                localStorage["review_location"] = reviewLocation  // add the location to the browser's memory to use with firestore later

                // add event listener to x button
                // will remove the location from the div and memory
                document.getElementById('closeBtn').addEventListener('click', () => {
                    document.getElementById('chosen-place').innerHTML = ''
                    localStorage["review_location"] = ''
                })

            });
            suggestions.appendChild(suggestionItem);
        });
        document.getElementById("suggestions").lastElementChild.classList.add('rounded-b-lg');  // ensure the last one is rounded like the container
    }
});





// Hide suggestions when clicking outside
document.addEventListener('click', function (event) {
    if (event.target !== searchInput) {
        suggestions.innerHTML = '';
    }
});
const doneBtn = document.getElementById("donebtn");
const inp = document.getElementById("inp");
const chosenPlace = document.getElementById("chosen-place");

// UI: simple feedback message
function showMessage(msg, isError = false) {
    let el = document.getElementById("add-review-msg");
    if (!el) {
        el = document.createElement("div");
        el.id = "add-review-msg";
        el.style.marginTop = "1rem";
        document.querySelector("#searchBar").appendChild(el);
    }
    el.textContent = msg;
    el.style.color = isError ? "crimson" : "green";
}

let currentUser = null;

// Wait for auth to be ready (you already used this pattern elsewhere)
onAuthReady((user) => {
    currentUser = user;
    if (!user) {
        showMessage("You must be signed in to add a review.", true);
        doneBtn.disabled = true;
        return;
    }
    doneBtn.disabled = false;
});

// Basic validation + submit handler
doneBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!currentUser) {
        showMessage("Not signed in.", true);
        return;
    }

    const text = (inp?.value || "").trim();
    const place = (searchInput?.value || "").trim();

    if (!text) {
        showMessage("Please write a review before submitting.", true);
        return;
    }
    else if (!place) {
        showMessage("Please select a city", true)
        return
    }

    // If you don't have images yet, keep imageUrl empty string
    const imageUrl = ""; // default; replace later if you add upload

    const payload = {
        text,
        imageUrl,
        userId: currentUser.uid,
        place: place || null,
        createdAt: serverTimestamp(),
    };

    try {
        const reviewsRef = collection(db, "reviews");
        const docRef = await addDoc(reviewsRef, payload);

        showMessage("Your review has been saved succesfully ✅");
        setTimeout(function () { window.location.replace("review_index.html") }, 500)
        inp.value = "";
        searchInput.value = "";
        // If you want to redirect back to reviews page:
        // window.location.href = "/path/to/reviews.html";
        console.log("Review created with ID:", docRef.id);
    } catch (err) {
        console.error("Error saving review:", err);
        showMessage("Error saving review. See console.", true);
    }
});