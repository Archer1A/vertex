export interface ObjectType {
  id: string
  apiName: string
  displayName: string
  description?: string
  icon?: string
  color?: string
  status: 'experimental' | 'active' | 'deprecated'
  primaryKeyPropertyId: string
  titlePropertyId: string
  properties: PropertyType[]
}

export interface LinkType {
  id: string
  apiName: string
  displayName: string
  description?: string
  status: 'experimental' | 'active' | 'deprecated'
  sourceObjectTypeId: string
  targetObjectTypeId: string
  cardinality: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'
  direction: 'directed' | 'bidirectional'
  properties?: PropertyType[]
}

export interface PropertyType {
  id: string
  objectTypeId: string
  apiName: string
  displayName: string
  description?: string
  baseType: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'geopoint' | 'enum' | 'array' | 'struct'
  required?: boolean
  isPrimaryKey?: boolean
  isTitleKey?: boolean
  searchable?: boolean
  sortable?: boolean
  filterable?: boolean
}

export type PropertyValue = string | number | boolean | string[] | number[] | { latitude: number; longitude: number } | null

export interface ObjectInstance {
  id: string
  objectTypeId: string
  properties: Record<string, PropertyValue>
}

const WORKSTATION_OBJECT_TYPE_ID = 'object_type_airport'
const SERVER_OBJECT_TYPE_ID = 'object_type_flight'
const EVENT_OBJECT_TYPE_ID = 'object_type_event'

export const workstationProperties: PropertyType[] = [
  { id: 'workstation_code', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'airport', displayName: 'Workstation Code', description: 'Burn-in workstation code used as the station primary key.', baseType: 'string', required: true, isPrimaryKey: true, searchable: true, sortable: true, filterable: true },
  { id: 'display_workstation_name', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'displayAirportName', displayName: 'Display Workstation Name', description: 'Human-readable burn-in workstation name.', baseType: 'string', required: true, isTitleKey: true, searchable: true, sortable: true, filterable: true },
  { id: 'display_name', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'displayName', displayName: 'Display Name', description: 'Compact station label shown in graph nodes.', baseType: 'string', searchable: true, sortable: true, filterable: true },
  { id: 'line_name', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'lineName', displayName: 'Line Name', description: 'Production line that owns the burn-in workstation.', baseType: 'string', searchable: true, sortable: true, filterable: true },
  { id: 'workshop_zone', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'workshopZone', displayName: 'Workshop Zone', description: 'Physical workshop zone for the station.', baseType: 'string', searchable: true, sortable: true, filterable: true },
  { id: 'rack_capacity', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'rackCapacity', displayName: 'Rack Capacity', description: 'Maximum number of servers supported by this workstation.', baseType: 'number', sortable: true, filterable: true },
  { id: 'active_servers', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'activeServers', displayName: 'Active Servers', description: 'Current number of servers assigned to the workstation.', baseType: 'number', sortable: true, filterable: true },
  { id: 'burn_in_profile', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'burnInProfile', displayName: 'Burn-in Profile', description: 'Default stress profile running on this station.', baseType: 'enum', searchable: true, sortable: true, filterable: true },
  { id: 'target_temperature_c', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'targetTemperatureC', displayName: 'Target Temperature C', description: 'Target chamber temperature in Celsius.', baseType: 'number', sortable: true, filterable: true },
  { id: 'measured_temperature_c', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'measuredTemperatureC', displayName: 'Measured Temperature C', description: 'Latest measured chamber temperature in Celsius.', baseType: 'number', sortable: true, filterable: true },
  { id: 'power_budget_kw', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'powerBudgetKw', displayName: 'Power Budget kW', description: 'Available power budget for the rack.', baseType: 'number', sortable: true, filterable: true },
  { id: 'current_load_kw', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'currentLoadKw', displayName: 'Current Load kW', description: 'Current measured load for the rack.', baseType: 'number', sortable: true, filterable: true },
  { id: 'network_segment', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'networkSegment', displayName: 'Network Segment', description: 'Network segment used by BMC and test traffic.', baseType: 'string', searchable: true, sortable: true, filterable: true },
  { id: 'station_status', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'stationStatus', displayName: 'Station Status', description: 'Operational state of the burn-in station.', baseType: 'enum', searchable: true, sortable: true, filterable: true },
  { id: 'last_inspection_at', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'lastInspectionAt', displayName: 'Last Inspection At', description: 'Last time the station was inspected.', baseType: 'datetime', sortable: true, filterable: true },
  { id: 'owner_team', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'ownerTeam', displayName: 'Owner Team', description: 'Team responsible for operating the workstation.', baseType: 'string', searchable: true, sortable: true, filterable: true }
]

