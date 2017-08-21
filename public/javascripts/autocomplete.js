// This file is working with delicios-app.js

function autocomplete(input, latInput, lngInput) {
    //If there is no input, skip this function
    if (!input) return;
    // this takes in the input (address)
    const dropdown = new google.maps.places.Autocomplete(input);

    // this takes in the lng and lat and files it in
    dropdown.addListener('place_changed', function () {
        const place = dropdown.getPlace();
        latInput.value = place.geometry.location.lat();
        lngInput.value = place.geometry.location.lng();
    })

    input.on('keydown', function(e){
        if (e.keycode == 13) e.preventDefault();
    })
}

export default autocomplete;