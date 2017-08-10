/* global fetchJsonp */
var TransportApi = function (api) {
  this.apiUrl = 'http://transportapi.com/v3'
  this.appId = api.id
  this.appKey = api.key
  this.defaultLocation = api.defaultLocation || { lat: 51.5207, lng: -0.0938 }
}

// API Request Constructor
TransportApi.prototype.api = function (endpoint, params) {
  var urlEncoded = []
  params.app_id = this.appId
  params.app_key = this.appKey
  Object.keys(params).forEach(param => urlEncoded.push(`${param}=${params[param]}`))
  return fetchJsonp(`${this.apiUrl}${endpoint}?${urlEncoded.join('&')}`).then(resp => { return resp.json() })
}

// Get nearby stops | https://developer.transportapi.com/docs?raml=https://transportapi.com/v3/raml/transportapi.raml##uk_bus_stops_near_json
TransportApi.prototype.getNearbyStops = function (page, lat, lon) {
  return this.api('/uk/bus/stops/near.json', {
    page: page || 1,
    lat: lat || this.defaultLocation.lat,
    lon: lon || this.defaultLocation.lng
  })
}

// Get bus departure | https://developer.transportapi.com/docs?raml=https://transportapi.com/v3/raml/transportapi.raml##uk_bus_stop_atcocode_live_json
TransportApi.prototype.getBusDeparture = function (atcocode) {
  return this.api(`/uk/bus/stop/${atcocode}/live.json`, {
    group: 'route'
  })
}
