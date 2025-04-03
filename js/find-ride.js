document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS
    AOS.init({
        duration: 800,
        once: true
    });

    // Initialize Flatpickr
    const customDatePicker = flatpickr("#customDateTime", {
        enableTime: true,
        minDate: "today",
        dateFormat: "Y-m-d H:i",
    });

    // Time preset handler
    document.getElementById('timePreset').addEventListener('change', function(e) {
        const customDateTime = document.getElementById('customDateTime');
        if (e.target.value === 'custom') {
            customDateTime.style.display = 'block';
            customDatePicker.open();
        } else {
            customDateTime.style.display = 'none';
        }
    });

    // Common destinations handler
    document.querySelectorAll('.common-destinations button').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('destination').value = this.textContent.trim();
        });
    });

    // Location detection
    window.detectLocation = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const geocoder = new google.maps.Geocoder();
                    const latlng = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    geocoder.geocode({ location: latlng }, (results, status) => {
                        if (status === 'OK' && results[0]) {
                            document.getElementById('currentLocation').value = results[0].formatted_address;
                        }
                    });
                },
                error => {
                    alert('Error detecting location. Please enter manually.');
                }
            );
        }
    };

    // Form submission handler
    document.getElementById('findRideForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading state
        const searchBtn = document.querySelector('.search-btn');
        const originalText = searchBtn.innerHTML;
        searchBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Searching...';
        searchBtn.disabled = true;

        // Simulate search delay (replace with actual API call)
        setTimeout(() => {
            // Reset button state
            searchBtn.innerHTML = originalText;
            searchBtn.disabled = false;

            // Show results section
            document.getElementById('searchResults').style.display = 'block';
            
            // Scroll to results
            document.getElementById('searchResults').scrollIntoView({ behavior: 'smooth' });
        }, 1500);
    });
});

// Map functionality (similar to offer-ride.js but simplified)
let map, marker, activeInput;
const defaultLocation = { lat: 20.5937, lng: 78.9629 }; // India's center

function initMap() {
    // Initialize map
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 12
    });

    // Initialize marker
    marker = new google.maps.Marker({
        map: map,
        draggable: true
    });

    // Initialize autocomplete for location inputs
    const locationInputs = document.querySelectorAll('.location-input');
    locationInputs.forEach(input => {
        const autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                input.dataset.lat = place.geometry.location.lat();
                input.dataset.lng = place.geometry.location.lng();
            }
        });
    });
}

// Initialize map when page loads
window.initMap = initMap;