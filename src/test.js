// check for saved 'darkMode' in localStorage
let mode = localStorage.getItem('mode');

const test = document.getElementById("realone")
const div1 = document.getElementById("testing");
const div2 = document.getElementById("something");
const test2 = document.getElementById("test4");

const enable = () => {

    test2.classList.add('phase');

    localStorage.setItem('mode', 'toggled');
}

const disable = () => {

    test2.classList.remove("phase")
    localStorage.setItem('mode', null);
}


if (mode === 'toggled') {
    enable();
}

// When someone clicks the button
test.addEventListener('click', () => {
    mode = localStorage.getItem('mode');

    // if it not current enabled, enable it
    if (mode !== 'toggled') {
        enable();
    } else {
        disable();
    }
});