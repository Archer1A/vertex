import type { ObjectType, LinkType, PropertyType, PropertyValue, ObjectInstance, TimeSeriesPoint, TimeSeriesValue } from './types'

export type { ObjectType, LinkType, PropertyType, PropertyValue, ObjectInstance, TimeSeriesPoint, TimeSeriesValue }

export const flightProperties: PropertyType[] = [
  { "id": "flight_id", "objectTypeId": "object_type_flight", "apiName": "flightId", "displayName": "Flight ID", "description": "Unique identifier for a scheduled or operated flight.", "baseType": "string", "required": true, "isPrimaryKey": true, "searchable": true, "sortable": true, "filterable": true },
  { "id": "flight_number", "objectTypeId": "object_type_flight", "apiName": "flightNumber", "displayName": "Flight Number", "description": "Public airline flight number shown to passengers.", "baseType": "string", "required": true, "isTitleKey": true, "searchable": true, "sortable": true, "filterable": true },
  { "id": "airline_code", "objectTypeId": "object_type_flight", "apiName": "airlineCode", "displayName": "Airline Code", "description": "IATA or internal airline carrier code.", "baseType": "string", "required": true, "searchable": true, "sortable": true, "filterable": true },
  { "id": "airline_name", "objectTypeId": "object_type_flight", "apiName": "airlineName", "displayName": "Airline Name", "description": "Display name of the operating airline.", "baseType": "string", "searchable": true, "sortable": true, "filterable": true },
  { "id": "origin_airport_code", "objectTypeId": "object_type_flight", "apiName": "originAirportCode", "displayName": "Origin Airport Code", "description": "Departure airport IATA code.", "baseType": "string", "required": true, "searchable": true, "sortable": true, "filterable": true },
  { "id": "destination_airport_code", "objectTypeId": "object_type_flight", "apiName": "destinationAirportCode", "displayName": "Destination Airport Code", "description": "Arrival airport IATA code.", "baseType": "string", "required": true, "searchable": true, "sortable": true, "filterable": true },
  { "id": "scheduled_departure_time", "objectTypeId": "object_type_flight", "apiName": "scheduledDepartureTime", "displayName": "Scheduled Departure Time", "description": "Scheduled local departure datetime.", "baseType": "datetime", "required": true, "sortable": true, "filterable": true },
  { "id": "scheduled_arrival_time", "objectTypeId": "object_type_flight", "apiName": "scheduledArrivalTime", "displayName": "Scheduled Arrival Time", "description": "Scheduled local arrival datetime.", "baseType": "datetime", "required": true, "sortable": true, "filterable": true },
  { "id": "actual_departure_time", "objectTypeId": "object_type_flight", "apiName": "actualDepartureTime", "displayName": "Actual Departure Time", "description": "Actual recorded departure datetime.", "baseType": "datetime", "sortable": true, "filterable": true },
  { "id": "actual_arrival_time", "objectTypeId": "object_type_flight", "apiName": "actualArrivalTime", "displayName": "Actual Arrival Time", "description": "Actual recorded arrival datetime.", "baseType": "datetime", "sortable": true, "filterable": true },
  { "id": "flight_status", "objectTypeId": "object_type_flight", "apiName": "flightStatus", "displayName": "Flight Status", "description": "Current operational state of the flight.", "baseType": "enum", "required": true, "searchable": true, "sortable": true, "filterable": true },
  { "id": "aircraft_type", "objectTypeId": "object_type_flight", "apiName": "aircraftType", "displayName": "Aircraft Type", "description": "Aircraft model or equipment type.", "baseType": "string", "searchable": true, "sortable": true, "filterable": true },
  { "id": "gate", "objectTypeId": "object_type_flight", "apiName": "gate", "displayName": "Gate", "description": "Assigned departure or arrival gate.", "baseType": "string", "searchable": true, "sortable": true, "filterable": true },
  { "id": "terminal", "objectTypeId": "object_type_flight", "apiName": "terminal", "displayName": "Terminal", "description": "Airport terminal associated with the flight.", "baseType": "string", "searchable": true, "sortable": true, "filterable": true },
  { "id": "distance_miles", "objectTypeId": "object_type_flight", "apiName": "distanceMiles", "displayName": "Distance Miles", "description": "Estimated route distance in miles.", "baseType": "number", "sortable": true, "filterable": true },
  { "id": "delay_minutes", "objectTypeId": "object_type_flight", "apiName": "delayMinutes", "displayName": "Delay Minutes", "description": "Total departure or arrival delay in minutes.", "baseType": "number", "sortable": true, "filterable": true },
  { "id": "is_cancelled", "objectTypeId": "object_type_flight", "apiName": "isCancelled", "displayName": "Is Cancelled", "description": "Whether the flight was cancelled.", "baseType": "boolean", "sortable": true, "filterable": true },
  { "id": "route_points", "objectTypeId": "object_type_flight", "apiName": "routePoints", "displayName": "Route Points", "description": "Ordered route geometry or waypoint list.", "baseType": "array", "searchable": false, "sortable": false, "filterable": false }
]

