/* global angular, google, fetchJsonp, TransportApi */
(function () {
  // The App Module
  let app = angular.module('busDepartureBoard', ['ngMaterial', 'ngAnimate', 'ngAria', 'ngMessages'])

  // The App Controller
  app.controller('main', ($scope, $mdSidenav) => {
    // $mdSidenav | https://material.angularjs.org/latest/demo/sidenav#custom-sidenav
    $scope.toggle = sidenavId => {
      $mdSidenav(sidenavId).toggle()
    }

    // Default Map Location
    let defaultLocation = { lat: 51.5207, lng: -0.0938 }

    // Create the map
    let map = new google.maps.Map(document.querySelector('#map'), {
      center: defaultLocation,
      zoom: 17
    })

    // TransportAPI Credentials
    let transportApi = new TransportApi({
      id: '681b0dc0',
      key: 'f6c866682eb106c191551aadde2b222b'
    })

    // Bus Stops for the Sidenav
    $scope.busStops = []

    // How many pages to load multiplied by 25 is the number of markers to be created.
    let pagesToLoad = 40
    let loadPage = 1

    let loadPages = () => {
      if (loadPage < pagesToLoad) {
        transportApi.getNearbyStops(loadPage).then(data => {
          let { stops } = data

          // Bus Stops
          stops.forEach(stop => {
            let { atcocode } = stop

            // Create marker
            let marker = new google.maps.Marker({
              position: { lat: stop.latitude, lng: stop.longitude },
              map: map,
              title: stop.stop_name
              // icon: 'https://url.to/your.img'
            })

            // After clicking a marker
            marker.addListener('click', () => {
              // Show a loading status while fetching data...
              let loader = new google.maps.InfoWindow({
                content: `
                  <div class="map-info">
                    <h3 class="md-healing">${stop.stop_name}</h3>
                    <p>Loading...</p>
                  </div>
                `
              })

              loader.open(map, marker)

              transportApi.getBusDeparture(atcocode).then(data => {
                let { departures } = data
                let departureTemplate = []

                Object.keys(departures).forEach(key => {
                  departures[key].forEach(bus => {
                    // Add Bus operator, bus line number, & departure estimate
                    departureTemplate.push(`<span>${bus.operator} ${bus.line}: <strong>${bus.best_departure_estimate}</strong></span>`)
                  })
                })

                // Create the information template
                let infoCard = new google.maps.InfoWindow({
                  content: `
                    <div class="map-info">
                      <h3 class="md-heading">${stop.stop_name}</h3>
                      <p>${departureTemplate.join('<br />')}</p>
                    </div>
                  `
                })

                loader.close() // Close loader
                infoCard.open(map, marker) // Open information template
              })
            })

            // Create a trigger function to open marker from sidenav
            stop.trigger = () => {
              $scope.toggle('sideNavigation')
              let Trigger = google.maps.event.trigger
              return new Trigger(marker, 'click')
            }

            $scope.busStops.push(stop)
          })

          loadPage++
          loadPages()
        })
      } else console.log('All pages should now be loaded.')
    }

    // Start loading pages
    loadPages()
  }) // --> app.controller
}())
