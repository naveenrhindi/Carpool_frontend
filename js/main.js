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



document.addEventListener('DOMContentLoaded', function() {
    function updateNavigation() {
        const authButtons = document.querySelector('.auth-buttons');
        const userMenu = document.querySelector('.user-menu');
        
        if (AuthService.isAuthenticated()) {
            const user = AuthService.getUser();
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'block';
                const userNameElement = userMenu.querySelector('.user-name');
                if (userNameElement && user) {
                    userNameElement.textContent = user.name;
                }
            }
            // Show welcome back message
            Swal.fire({
                title: `Welcome back, ${user.name}!`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } else {
            if (authButtons) authButtons.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    // Call when page loads
    updateNavigation();

    // Handle logout
    const logoutButton = document.querySelector('[onclick="AuthService.logout()"]');
    if (logoutButton) {
        logoutButton.onclick = function(e) {
            e.preventDefault();
            AuthService.logout();
            Swal.fire({
                title: 'Logged out successfully!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            window.location.href = '/index.html';
        };
    }
});

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