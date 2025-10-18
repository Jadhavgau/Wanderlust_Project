document.addEventListener('DOMContentLoaded', () => {

  const MAP_TOKEN = "2QMtPeTZKNKAHKZcVZeH";

  const map = new maplibregl.Map({
    container: 'map',
    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAP_TOKEN}`,
    center: [77.2090, 28.6139], 
    zoom: 9
  });

  let marker;

  async function geocode(query) {
    if (!query) return null;
    try {
      const res = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAP_TOKEN}`);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        return { lng, lat };
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }
    return null;
  }

  function setMarker(lng, lat) {
    if (!marker) {
      marker = new maplibregl.Marker({ draggable: true, color : 'red' })
        .setLngLat([lng, lat])
        .addTo(map);

      marker.on('dragend', () => {
        const [lng, lat] = marker.getLngLat().toArray();
        const latInput = document.querySelector('[name="lat"], [name="latitude"]');
        const lngInput = document.querySelector('[name="lng"], [name="longitude"]');
        if (latInput) latInput.value = lat;
        if (lngInput) lngInput.value = lng;
      });

    } else {
      marker.setLngLat([lng, lat]);
    }
    map.flyTo({ center: [lng, lat], zoom: 14 });

    const latInput = document.querySelector('[name="lat"], [name="latitude"]');
    const lngInput = document.querySelector('[name="lng"], [name="longitude"]');
    if (latInput) latInput.value = lat;
    if (lngInput) lngInput.value = lng;
  }

  map.on('load', async () => {
    if (typeof listingLocation !== 'undefined' && listingLocation.trim() !== '') {
      const coords = await geocode(listingLocation);
      if (coords) {
        setMarker(coords.lng, coords.lat);
      } else {
        setMarker(77.2090, 28.6139);
      }
    } else {
      setMarker(77.2090, 28.6139);
    }
  });

  const addressInput = document.getElementById('address');
  if (addressInput) {
    addressInput.addEventListener('keypress', async e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const coords = await geocode(addressInput.value);
        if (coords) {
          setMarker(coords.lng, coords.lat);
        } else {
          alert('Location not found');
        }
      }
    });
  }

});