export const serverProperties: PropertyType[] = [
  { id: 'server_id', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'flightId', displayName: 'Server ID', description: 'Unique server identifier used as the server primary key.', baseType: 'string', required: true, isPrimaryKey: true, searchable: true, sortable: true, filterable: true },
  { id: 'hostname', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'flightNumber', displayName: 'Hostname', description: 'Hostname shown in operations tooling.', baseType: 'string', required: true, isTitleKey: true, searchable: true, sortable: true, filterable: true },
  { id: 'serial_number', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'serialNumber', displayName: 'Serial Number', description: 'Factory serial number for the server chassis.', baseType: 'string', required: true, searchable: true, sortable: true, filterable: true },
  { id: 'asset_tag', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'assetTag', displayName: 'Asset Tag', description: 'Internal asset tag assigned by manufacturing.', baseType: 'string', searchable: true, sortable: true, filterable: true },
  { id: 'server_model', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'serverModel', displayName: 'Server Model', description: 'Server platform or SKU.', baseType: 'string', searchable: true, sortable: true, filterable: true },
  { id: 'cpu_sku', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'cpuSku', displayName: 'CPU SKU', description: 'CPU configuration under burn-in.', baseType: 'string', searchable: true, sortable: true, filterable: true },
  { id: 'memory_gb', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'memoryGb', displayName: 'Memory GB', description: 'Installed memory in GB.', baseType: 'number', sortable: true, filterable: true },
  { id: 'storage_tb', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'storageTb', displayName: 'Storage TB', description: 'Installed storage capacity in TB.', baseType: 'number', sortable: true, filterable: true },
  { id: 'assigned_workstation_code', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'originAirportCode', displayName: 'Assigned Workstation Code', description: 'Current burn-in workstation assignment.', baseType: 'string', required: true, searchable: true, sortable: true, filterable: true },
  { id: 'burn_in_start_time', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'scheduledDepartureTime', displayName: 'Burn-in Start Time', description: 'Scheduled burn-in start timestamp.', baseType: 'datetime', required: true, sortable: true, filterable: true },
  { id: 'target_end_time', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'scheduledArrivalTime', displayName: 'Target End Time', description: 'Scheduled burn-in completion timestamp.', baseType: 'datetime', required: true, sortable: true, filterable: true },
  { id: 'last_heartbeat_at', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'actualDepartureTime', displayName: 'Last Heartbeat At', description: 'Latest heartbeat emitted by the burn-in agent.', baseType: 'datetime', sortable: true, filterable: true },
  { id: 'completed_at', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'actualArrivalTime', displayName: 'Completed At', description: 'Actual burn-in completion timestamp.', baseType: 'datetime', sortable: true, filterable: true },
  { id: 'burn_in_status', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'flightStatus', displayName: 'Burn-in Status', description: 'Current test execution state.', baseType: 'enum', required: true, searchable: true, sortable: true, filterable: true },
  { id: 'test_profile', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'aircraftType', displayName: 'Test Profile', description: 'Stress workload profile assigned to the server.', baseType: 'string', searchable: true, sortable: true, filterable: true },
  { id: 'rack_slot', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'gate', displayName: 'Rack Slot', description: 'Rack slot used by the server under test.', baseType: 'string', searchable: true, sortable: true, filterable: true },
  { id: 'power_pdu', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'terminal', displayName: 'Power PDU', description: 'PDU outlet group powering the server.', baseType: 'string', searchable: true, sortable: true, filterable: true },
  { id: 'duration_hours', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'distanceMiles', displayName: 'Duration Hours', description: 'Target burn-in duration in hours.', baseType: 'number', sortable: true, filterable: true },
  { id: 'thermal_margin_c', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'delayMinutes', displayName: 'Thermal Margin C', description: 'Current thermal margin in Celsius.', baseType: 'number', sortable: true, filterable: true },
  { id: 'is_quarantined', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'isCancelled', displayName: 'Is Quarantined', description: 'Whether the server is blocked for engineering review.', baseType: 'boolean', sortable: true, filterable: true }
]

