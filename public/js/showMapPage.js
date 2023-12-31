mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v11', // style URL
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 11, // starting zoom
  projection: 'globe' // display the map as a 3D globe
});
map.on('style.load', () => {
  map.setFog({}); // Set the default atmosphere style
});

map.addControl(new mapboxgl.NavigationControl());

const popup = new mapboxgl.Popup({ offset: 25 })
  .setHTML(`<h3>${campground.title}</h3><p>${campground.location}</p>`);

const marker = new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(popup)
  .addTo(map);

//There is some campground doesn't have lngLat because it has been created before we adding our geometry to our model, fix that !!! 