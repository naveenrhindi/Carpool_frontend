document.addEventListener('DOMContentLoaded', function() {
    function updateNavigation() {
        const authButtons = document.querySelector('.auth-buttons');
        const userMenu = document.querySelector('.user-menu');
        
        if (window.AuthService.isAuthenticated()) {
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'block';
                const user = window.AuthService.getUser();
                if (user) {
                    const userNameElement = userMenu.querySelector('.user-name');
                    if (userNameElement) {
                        userNameElement.textContent = user.name;
                    }
                }
            }
        } else {
            if (authButtons) authButtons.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    // Call updateNavigation when page loads
    updateNavigation();

    // Password visibility toggle
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        const passwordInput = togglePassword.parentElement.querySelector('input[type="password"]');
        if (passwordInput) {
            togglePassword.addEventListener('click', function() {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.querySelector('i').classList.toggle('bi-eye');
                this.querySelector('i').classList.toggle('bi-eye-slash');
            });
        }
    }

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const passwordInput = this.querySelector('input[type="password"]');

            if (!emailInput || !passwordInput) {
                showAlert('Form inputs not found', 'danger');
                return;
            }
            try {
                await AuthService.login(emailInput.value, passwordInput.value);
                Swal.fire({
                    title: 'Login successful!',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
                updateNavigation();
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1500);
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: error.message,
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            }
        });
    }

    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const userData = {
                name: this.querySelector('input[type="text"]').value,
                email: this.querySelector('input[type="email"]').value,
                password: this.querySelector('input[type="password"]').value,
                role: this.querySelector('select[name="role"]').value,
                gender: this.querySelector('select[name="gender"]').value
            };

            try {
                await AuthService.register(userData);
                showAlert('Registration successful! Please login.', 'success');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1500);
            } catch (error) {
                showAlert(error.message, 'danger');
            }
        });
    }

    // Alert function
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    // // Form validation
    // const form = document.getElementById('loginForm');
    // form.addEventListener('submit', function(event) {
    //     event.preventDefault();
    //     if (!form.checkValidity()) {
    //         event.stopPropagation();
    //     } else {
    //         // Add your login logic here
    //         console.log('Form submitted');
    //     }
    //     form.classList.add('was-validated');
    // });
});
