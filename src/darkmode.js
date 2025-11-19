// check for saved 'darkMode' in localStorage
let darkMode = localStorage.getItem('darkMode');

const e4 = document.getElementById("🧲")
document.body.style.backgroundColor = "#f5f5f0";
const enableDarkMode = () => {
    // 1. Add the class to the body
    document.body.classList.add('darkmode');
    document.body.style.backgroundColor = "black";
    e4.innerHTML = "Light Mode Toggle"
    // 2. Update darkMode in localStorage
    localStorage.setItem('darkMode', 'enabled');
}

const disableDarkMode = () => {
    // 1. Remove the class from the body
    document.body.classList.remove('darkmode');
    document.body.style.backgroundColor = "#f5f5f0";
    // 2. Update darkMode in localStorage 
    e4.innerHTML = "Dark Mode Toggle"
    localStorage.setItem('darkMode', null);
}

// If the user already visited and enabled darkMode
// start things off with it on
if (darkMode === 'enabled') {
    enableDarkMode();
}

// When someone clicks the button
e4.addEventListener('click', (e) => {
    // get their darkMode setting
    e.stopPropagation();
    darkMode = localStorage.getItem('darkMode');

    // if it not current enabled, enable it
    if (darkMode !== 'enabled') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
});