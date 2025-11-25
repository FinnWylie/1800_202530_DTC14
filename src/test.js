
// let mode = localStorage.getItem('mode');
// let testing = false
// const test = document.getElementById("realone")
// const div1 = document.getElementById("realtwo");
// const div2 = document.getElementById("real3");
// const test2 = document.getElementById("test4");
// const test3 = document.getElementById("test3");

// const enable = () => {

//     if (testing) {
//         test2.classList.add('phase');
//         console.log("added")
//     }
//     else {
//         test3.classList.add('phase');
//     }
//     localStorage.setItem('mode', 'toggled');
// }

// const disable = () => {

//     if (!testing) {
//         test2.classList.remove('phase');
//         console.log("added")
//     }
//     else {
//         test3.classList.remove('phase');
//     }
//     localStorage.setItem('mode', null);

// }

// if (mode === 'toggled') {
//     enable();
// }

// // When someone clicks the button
// test2.addEventListener('click', () => {

//     testing = false;
//     mode = localStorage.getItem('mode');

//     // if it not current enabled, enable it
//     if (mode !== 'toggled') {
//         enable();
//     } else {
//         disable();
//     }
// });
// div1.addEventListener('click', () => {
//     testing = true;
//     mode = localStorage.getItem('mode');

//     // if it not current enabled, enable it
//     if (mode !== 'toggled') {
//         enable();
//     } else {
//         disable();
//     }
// });