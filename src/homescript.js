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

const HEART_PRIMARY = "#000000";
const HEART_ACTIVE_STROKE = "#FF2D55";
const HEART_ACTIVE_FILL = "#FF2D55";
const HEART_ICON_PATH = "/images/heart-svgrepo-com.svg";

let heartIconMarkup = null;
let heartIconPromise = null;

function ensureHeartIcon() {
  if (heartIconMarkup) {
    return Promise.resolve(heartIconMarkup);
  }
  if (!heartIconPromise) {
    heartIconPromise = fetch(HEART_ICON_PATH)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load heart icon: ${response.status}`);
        }
        return response.text();
      })
      .then((markup) => {
        heartIconMarkup = markup;
        return markup;
      })
      .catch((error) => {
        console.error(error);
        heartIconMarkup =
          '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M12 21l-8-8a5.5 5.5 0 0 1 7.778-7.778L12 5.444l.222-.222A5.5 5.5 0 0 1 20 13l-8 8z" stroke="#ccc" fill="none"/></svg>';
        return heartIconMarkup;
      });
  }
  return heartIconPromise;
}

function createHeartButton(label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className =
    "absolute top-3 right-3 rounded-full shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00AF87]";
  button.setAttribute("aria-label", label);
  button.setAttribute("aria-pressed", "false");
  button.style.backgroundColor = "rgba(255,255,255,0.92)";
  button.style.padding = "6px";
  button.style.border = "1px solid transparent";
  button.style.cursor = "pointer";
  button.style.transition = "background-color 150ms ease, transform 150ms ease";

  let pathElement = null;

  ensureHeartIcon().then((markup) => {
    button.innerHTML = markup;
    const svgElement = button.querySelector("svg");
    if (svgElement) {
      svgElement.setAttribute("role", "img");
      svgElement.setAttribute("aria-hidden", "true");
      svgElement.setAttribute("width", "24");
      svgElement.setAttribute("height", "24");
    }
    pathElement = button.querySelector("path");
    if (pathElement) {
      pathElement.setAttribute("fill", "none");
      pathElement.setAttribute("stroke", HEART_PRIMARY);
      pathElement.setAttribute("stroke-width", "1.8");
      pathElement.setAttribute("stroke-linecap", "round");
      pathElement.setAttribute("stroke-linejoin", "round");
    }
  });

  button.addEventListener("mouseenter", () => {
    button.style.transform = "scale(1.05)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "scale(1)";
  });

  button.addEventListener("click", () => {
    const isSaved = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", String(!isSaved));
    ensureHeartIcon().then(() => {
      if (!pathElement) {
        pathElement = button.querySelector("path");
      }
      if (!isSaved) {
        pathElement?.setAttribute("fill", HEART_ACTIVE_FILL);
        pathElement?.setAttribute("stroke", HEART_ACTIVE_STROKE);
        button.style.backgroundColor = "rgba(255,0,0,0.12)";
        button.style.borderColor = "transparent";
      } else {
        pathElement?.setAttribute("fill", "none");
        pathElement?.setAttribute("stroke", HEART_PRIMARY);
        button.style.backgroundColor = "rgba(255,255,255,0.92)";
        button.style.borderColor = "transparent";
      }
    });
  });

  return button;
}

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
    "relative bg-neutral-300 rounded-2xl font-medium w-44 h-36 py-4 px-5 content-end shrink-0 overflow-hidden";

  const heartLabel =
    type === "restaurants" ? "Save this restaurant" : "Save this place";
  div.appendChild(createHeartButton(heartLabel));

  const content = document.createElement("div");
  content.className = "flex h-full flex-col justify-end gap-1";

  if (type === "places" || type === "popular") {
    const place = getRandomItem(countries);
    content.innerHTML = `<h1>${place.country}</h1><h1>${place.city}</h1>`;
  } else if (type === "restaurants") {
    const name = getRandomItem(restaurants);
    const rating = getRandomItem(ratings);
    content.innerHTML = `<p>${name}</p><p class="text-yellow-600">${generateStars(
      rating
    )}</p>`;
  }

  div.appendChild(content);

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