export const airportProperties: PropertyType[] = [
  { "id": "airport_code", "objectTypeId": "object_type_airport", "apiName": "airport", "displayName": "Airport", "description": "IATA airport code used as the airport primary key.", "baseType": "string", "required": true, "isPrimaryKey": true, "searchable": true, "sortable": true, "filterable": true },
  { "id": "airport_country_iso_code", "objectTypeId": "object_type_airport", "apiName": "airportCountryIsoCode", "displayName": "Airport Country ISO Code", "description": "Two-letter ISO country code for the airport country.", "baseType": "string", "required": true, "searchable": true, "sortable": true, "filterable": true },
  { "id": "airport_country_name", "objectTypeId": "object_type_airport", "apiName": "airportCountryName", "displayName": "Airport Country Name", "description": "Country display name for the airport.", "baseType": "string", "required": true, "searchable": true, "sortable": true, "filterable": true },
  { "id": "airport_location", "objectTypeId": "object_type_airport", "apiName": "airportLocation", "displayName": "Airport Location", "description": "Airport latitude and longitude as a geographic point.", "baseType": "geopoint", "searchable": false, "sortable": false, "filterable": true },
  { "id": "airport_start_date", "objectTypeId": "object_type_airport", "apiName": "airportStartDate", "displayName": "Airport Start Date", "description": "Date when the airport record became active in the source dataset.", "baseType": "datetime", "sortable": true, "filterable": true },
  { "id": "airport_state_code", "objectTypeId": "object_type_airport", "apiName": "airportStateCode", "displayName": "Airport State Code", "description": "US state or regional code for the airport.", "baseType": "string", "searchable": true, "sortable": true, "filterable": true },
  { "id": "airport_state_name", "objectTypeId": "object_type_airport", "apiName": "airportStateName", "displayName": "Airport State Name", "description": "State or region display name for the airport.", "baseType": "string", "searchable": true, "sortable": true, "filterable": true },
  { "id": "display_airport_city_name_full", "objectTypeId": "object_type_airport", "apiName": "displayAirportCityNameFull", "displayName": "Display Airport City Name Full", "description": "Full city display name used for airport search and display.", "baseType": "string", "searchable": true, "sortable": true, "filterable": true },
  { "id": "display_airport_name", "objectTypeId": "object_type_airport", "apiName": "displayAirportName", "displayName": "Display Airport Name", "description": "Human-readable airport name.", "baseType": "string", "required": true, "isTitleKey": true, "searchable": true, "sortable": true, "filterable": true },
  { "id": "display_city_market_name_full", "objectTypeId": "object_type_airport", "apiName": "displayCityMarketNameFull", "displayName": "Display City Market Name Full", "description": "Full city market display name for metropolitan airport grouping.", "baseType": "string", "searchable": true, "sortable": true, "filterable": true },
  { "id": "display_name", "objectTypeId": "object_type_airport", "apiName": "displayName", "displayName": "Display Name", "description": "Compact airport label shown in graph nodes.", "baseType": "string", "searchable": true, "sortable": true, "filterable": true },
  { "id": "latitude", "objectTypeId": "object_type_airport", "apiName": "latitude", "displayName": "Latitude", "description": "Airport latitude in decimal degrees.", "baseType": "number", "sortable": true, "filterable": true },
  { "id": "longitude", "objectTypeId": "object_type_airport", "apiName": "longitude", "displayName": "Longitude", "description": "Airport longitude in decimal degrees.", "baseType": "number", "sortable": true, "filterable": true },
  { "id": "mapbox_feature_id_v3", "objectTypeId": "object_type_airport", "apiName": "mapboxFeatureIdV3", "displayName": "Mapbox Feature Id v3", "description": "Mapbox feature identifier used for map rendering.", "baseType": "string", "searchable": true, "sortable": true, "filterable": true }
]

