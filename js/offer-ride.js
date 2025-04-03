document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS
    AOS.init({
        duration: 800,
        once: true
    });

    // Initialize Flatpickr for date/time pickers
    flatpickr("#departureDateTime", {
        enableTime: true,
        minDate: "today",
        dateFormat: "Y-m-d H:i",
        onChange: function(selectedDates) {
            // Update arrival time minimum date when departure time changes
            const arrivalPicker = document.querySelector("#arrivalDateTime")._flatpickr;
            arrivalPicker.set("minDate", selectedDates[0]);
        }
    });

    flatpickr("#arrivalDateTime", {
        enableTime: true,
        minDate: "today",
        dateFormat: "Y-m-d H:i"
    });

    // Vehicle type change handler
    document.getElementById('vehicleType').addEventListener('change', function(e) {
        const seatsSelect = document.getElementById('seatsAvailable');
        seatsSelect.innerHTML = '';
        
        let maxSeats;
        switch(e.target.value) {
            case 'bike':
                maxSeats = 1;
                break;
            case 'car':
                maxSeats = 4;
                break;
            case 'van':
                maxSeats = 7;
                break;
            default:
                maxSeats = 0;
        }

        for(let i = 1; i <= maxSeats; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i} ${i === 1 ? 'seat' : 'seats'}`;
            seatsSelect.appendChild(option);
        }
    });

    // Vehicle number formatter
    document.getElementById('vehicleNumber').addEventListener('input', function(e) {
        let value = e.target.value.toUpperCase();
        value = value.replace(/[^A-Z0-9-]/g, '');
        
        if(value.length > 2 && value.charAt(2) !== '-') {
            value = value.slice(0, 2) + '-' + value.slice(2);
        }
        if(value.length > 5 && value.charAt(5) !== '-') {
            value = value.slice(0, 5) + '-' + value.slice(5);
        }
        if(value.length > 8 && value.charAt(8) !== '-') {
            value = value.slice(0, 8) + '-' + value.slice(8);
        }
        
        e.target.value = value;
    });

    // Form submission handler
    document.getElementById('offerRideForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Populate summary in modal
        document.getElementById('summaryVehicleType').textContent = document.getElementById('vehicleType').value;
        document.getElementById('summaryVehicleNumber').textContent = document.getElementById('vehicleNumber').value;
        document.getElementById('summarySeats').textContent = document.getElementById('seatsAvailable').value;
        document.getElementById('summaryFrom').textContent = document.getElementById('currentLocation').value;
        document.getElementById('summaryTo').textContent = document.getElementById('destination').value;
        document.getElementById('summaryDeparture').textContent = document.getElementById('departureDateTime').value;
        document.getElementById('summaryArrival').textContent = document.getElementById('arrivalDateTime').value;
    
        // Show confirmation modal
        new bootstrap.Modal(document.getElementById('confirmationModal')).show();
    });

    // Handle final confirmation
    document.getElementById('confirmRide').addEventListener('click', function() {
        // Add your API call or data submission logic here
        
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('confirmationModal')).hide();
        
        // Show success message
        alert('Ride offered successfully!');
    });

    // Initialize map
    mapboxgl.accessToken = 'your_mapbox_token';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-74.5, 40],
        zoom: 9
    });

    // Add map controls
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }));
});