export const eventProperties: PropertyType[] = [
  { id: 'event_id', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'eventId', displayName: 'Event ID', description: 'Unique identifier for the burn-in event.', baseType: 'string', required: true, isPrimaryKey: true, searchable: true, sortable: true, filterable: true },
  { id: 'event_title', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'eventTitle', displayName: 'Event Title', description: 'Human-readable event title.', baseType: 'string', required: true, isTitleKey: true, searchable: true, sortable: true, filterable: true },
  { id: 'event_type', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'eventType', displayName: 'Event Type', description: 'Kind of event captured during burn-in.', baseType: 'enum', searchable: true, sortable: true, filterable: true },
  { id: 'event_status', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'eventStatus', displayName: 'Event Status', description: 'Outcome represented by the event.', baseType: 'enum', searchable: true, sortable: true, filterable: true },
  { id: 'server_id_ref', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'serverId', displayName: 'Server ID', description: 'Server associated with this event.', baseType: 'string', searchable: true, sortable: true, filterable: true },
  { id: 'workstation_code_ref', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'workstationCode', displayName: 'Workstation Code', description: 'Workstation associated with this event.', baseType: 'string', searchable: true, sortable: true, filterable: true },
  { id: 'pass_rate_percent', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'passRatePercent', displayName: 'Pass Rate Percent', description: 'Observed workstation pass rate percentage.', baseType: 'number', sortable: true, filterable: true },
  { id: 'threshold_percent', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'thresholdPercent', displayName: 'Threshold Percent', description: 'Configured pass rate threshold percentage.', baseType: 'number', sortable: true, filterable: true },
  { id: 'severity', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'severity', displayName: 'Severity', description: 'Operational severity for the event.', baseType: 'enum', searchable: true, sortable: true, filterable: true },
  { id: 'started_at', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'startedAt', displayName: 'Started At', description: 'Start timestamp for the event.', baseType: 'datetime', sortable: true, filterable: true },
  { id: 'ended_at', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'endedAt', displayName: 'Ended At', description: 'End timestamp for the event, when available.', baseType: 'datetime', sortable: true, filterable: true },
  { id: 'duration_minutes', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'durationMinutes', displayName: 'Duration Minutes', description: 'Event duration in minutes.', baseType: 'number', sortable: true, filterable: true },
  { id: 'summary', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'summary', displayName: 'Summary', description: 'Short failure summary.', baseType: 'string', searchable: true, sortable: true, filterable: true }
]

export const airportProperties = workstationProperties
export const flightProperties = serverProperties

export const workstationObjectType: ObjectType = {
  id: WORKSTATION_OBJECT_TYPE_ID,
  apiName: 'airport',
  displayName: '[Burn-in] Workstation',
  description: 'Mock burn-in workstation object type for server manufacturing graph prototyping.',
  icon: 'map-pin',
  color: '#8b3f9f',
  status: 'active',
  primaryKeyPropertyId: 'workstation_code',
  titlePropertyId: 'display_workstation_name',
  properties: workstationProperties
}

export const serverObjectType: ObjectType = {
  id: SERVER_OBJECT_TYPE_ID,
  apiName: 'flight',
  displayName: '[Burn-in] Server',
  description: 'Mock server object type for burn-in test graph prototyping.',
  icon: 'server',
  color: '#3b82f6',
  status: 'active',
  primaryKeyPropertyId: 'server_id',
  titlePropertyId: 'hostname',
  properties: serverProperties
}

