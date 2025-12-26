// HAMBURGER 
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      hamburger.classList.toggle("open");
      hamburger.classList.toggle("active");
  });
});


// TOAST 
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;  // type can be 'success' or 'error'
    toast.innerText = message;
    container.appendChild(toast);
  
    // Remove the toast after the animation (total ~4.5s: 0.5s slide in + 3.5s delay + 0.5s fade out)
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 4500);
  }