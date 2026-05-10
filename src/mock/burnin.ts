import { type ObjectType, type PropertyType, type ObjectInstance } from './types'

export const WORKSTATION_OBJECT_TYPE_ID = 'object_type_airport'
export const SERVER_OBJECT_TYPE_ID = 'object_type_flight'
export const EVENT_OBJECT_TYPE_ID = 'object_type_event'

export const workstationProperties: PropertyType[] = [
  { id: 'airport', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'airport', displayName: 'Airport Code', description: '机场三字码', baseType: 'string', required: true, isPrimaryKey: true },
  { id: 'displayAirportName', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'displayAirportName', displayName: 'Display Name', description: '显示名称', baseType: 'string', required: true, isTitleKey: true },
  { id: 'displayName', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'displayName', displayName: 'Full Display Name', description: '完整显示名称', baseType: 'string', required: true },
  { id: 'lineName', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'lineName', displayName: 'Line Name', description: '生产线名称', baseType: 'string', searchable: true, sortable: true },
  { id: 'workshopZone', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'workshopZone', displayName: 'Workshop Zone', description: '车间区域', baseType: 'string', searchable: true },
  { id: 'rackCapacity', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'rackCapacity', displayName: 'Rack Capacity', description: '机架容量', baseType: 'integer', sortable: true, filterable: true },
  { id: 'activeServers', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'activeServers', displayName: 'Active Servers', description: '当前运行服务器数', baseType: 'integer', sortable: true },
  { id: 'burnInProfile', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'burnInProfile', displayName: 'Burn-in Profile', description: '老化测试配置', baseType: 'string', searchable: true },
  { id: 'targetTemperatureC', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'targetTemperatureC', displayName: 'Target Temperature (C)', description: '目标温度（摄氏度）', baseType: 'number', sortable: true },
  { id: 'measuredTemperatureC', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'measuredTemperatureC', displayName: 'Measured Temperature (C)', description: '实测温度（摄氏度）', baseType: 'number', sortable: true },
  { id: 'ownerTeam', objectTypeId: WORKSTATION_OBJECT_TYPE_ID, apiName: 'ownerTeam', displayName: 'Owner Team', description: '负责团队', baseType: 'string', searchable: true }
]

export const serverProperties: PropertyType[] = [
  { id: 'flightId', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'flightId', displayName: 'Flight ID', description: '航班ID', baseType: 'string', required: true, isPrimaryKey: true },
  { id: 'flightNumber', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'flightNumber', displayName: 'Flight Number', description: '航班号', baseType: 'string', required: true },
  { id: 'serialNumber', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'serialNumber', displayName: 'Serial Number', description: '序列号', baseType: 'string', required: true, searchable: true },
  { id: 'assetTag', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'assetTag', displayName: 'Asset Tag', description: '资产标签', baseType: 'string', searchable: true },
  { id: 'serverModel', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'serverModel', displayName: 'Server Model', description: '服务器型号', baseType: 'string', required: true, searchable: true, sortable: true },
  { id: 'cpuSku', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'cpuSku', displayName: 'CPU SKU', description: 'CPU 型号', baseType: 'string', searchable: true },
  { id: 'memoryGb', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'memoryGb', displayName: 'Memory (GB)', description: '内存大小（GB）', baseType: 'integer', sortable: true, filterable: true },
  { id: 'storageTb', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'storageTb', displayName: 'Storage (TB)', description: '存储大小（TB）', baseType: 'number', sortable: true, filterable: true },
  { id: 'originAirportCode', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'originAirportCode', displayName: 'Origin Airport Code', description: '起飞机场', baseType: 'string', required: true, searchable: true },
  { id: 'scheduledDepartureTime', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'scheduledDepartureTime', displayName: 'Scheduled Departure', description: '计划起飞时间', baseType: 'datetime', sortable: true },
  { id: 'scheduledArrivalTime', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'scheduledArrivalTime', displayName: 'Scheduled Arrival', description: '计划到达时间', baseType: 'datetime', sortable: true },
  { id: 'actualDepartureTime', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'actualDepartureTime', displayName: 'Actual Departure', description: '实际起飞时间', baseType: 'datetime' },
  { id: 'actualArrivalTime', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'actualArrivalTime', displayName: 'Actual Arrival', description: '实际到达时间', baseType: 'datetime' },
  { id: 'flightStatus', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'flightStatus', displayName: 'Status', description: '航班状态', baseType: 'string', required: true, searchable: true, sortable: true },
  { id: 'aircraftType', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'aircraftType', displayName: 'Aircraft Type', description: '机型', baseType: 'string', searchable: true },
  { id: 'gate', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'gate', displayName: 'Gate', description: '登机口', baseType: 'string', searchable: true },
  { id: 'terminal', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'terminal', displayName: 'Terminal', description: '航站楼', baseType: 'string', searchable: true },
  { id: 'distanceMiles', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'distanceMiles', displayName: 'Distance (miles)', description: '飞行距离（英里）', baseType: 'number', sortable: true, filterable: true },
  { id: 'delayMinutes', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'delayMinutes', displayName: 'Delay (minutes)', description: '延误时间（分钟）', baseType: 'integer', sortable: true, filterable: true },
  { id: 'isCancelled', objectTypeId: SERVER_OBJECT_TYPE_ID, apiName: 'isCancelled', displayName: 'Cancelled', description: '是否取消', baseType: 'boolean', filterable: true }
]

