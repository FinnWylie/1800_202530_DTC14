// Mock data
const preDefinedSuggestions = [
    "Apple",
    "Banana",
    "Orange",
    "Grapes",
    "Strawberry",
    "Blueberry",
    "Raspberry",
    "Pineapple",
    "Mango",
    "Watermelon"
];

// Get elements
const searchInput = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');

// Add event listener to input
searchInput.addEventListener('input', function () {
    const query = searchInput.value.toLowerCase();
    suggestions.innerHTML = '';

    if (query) {
        const filteredResults = preDefinedSuggestions.filter(item =>
            item.toLowerCase().includes(query)
        );

        filteredResults.forEach(result => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('autocomplete-suggestion');
            // suggestionItem.classList.add('p-2.5');
            // suggestionItem.classList.add('cursor-pointer');
            // suggestionItem.classList.add('hover:bg-gray-100');
            suggestionItem.textContent = result;
            suggestionItem.addEventListener('click', () => {
                searchInput.value = result;
                suggestions.innerHTML = '';
            });
            suggestions.appendChild(suggestionItem);
        });
    }
});

// Hide suggestions when clicking outside
document.addEventListener('click', function (event) {
    if (event.target !== searchInput) {
        suggestions.innerHTML = '';
    }
});