export const flightObjectType: ObjectType = {
  id: 'object_type_flight',
  apiName: 'flight',
  displayName: '[Example Data] Flight',
  description: 'Mock flight object type for graph prototyping.',
  icon: 'route',
  color: '#3b82f6',
  status: 'active',
  primaryKeyPropertyId: 'flight_id',
  titlePropertyId: 'flight_number',
  properties: flightProperties
}

export const airportObjectType: ObjectType = {
  id: 'object_type_airport',
  apiName: 'airport',
  displayName: '[Example Data] Airport',
  description: 'Mock airport object type based on example aviation graph data.',
  icon: 'map-pin',
  color: '#8b3f9f',
  status: 'active',
  primaryKeyPropertyId: 'airport_code',
  titlePropertyId: 'display_airport_name',
  properties: airportProperties
}

export const objectTypes: ObjectType[] = [
  airportObjectType,
  flightObjectType
]

export const flightOriginAirportLinkType: LinkType = {
  id: 'link_type_flight_origin_airport',
  apiName: 'flightOriginAirport',
  displayName: '[Example Data] Flight Origin Airport',
  description: 'Connects a flight to the airport it departs from.',
  status: 'active',
  sourceObjectTypeId: 'object_type_flight',
  targetObjectTypeId: 'object_type_airport',
  cardinality: 'many-to-one',
  direction: 'directed'
}

export const flightDestinationAirportLinkType: LinkType = {
  id: 'link_type_flight_destination_airport',
  apiName: 'flightDestinationAirport',
  displayName: '[Example Data] Flight Destination Airport',
  description: 'Connects a flight to the airport it arrives at.',
  status: 'active',
  sourceObjectTypeId: 'object_type_flight',
  targetObjectTypeId: 'object_type_airport',
  cardinality: 'many-to-one',
  direction: 'directed'
}

export const linkTypes: LinkType[] = [
  flightOriginAirportLinkType,
  flightDestinationAirportLinkType
]

export const airportInstances: ObjectInstance[] = [
  { "id": "airport_sfo", "objectTypeId": "object_type_airport", "properties": { "airport": "SFO", "airportCountryIsoCode": "US", "airportCountryName": "United States", "airportLocation": { "latitude": 37.61888889, "longitude": -122.37555556 }, "airportStartDate": "2017-12-01T00:00:00Z", "airportStateCode": "CA", "airportStateName": "California", "displayAirportCityNameFull": "San Francisco, CA", "displayAirportName": "San Francisco International", "displayCityMarketNameFull": "San Francisco, CA (Metropolitan Area)", "displayName": "[SFO] San Francisco International", "latitude": 37.61888889, "longitude": -122.37555556, "mapboxFeatureIdV3": "332521" } },
  { "id": "airport_lax", "objectTypeId": "object_type_airport", "properties": { "airport": "LAX", "airportCountryIsoCode": "US", "airportCountryName": "United States", "airportLocation": { "latitude": 33.9425, "longitude": -118.40805556 }, "airportStartDate": "2017-12-01T00:00:00Z", "airportStateCode": "CA", "airportStateName": "California", "displayAirportCityNameFull": "Los Angeles, CA", "displayAirportName": "Los Angeles International", "displayCityMarketNameFull": "Los Angeles, CA (Metropolitan Area)", "displayName": "[LAX] Los Angeles International", "latitude": 33.9425, "longitude": -118.40805556, "mapboxFeatureIdV3": "332522" } },
  { "id": "airport_sea", "objectTypeId": "object_type_airport", "properties": { "airport": "SEA", "airportCountryIsoCode": "US", "airportCountryName": "United States", "airportLocation": { "latitude": 47.44898194, "longitude": -122.30931306 }, "airportStartDate": "2017-12-01T00:00:00Z", "airportStateCode": "WA", "airportStateName": "Washington", "displayAirportCityNameFull": "Seattle, WA", "displayAirportName": "Seattle Tacoma International", "displayCityMarketNameFull": "Seattle, WA (Metropolitan Area)", "displayName": "[SEA] Seattle Tacoma International", "latitude": 47.44898194, "longitude": -122.30931306, "mapboxFeatureIdV3": "332523" } },
  { "id": "airport_jfk", "objectTypeId": "object_type_airport", "properties": { "airport": "JFK", "airportCountryIsoCode": "US", "airportCountryName": "United States", "airportLocation": { "latitude": 40.63975111, "longitude": -73.77892556 }, "airportStartDate": "2017-12-01T00:00:00Z", "airportStateCode": "NY", "airportStateName": "New York", "displayAirportCityNameFull": "New York, NY", "displayAirportName": "John F Kennedy International", "displayCityMarketNameFull": "New York, NY (Metropolitan Area)", "displayName": "[JFK] John F Kennedy International", "latitude": 40.63975111, "longitude": -73.77892556, "mapboxFeatureIdV3": "332524" } }
]

