// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const icon = themeToggle.querySelector('i');

themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.setAttribute('data-bs-theme', newTheme);
    icon.className = newTheme === 'light' ? 'bi bi-moon-stars' : 'bi bi-sun';
});

// Form Validation
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    // Add your login logic here
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    
    // Example validation
    if (!email.endsWith('.edu')) {
        showAlert('Please use a valid campus email address', 'danger');
        return;
    }
    
    // Proceed with login
    console.log('Login attempt:', { email });
});

// Alert System
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.insertBefore(alertDiv, document.body.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// User Authentication State Management
function updateUIForAuthState(isLoggedIn) {
    const guestView = document.querySelector('.guest-view');
    const userView = document.querySelector('.user-view');
    
    if (isLoggedIn) {
        guestView.classList.add('d-none');
        userView.classList.remove('d-none');
    } else {
        guestView.classList.remove('d-none');
        userView.classList.add('d-none');
    }
}

// Logout Handler
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    // Add your logout logic here
    updateUIForAuthState(false);
});

// Example: Check auth state on page load
// Replace this with your actual auth check
const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
updateUIForAuthState(isLoggedIn);

// Import section scripts
import './sections/theme.js';
import './sections/auth.js';

// Initialize AOS
AOS.init({
    duration: 800,
    once: true
});

// Initialize testimonial carousel with custom interval
const testimonialCarousel = new bootstrap.Carousel(document.getElementById('testimonialCarousel'), {
    interval: 5000, // Change slides every 5 seconds
    touch: true    // Enable touch swiping on mobile
});