export const eventProperties: PropertyType[] = [
  { id: 'eventId', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'eventId', displayName: 'Event ID', description: '事件ID', baseType: 'string', required: true, isPrimaryKey: true },
  { id: 'eventTitle', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'eventTitle', displayName: 'Event Title', description: '事件标题', baseType: 'string', required: true, isTitleKey: true },
  { id: 'eventType', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'eventType', displayName: 'Event Type', description: '事件类型', baseType: 'string', required: true, searchable: true },
  { id: 'eventStatus', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'eventStatus', displayName: 'Event Status', description: '事件状态', baseType: 'string', required: true, searchable: true, sortable: true },
  { id: 'serverId', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'serverId', displayName: 'Server ID', description: '服务器ID', baseType: 'string', searchable: true },
  { id: 'workstationCode', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'workstationCode', displayName: 'Workstation Code', description: '工作站编码', baseType: 'string', searchable: true },
  { id: 'severity', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'severity', displayName: 'Severity', description: '严重程度', baseType: 'string', searchable: true, sortable: true },
  { id: 'startedAt', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'startedAt', displayName: 'Started At', description: '开始时间', baseType: 'datetime', sortable: true },
  { id: 'endedAt', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'endedAt', displayName: 'Ended At', description: '结束时间', baseType: 'datetime' },
  { id: 'durationMinutes', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'durationMinutes', displayName: 'Duration (minutes)', description: '持续时间（分钟）', baseType: 'integer', sortable: true },
  { id: 'summary', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'summary', displayName: 'Summary', description: '摘要', baseType: 'string' },
  { id: 'passRatePercent', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'passRatePercent', displayName: 'Pass Rate (%)', description: '合格率（百分比）', baseType: 'number', sortable: true },
  { id: 'thresholdPercent', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'thresholdPercent', displayName: 'Threshold (%)', description: '阈值（百分比）', baseType: 'number', sortable: true }
]

export const airportProperties = workstationProperties
export const flightProperties = serverProperties

export const workstationObjectType: ObjectType = {
  id: WORKSTATION_OBJECT_TYPE_ID,
  apiName: 'workstation',
  displayName: 'Burn-in Workstation',
  description: 'Burn-in test workstation',
  icon: 'server',
  color: '#3b82f6',
  status: 'active',
  primaryKeyPropertyId: 'airport',
  titlePropertyId: 'displayAirportName',
  properties: workstationProperties
}

export const serverObjectType: ObjectType = {
  id: SERVER_OBJECT_TYPE_ID,
  apiName: 'server',
  displayName: 'Server (Flight)',
  description: 'Server under burn-in test',
  icon: 'server',
  color: '#10b981',
  status: 'active',
  primaryKeyPropertyId: 'flightId',
  titlePropertyId: 'flightNumber',
  properties: serverProperties
}

export const eventObjectType: ObjectType = {
  id: EVENT_OBJECT_TYPE_ID,
  apiName: 'event',
  displayName: 'Burn-in Event',
  description: 'Burn-in test event',
  icon: 'alert-triangle',
  color: '#f59e0b',
  status: 'active',
  primaryKeyPropertyId: 'eventId',
  titlePropertyId: 'eventTitle',
  properties: eventProperties
}

export const airportObjectType = workstationObjectType
export const flightObjectType = serverObjectType

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
      ownerTeam: 'Reliability Engineering'
    }
  },
  {
    id: 'workstation_st_burnin_02',
    objectTypeId: WORKSTATION_OBJECT_TYPE_ID,
    properties: {
      airport: 'Workstation2',
      displayAirportName: 'Burn-in Workstation Workstation2',
      displayName: '[Workstation2] Burn-in Station',
      lineName: 'Burn-in Line B',
      workshopZone: 'Thermal Chamber Row 2',
      rackCapacity: 16,
      activeServers: 4,
      burnInProfile: 'GPU_PCIE_STRESS_12H',
      targetTemperatureC: 45,
      measuredTemperatureC: 44.2,
      ownerTeam: 'Reliability Engineering'
    }
  },
  {
    id: 'workstation_st_burnin_03',
    objectTypeId: WORKSTATION_OBJECT_TYPE_ID,
    properties: {
      airport: 'Workstation3',
      displayAirportName: 'Burn-in Workstation Workstation3',
      displayName: '[Workstation3] Burn-in Station',
      lineName: 'Burn-in Line C',
      workshopZone: 'Network IO Test Area',
      rackCapacity: 12,
      activeServers: 2,
      burnInProfile: 'NETWORK_IO_STRESS_8H',
      targetTemperatureC: 38,
      measuredTemperatureC: 37.5,
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