export const eventObjectType: ObjectType = {
  id: EVENT_OBJECT_TYPE_ID,
  apiName: 'event',
  displayName: '[Burn-in] Event',
  description: 'Mock event object type for point-in-time or interval burn-in outcomes.',
  icon: 'alert-triangle',
  color: '#dc2626',
  status: 'active',
  primaryKeyPropertyId: 'event_id',
  titlePropertyId: 'event_title',
  properties: eventProperties
}

export const airportObjectType = workstationObjectType
export const flightObjectType = serverObjectType

export const objectTypes: ObjectType[] = [
  workstationObjectType,
  serverObjectType,
  eventObjectType
]

export const serverAssignedWorkstationLinkType: LinkType = {
  id: 'link_type_flight_origin_airport',
  apiName: 'flightOriginAirport',
  displayName: '[Burn-in] Server Assigned Workstation',
  description: 'Connects a server to the workstation currently running burn-in.',
  status: 'active',
  sourceObjectTypeId: SERVER_OBJECT_TYPE_ID,
  targetObjectTypeId: WORKSTATION_OBJECT_TYPE_ID,
  cardinality: 'many-to-one',
  direction: 'directed'
}

export const serverFailureEventLinkType: LinkType = {
  id: 'link_type_server_failure_event',
  apiName: 'serverFailureEvent',
  displayName: '[Burn-in] Server Failure Event',
  description: 'Connects a server to failed burn-in test events.',
  status: 'active',
  sourceObjectTypeId: SERVER_OBJECT_TYPE_ID,
  targetObjectTypeId: EVENT_OBJECT_TYPE_ID,
  cardinality: 'one-to-many',
  direction: 'directed'
}

export const workstationPassRateEventLinkType: LinkType = {
  id: 'link_type_workstation_pass_rate_event',
  apiName: 'workstationPassRateEvent',
  displayName: '[Burn-in] Workstation Pass Rate Event',
  description: 'Connects a workstation to pass-rate threshold events.',
  status: 'active',
  sourceObjectTypeId: WORKSTATION_OBJECT_TYPE_ID,
  targetObjectTypeId: EVENT_OBJECT_TYPE_ID,
  cardinality: 'one-to-many',
  direction: 'directed'
}

export const flightOriginAirportLinkType = serverAssignedWorkstationLinkType

export const linkTypes: LinkType[] = [
  serverAssignedWorkstationLinkType,
  serverFailureEventLinkType,
  workstationPassRateEventLinkType
]

export const workstationInstances: ObjectInstance[] = [
  {
    id: 'workstation_st_burnin_01',
    objectTypeId: WORKSTATION_OBJECT_TYPE_ID,
    properties: {
      airport: 'Workstation1',
      displayAirportName: 'Burn-in Workstation Workstation1',
      displayName: '[Workstation1] Burn-in Station',
      lineName: 'Burn-in Line A',
      workshopZone: 'Thermal Chamber Row 1',
      rackCapacity: 16,
      activeServers: 3,
      burnInProfile: 'CPU_MEM_STRESS_24H',
      targetTemperatureC: 42,
      measuredTemperatureC: 41.8,
      powerBudgetKw: 18,
      currentLoadKw: 11.4,
      networkSegment: 'burnin-vlan-101',
      stationStatus: 'Running',
      lastInspectionAt: '2026-04-27T07:30:00+08:00',
      ownerTeam: 'Manufacturing Test'
    }
  },
  {
    id: 'workstation_st_burnin_02',
    objectTypeId: WORKSTATION_OBJECT_TYPE_ID,
    properties: {
      airport: 'Workstation2',
      displayAirportName: 'Burn-in Workstation Workstation2',
      displayName: '[Workstation2] Burn-in Station',
      lineName: 'Burn-in Line A',
      workshopZone: 'Thermal Chamber Row 2',
      rackCapacity: 16,
      activeServers: 4,
      burnInProfile: 'GPU_PCIE_STRESS_12H',
      targetTemperatureC: 45,
      measuredTemperatureC: 45.6,
      powerBudgetKw: 22,
      currentLoadKw: 16.8,
      networkSegment: 'burnin-vlan-102',
      stationStatus: 'Running',
      lastInspectionAt: '2026-04-27T07:45:00+08:00',
      ownerTeam: 'Manufacturing Test'
    }
  },
  {
    id: 'workstation_st_burnin_03',
    objectTypeId: WORKSTATION_OBJECT_TYPE_ID,
    properties: {
      airport: 'Workstation3',
      displayAirportName: 'Burn-in Workstation Workstation3',
      displayName: '[Workstation3] Burn-in Station',
      lineName: 'Burn-in Line B',
      workshopZone: 'Rework Validation Row',
      rackCapacity: 12,
      activeServers: 3,
      burnInProfile: 'NETWORK_IO_STRESS_8H',
      targetTemperatureC: 40,
      measuredTemperatureC: 39.7,
      powerBudgetKw: 16,
      currentLoadKw: 9.2,
      networkSegment: 'burnin-vlan-103',
      stationStatus: 'Degraded',
      lastInspectionAt: '2026-04-27T06:55:00+08:00',
      ownerTeam: 'Reliability Engineering'
    }
  }
]

