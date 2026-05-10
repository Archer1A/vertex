import assert from 'node:assert/strict'
import { productionOrderInstances, getObjectTypeById, PRODUCTION_ORDER_OBJECT_TYPE_ID } from '../src/mock/mock.ts'

const ot = getObjectTypeById(PRODUCTION_ORDER_OBJECT_TYPE_ID)
assert(ot, 'ProductionOrder ObjectType missing')

const tsProps = ot.properties.filter((p) => p.baseType === 'timeseries')
assert(tsProps.length >= 2, 'Expected >=2 timeseries properties on ProductionOrder')

for (const inst of productionOrderInstances) {
  const props = inst.properties ?? {}
  for (const p of tsProps) {
    const v = props[p.apiName] ?? props[p.id]
    assert(v && typeof v === 'object', `Missing timeseries value for ${inst.id}:${p.apiName}`)
    assert(Array.isArray(v.points), `Timeseries points missing for ${inst.id}:${p.apiName}`)
    assert(v.points.length > 0, `Timeseries points empty for ${inst.id}:${p.apiName}`)
  }
}

console.log('timeseriesMock.test: OK')