export const flightInstances: ObjectInstance[] = [
  { "id": "flight_ua1175_20260425", "objectTypeId": "object_type_flight", "properties": { "flightId": "UA1175-2026-04-25", "flightNumber": "UA1175", "airlineCode": "UA", "airlineName": "United Airlines", "originAirportCode": "SFO", "destinationAirportCode": "LAX", "scheduledDepartureTime": "2026-04-25T08:10:00-07:00", "scheduledArrivalTime": "2026-04-25T09:40:00-07:00", "actualDepartureTime": "2026-04-25T08:18:00-07:00", "actualArrivalTime": "2026-04-25T09:46:00-07:00", "flightStatus": "Arrived", "aircraftType": "Boeing 737-900", "gate": "F12", "terminal": "3", "distanceMiles": 337, "delayMinutes": 6, "isCancelled": false, "routePoints": ["SFO", "LAX"] } },
  { "id": "flight_ua2381_20260425", "objectTypeId": "object_type_flight", "properties": { "flightId": "UA2381-2026-04-25", "flightNumber": "UA2381", "airlineCode": "UA", "airlineName": "United Airlines", "originAirportCode": "SFO", "destinationAirportCode": "SEA", "scheduledDepartureTime": "2026-04-25T10:25:00-07:00", "scheduledArrivalTime": "2026-04-25T12:33:00-07:00", "actualDepartureTime": "2026-04-25T10:29:00-07:00", "actualArrivalTime": "2026-04-25T12:38:00-07:00", "flightStatus": "Arrived", "aircraftType": "Airbus A320", "gate": "E7", "terminal": "3", "distanceMiles": 679, "delayMinutes": 5, "isCancelled": false, "routePoints": ["SFO", "SEA"] } },
  { "id": "flight_dl421_20260425", "objectTypeId": "object_type_flight", "properties": { "flightId": "DL421-2026-04-25", "flightNumber": "DL421", "airlineCode": "DL", "airlineName": "Delta Air Lines", "originAirportCode": "LAX", "destinationAirportCode": "JFK", "scheduledDepartureTime": "2026-04-25T07:00:00-07:00", "scheduledArrivalTime": "2026-04-25T15:29:00-04:00", "actualDepartureTime": "2026-04-25T07:06:00-07:00", "actualArrivalTime": "2026-04-25T15:34:00-04:00", "flightStatus": "Arrived", "aircraftType": "Boeing 767-300", "gate": "24A", "terminal": "3", "distanceMiles": 2475, "delayMinutes": 5, "isCancelled": false, "routePoints": ["LAX", "JFK"] } },
  { "id": "flight_as330_20260425", "objectTypeId": "object_type_flight", "properties": { "flightId": "AS330-2026-04-25", "flightNumber": "AS330", "airlineCode": "AS", "airlineName": "Alaska Airlines", "originAirportCode": "SEA", "destinationAirportCode": "SFO", "scheduledDepartureTime": "2026-04-25T13:15:00-07:00", "scheduledArrivalTime": "2026-04-25T15:25:00-07:00", "actualDepartureTime": "2026-04-25T13:21:00-07:00", "actualArrivalTime": "2026-04-25T15:31:00-07:00", "flightStatus": "Arrived", "aircraftType": "Boeing 737 MAX 9", "gate": "C9", "terminal": "Main", "distanceMiles": 679, "delayMinutes": 6, "isCancelled": false, "routePoints": ["SEA", "SFO"] } },
  { "id": "flight_b6401_20260425", "objectTypeId": "object_type_flight", "properties": { "flightId": "B6401-2026-04-25", "flightNumber": "B6401", "airlineCode": "B6", "airlineName": "JetBlue Airways", "originAirportCode": "JFK", "destinationAirportCode": "LAX", "scheduledDepartureTime": "2026-04-25T16:10:00-04:00", "scheduledArrivalTime": "2026-04-25T19:24:00-07:00", "actualDepartureTime": null, "actualArrivalTime": null, "flightStatus": "Scheduled", "aircraftType": "Airbus A321", "gate": "5", "terminal": "5", "distanceMiles": 2475, "delayMinutes": 0, "isCancelled": false, "routePoints": ["JFK", "LAX"] } },
  { "id": "flight_aa1846_20260425", "objectTypeId": "object_type_flight", "properties": { "flightId": "AA1846-2026-04-25", "flightNumber": "AA1846", "airlineCode": "AA", "airlineName": "American Airlines", "originAirportCode": "LAX", "destinationAirportCode": "SFO", "scheduledDepartureTime": "2026-04-25T20:05:00-07:00", "scheduledArrivalTime": "2026-04-25T21:32:00-07:00", "actualDepartureTime": null, "actualArrivalTime": null, "flightStatus": "Scheduled", "aircraftType": "Airbus A321neo", "gate": "46B", "terminal": "4", "distanceMiles": 337, "delayMinutes": 0, "isCancelled": false, "routePoints": ["LAX", "SFO"] } }
]

