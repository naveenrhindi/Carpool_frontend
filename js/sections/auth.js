// User Authentication
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
    updateUIForAuthState(false);
});