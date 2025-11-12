const countries = [
  { country: "Italy", city: "Rome" },
  { country: "France", city: "Paris" },
  { country: "USA", city: "New York" },
  { country: "Japan", city: "Tokyo" },
  { country: "Canada", city: "Toronto" },
  { country: "Brazil", city: "Rio" },
  { country: "Australia", city: "Sydney" },
  { country: "Spain", city: "Barcelona" },
];

const restaurants = [
  "Olive Garden",
  "La Piazza",
  "Nobu",
  "Sushi Go",
  "Le Gourmet",
  "BBQ Nation",
  "Taco Fiesta",
  "Burger Boss",
];

const ratings = [3, 4, 5];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const half = rating % 1 !== 0;
  return "★".repeat(fullStars) + (half ? "½" : "");
}

function createCard(type) {
  const div = document.createElement("div");
  div.className =
    "bg-neutral-300 rounded-2xl font-medium w-44 h-36 py-4 px-5 content-end shrink-0";

  if (type === "places" || type === "popular") {
    const place = getRandomItem(countries);
    div.innerHTML = `<h1>${place.country}</h1><h1>${place.city}</h1>`;
  } else if (type === "restaurants") {
    const name = getRandomItem(restaurants);
    const rating = getRandomItem(ratings);
    div.innerHTML = `<p>${name}</p><p class="text-yellow-600">${generateStars(
      rating
    )}</p>`;
  }

  return div;
}

const history = {
  places: [[]],
  restaurants: [[]],
  popular: [[]],
};

const indices = {
  places: 0,
  restaurants: 0,
  popular: 0,
};

function renderCards(containerId, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  const cards = history[type][indices[type]];
  cards.forEach((card) => container.appendChild(card));
}

function generateNewCards(type, count) {
  const cards = [];
  for (let i = 0; i < count; i++) {
    cards.push(createCard(type));
  }
  return cards;
}

function handleHorizontalScroll(containerId, type) {
  const container = document.getElementById(containerId);
  let throttled = false;

  container.addEventListener("scroll", () => {
    if (throttled) return;

    const scrollLeft = container.scrollLeft;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    if (scrollLeft <= 0 && indices[type] > 0) {
      indices[type]--;
      renderCards(containerId, type);
    }

    if (scrollLeft >= maxScrollLeft - 10) {
      indices[type]++;
      if (!history[type][indices[type]]) {
        history[type][indices[type]] = generateNewCards(type, 5);
      }
      renderCards(containerId, type);
    }

    throttled = true;
    setTimeout(() => (throttled = false), 300);
  });
}

["places", "restaurants", "popular"].forEach((type) => {
  history[type][0] = generateNewCards(type, 5);
  renderCards(`${type}-container`, type);
  handleHorizontalScroll(`${type}-container`, type);
});