export const objectInstances: ObjectInstance[] = [
  ...airportInstances,
  ...flightInstances
]

export function getObjectTypes(): ObjectType[] {
  return objectTypes
}

export function getObjectTypeById(objectTypeId: string): ObjectType | undefined {
  return objectTypes.find((objectType) => objectType.id === objectTypeId)
}

export function getObjectTypeByApiName(apiName: string): ObjectType | undefined {
  return objectTypes.find((objectType) => objectType.apiName === apiName)
}

export function getPropertiesByObjectType(objectTypeOrId: ObjectType | string): PropertyType[] {
  const objectTypeId = typeof objectTypeOrId === 'string' ? objectTypeOrId : objectTypeOrId.id
  return objectTypes.find((objectType) => objectType.id === objectTypeId)?.properties ?? []
}

export function getLinkTypesByObjectType(objectTypeOrId: ObjectType | string): LinkType[] {
  const objectTypeId = typeof objectTypeOrId === 'string' ? objectTypeOrId : objectTypeOrId.id

  return linkTypes.filter((linkType) => {
    return linkType.sourceObjectTypeId === objectTypeId || linkType.targetObjectTypeId === objectTypeId
  })
}

export function getLinkTypeById(linkTypeId: string): LinkType | undefined {
  return linkTypes.find((linkType) => linkType.id === linkTypeId)
}

export function getObjectTypesByLinkType(linkTypeOrId: LinkType | string): {
  sourceObjectType?: ObjectType
  targetObjectType?: ObjectType
} {
  const linkType = typeof linkTypeOrId === 'string' ? getLinkTypeById(linkTypeOrId) : linkTypeOrId

  if (!linkType) {
    return {}
  }

  return {
    sourceObjectType: getObjectTypeById(linkType.sourceObjectTypeId),
    targetObjectType: getObjectTypeById(linkType.targetObjectTypeId)
  }
}
