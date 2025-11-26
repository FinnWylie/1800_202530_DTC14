// // check for saved 'darkMode' in localStorage
// let darkMode = localStorage.getItem('darkMode');

// const e4 = document.getElementById("🧲")
// document.body.style.backgroundColor = "#f5f5f0";

// const enableDarkMode = () => {
//     document.body.classList.add('darkmode');
//     document.body.style.backgroundColor = "black";
//     e4.innerHTML = "Light Mode Toggle"
//     localStorage.setItem('darkMode', 'enabled');
// }

// const disableDarkMode = () => {
//     document.body.classList.remove('darkmode');
//     document.body.style.backgroundColor = "#f5f5f0";
//     e4.innerHTML = "Dark Mode Toggle"
//     localStorage.setItem('darkMode', null);
// }

// if (darkMode === 'enabled') {
//     enableDarkMode();
// }

// e4.addEventListener('click', (e) => {
//     e.stopPropagation();
//     darkMode = localStorage.getItem('darkMode');

//     if (darkMode !== 'enabled') {
//         enableDarkMode();
//     } else {
//         disableDarkMode();
//     }
// });