export const serverInstances: ObjectInstance[] = [
  { id: 'server01', objectTypeId: SERVER_OBJECT_TYPE_ID, properties: { flightId: 'server01', flightNumber: 'server01', serialNumber: 'SN-BI-20260427-001', assetTag: 'AT-BI-0001', serverModel: 'VX-R740xd', cpuSku: '2x Xeon Gold 6548Y+', memoryGb: 512, storageTb: 15.36, originAirportCode: 'Workstation1', scheduledDepartureTime: '2026-04-27T08:00:00+08:00', scheduledArrivalTime: '2026-04-28T08:00:00+08:00', actualDepartureTime: '2026-04-27T11:58:00+08:00', actualArrivalTime: null, flightStatus: 'Running', aircraftType: 'CPU_MEM_STRESS_24H', gate: 'R1-U01', terminal: 'PDU-A1', distanceMiles: 24, delayMinutes: 12, isCancelled: false } },
  { id: 'server02', objectTypeId: SERVER_OBJECT_TYPE_ID, properties: { flightId: 'server02', flightNumber: 'server02', serialNumber: 'SN-BI-20260427-002', assetTag: 'AT-BI-0002', serverModel: 'VX-R740xd', cpuSku: '2x Xeon Gold 6548Y+', memoryGb: 512, storageTb: 15.36, originAirportCode: 'Workstation1', scheduledDepartureTime: '2026-04-27T08:15:00+08:00', scheduledArrivalTime: '2026-04-28T08:15:00+08:00', actualDepartureTime: '2026-04-27T11:57:00+08:00', actualArrivalTime: null, flightStatus: 'Running', aircraftType: 'CPU_MEM_STRESS_24H', gate: 'R1-U02', terminal: 'PDU-A1', distanceMiles: 24, delayMinutes: 14, isCancelled: false } },
  { id: 'server03', objectTypeId: SERVER_OBJECT_TYPE_ID, properties: { flightId: 'server03', flightNumber: 'server03', serialNumber: 'SN-BI-20260427-003', assetTag: 'AT-BI-0003', serverModel: 'VX-R750xa', cpuSku: '2x Xeon Platinum 8592+', memoryGb: 1024, storageTb: 30.72, originAirportCode: 'Workstation1', scheduledDepartureTime: '2026-04-27T08:30:00+08:00', scheduledArrivalTime: '2026-04-28T08:30:00+08:00', actualDepartureTime: '2026-04-27T11:56:00+08:00', actualArrivalTime: null, flightStatus: 'Warning', aircraftType: 'CPU_MEM_STRESS_24H', gate: 'R1-U03', terminal: 'PDU-A2', distanceMiles: 24, delayMinutes: 5, isCancelled: false } },
  { id: 'server04', objectTypeId: SERVER_OBJECT_TYPE_ID, properties: { flightId: 'server04', flightNumber: 'server04', serialNumber: 'SN-BI-20260427-004', assetTag: 'AT-BI-0004', serverModel: 'VX-R750xa', cpuSku: '2x Xeon Platinum 8592+', memoryGb: 1024, storageTb: 30.72, originAirportCode: 'Workstation2', scheduledDepartureTime: '2026-04-27T09:00:00+08:00', scheduledArrivalTime: '2026-04-27T21:00:00+08:00', actualDepartureTime: '2026-04-27T11:59:00+08:00', actualArrivalTime: null, flightStatus: 'Running', aircraftType: 'GPU_PCIE_STRESS_12H', gate: 'R2-U01', terminal: 'PDU-B1', distanceMiles: 12, delayMinutes: 18, isCancelled: false } },
  { id: 'server05', objectTypeId: SERVER_OBJECT_TYPE_ID, properties: { flightId: 'server05', flightNumber: 'server05', serialNumber: 'SN-BI-20260427-005', assetTag: 'AT-BI-0005', serverModel: 'VX-R760', cpuSku: '2x EPYC 9654', memoryGb: 768, storageTb: 23.04, originAirportCode: 'Workstation2', scheduledDepartureTime: '2026-04-27T09:15:00+08:00', scheduledArrivalTime: '2026-04-27T21:15:00+08:00', actualDepartureTime: '2026-04-27T11:55:00+08:00', actualArrivalTime: null, flightStatus: 'Running', aircraftType: 'GPU_PCIE_STRESS_12H', gate: 'R2-U02', terminal: 'PDU-B1', distanceMiles: 12, delayMinutes: 20, isCancelled: false } },
  { id: 'server06', objectTypeId: SERVER_OBJECT_TYPE_ID, properties: { flightId: 'server06', flightNumber: 'server06', serialNumber: 'SN-BI-20260427-006', assetTag: 'AT-BI-0006', serverModel: 'VX-R760', cpuSku: '2x EPYC 9654', memoryGb: 768, storageTb: 23.04, originAirportCode: 'Workstation2', scheduledDepartureTime: '2026-04-27T00:30:00+08:00', scheduledArrivalTime: '2026-04-27T12:30:00+08:00', actualDepartureTime: '2026-04-27T12:01:00+08:00', actualArrivalTime: '2026-04-27T12:22:00+08:00', flightStatus: 'Passed', aircraftType: 'GPU_PCIE_STRESS_12H', gate: 'R2-U03', terminal: 'PDU-B2', distanceMiles: 12, delayMinutes: 24, isCancelled: false } },
  { id: 'server07', objectTypeId: SERVER_OBJECT_TYPE_ID, properties: { flightId: 'server07', flightNumber: 'server07', serialNumber: 'SN-BI-20260427-007', assetTag: 'AT-BI-0007', serverModel: 'VX-R760', cpuSku: '2x EPYC 9654', memoryGb: 512, storageTb: 15.36, originAirportCode: 'Workstation2', scheduledDepartureTime: '2026-04-27T10:00:00+08:00', scheduledArrivalTime: '2026-04-27T22:00:00+08:00', actualDepartureTime: '2026-04-27T11:54:00+08:00', actualArrivalTime: null, flightStatus: 'Running', aircraftType: 'GPU_PCIE_STRESS_12H', gate: 'R2-U04', terminal: 'PDU-B2', distanceMiles: 12, delayMinutes: 16, isCancelled: false } },
  { id: 'server08', objectTypeId: SERVER_OBJECT_TYPE_ID, properties: { flightId: 'server08', flightNumber: 'server08', serialNumber: 'SN-BI-20260427-008', assetTag: 'AT-BI-0008', serverModel: 'VX-EDGE-2U', cpuSku: '1x Xeon D-2796NT', memoryGb: 256, storageTb: 7.68, originAirportCode: 'Workstation3', scheduledDepartureTime: '2026-04-27T10:30:00+08:00', scheduledArrivalTime: '2026-04-27T18:30:00+08:00', actualDepartureTime: '2026-04-27T11:53:00+08:00', actualArrivalTime: null, flightStatus: 'Running', aircraftType: 'NETWORK_IO_STRESS_8H', gate: 'R3-U01', terminal: 'PDU-C1', distanceMiles: 8, delayMinutes: 22, isCancelled: false } },
  { id: 'server09', objectTypeId: SERVER_OBJECT_TYPE_ID, properties: { flightId: 'server09', flightNumber: 'server09', serialNumber: 'SN-BI-20260427-009', assetTag: 'AT-BI-0009', serverModel: 'VX-EDGE-2U', cpuSku: '1x Xeon D-2796NT', memoryGb: 256, storageTb: 7.68, originAirportCode: 'Workstation3', scheduledDepartureTime: '2026-04-27T10:45:00+08:00', scheduledArrivalTime: '2026-04-27T18:45:00+08:00', actualDepartureTime: '2026-04-27T11:40:00+08:00', actualArrivalTime: null, flightStatus: 'Failed', aircraftType: 'NETWORK_IO_STRESS_8H', gate: 'R3-U02', terminal: 'PDU-C1', distanceMiles: 8, delayMinutes: -2, isCancelled: true } },
  { id: 'server10', objectTypeId: SERVER_OBJECT_TYPE_ID, properties: { flightId: 'server10', flightNumber: 'server10', serialNumber: 'SN-BI-20260427-010', assetTag: 'AT-BI-0010', serverModel: 'VX-EDGE-2U', cpuSku: '1x Xeon D-2796NT', memoryGb: 256, storageTb: 7.68, originAirportCode: 'Workstation3', scheduledDepartureTime: '2026-04-27T12:15:00+08:00', scheduledArrivalTime: '2026-04-27T20:15:00+08:00', actualDepartureTime: null, actualArrivalTime: null, flightStatus: 'Queued', aircraftType: 'NETWORK_IO_STRESS_8H', gate: 'R3-U03', terminal: 'PDU-C2', distanceMiles: 8, delayMinutes: 30, isCancelled: false } }
]

