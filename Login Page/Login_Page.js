// Select elements
const container = document.querySelector(".container");
const registerBtn = document.querySelector(".resister-btn"); // register button
const loginBtn = document.querySelector(".login-btn");       // login button

// Function to check if it's mobile view
function isMobile() {
    return window.innerWidth <= 768; // breakpoint for mobile
}
 
// Register button
registerBtn.addEventListener("click", () => {
    if (isMobile()) {
         document.querySelector(".form-box.login").style.display = "none";
        document.querySelector(".form-box.register").style.display = "block"; // fixed typo
    } else {
        container.classList.add("active");
    }
});

// Login button
loginBtn.addEventListener("click", () => {
    if (isMobile()) {
        document.querySelector(".form-box.register").style.display = "none"; // fixed typo
        document.querySelector(".form-box.login").style.display = "block";
    } else {
        container.classList.remove("active");
    }
});

// Run once on load + resize
function adjustView() {
    if (isMobile()) {
        // Default show login
        document.querySelector(".form-box.login").style.display = "block";
        document.querySelector(".form-box.register").style.display = "none";
        container.classList.remove("active");
    } else {
        // Reset desktop view
        document.querySelector(".form-box.login").style.display = "";
        document.querySelector(".form-box.register").style.display = "";
    }
}
window.addEventListener("resize", adjustView);
window.addEventListener("load", adjustView);

