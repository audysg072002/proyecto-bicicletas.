document.addEventListener('DOMContentLoaded', function () {
  const mapDiv = document.getElementById('map');
  const lat = parseFloat(mapDiv.dataset.lat);
  const lng = parseFloat(mapDiv.dataset.lng);

  const map = L.map('map').setView([lat, lng], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  // Se obtiene la colección de bicicletas desde la API
  // y se agrega un marcador por cada una.
  fetch('/api/bicicletas')
    .then(res => res.json())
    .then(data => {
      data.bicicletas.forEach(bici => {
        const [biciLat, biciLng] = bici.ubicacion;
        L.marker([biciLat, biciLng])
          .addTo(map)
          .bindPopup(`Bicicleta #${bici.id}<br>Color: ${bici.color}<br>Modelo: ${bici.modelo}`);
      });
    })
    .catch(err => console.error('Error cargando bicicletas:', err));
});