export const eventInstances: ObjectInstance[] = [
  { id: 'event_burnin_failure_server02', objectTypeId: EVENT_OBJECT_TYPE_ID, properties: { eventId: 'EVT-BI-FAIL-0002', eventTitle: 'server02 Burn-in Failed', eventType: 'Burn-in Test Result', eventStatus: 'Failed', serverId: 'server02', severity: 'High', startedAt: '2026-04-27T10:42:00+08:00', endedAt: '2026-04-27T10:58:00+08:00', durationMinutes: 16, summary: 'Memory stress loop reported ECC threshold exceeded.' } },
  { id: 'event_burnin_failure_server05', objectTypeId: EVENT_OBJECT_TYPE_ID, properties: { eventId: 'EVT-BI-FAIL-0005', eventTitle: 'server05 Burn-in Failed', eventType: 'Burn-in Test Result', eventStatus: 'Failed', serverId: 'server05', severity: 'Critical', startedAt: '2026-04-27T11:08:00+08:00', endedAt: '2026-04-27T11:27:00+08:00', durationMinutes: 19, summary: 'GPU PCIe stress test failed link stability checks.' } },
  { id: 'event_burnin_failure_server06', objectTypeId: EVENT_OBJECT_TYPE_ID, properties: { eventId: 'EVT-BI-FAIL-0006', eventTitle: 'server06 Burn-in Failed', eventType: 'Burn-in Test Result', eventStatus: 'Failed', serverId: 'server06', severity: 'High', startedAt: '2026-04-27T11:31:00+08:00', endedAt: '2026-04-27T11:44:00+08:00', durationMinutes: 13, summary: 'Thermal margin dropped below acceptable threshold.' } },
  { id: 'event_low_pass_rate_workstation2', objectTypeId: EVENT_OBJECT_TYPE_ID, properties: { eventId: 'EVT-BI-WKS-LOWPASS-0002', eventTitle: 'Workstation2 Pass Rate Below Threshold', eventType: 'Workstation Pass Rate Low', eventStatus: 'Warning', workstationCode: 'Workstation2', passRatePercent: 87.5, thresholdPercent: 90, severity: 'Medium', startedAt: '2026-04-27T08:00:00+08:00', endedAt: '2026-04-27T12:00:00+08:00', durationMinutes: 240, summary: 'Workstation2 burn-in pass rate dropped to 87.5%, below the 90% threshold.' } }
]

export const airportInstances = workstationInstances
export const flightInstances = serverInstances

export const objectInstances: ObjectInstance[] = [
  ...workstationInstances,
  ...serverInstances,
  ...eventInstances
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
