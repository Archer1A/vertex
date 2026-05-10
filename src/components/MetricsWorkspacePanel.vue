<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  BadgeDollarSign,
  BarChart3,
  ChartArea,
  CirclePlus,
  Plus,
  Save,
  Table2,
  TrendingUp,
  X
} from 'lucide-vue-next'
import type { ObjectType, PropertyType } from '../mock/mock'
import type { GraphNodeData } from '../types/graph'

const props = defineProps<{
  node: GraphNodeData
  objectType: ObjectType
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

type MetricCard = {
  id: string
  title: string
  value: string
  delta: string
  chartType: 'line' | 'bar'
}

type DetailRow = {
  metricName: string
  date: string
  dimension: string
  value: string
  note: string
}

const metricCards: MetricCard[] = [
  { id: 'sales', title: '指标A：销售额', value: '¥128,000', delta: '↑ 12.5%', chartType: 'line' },
  { id: 'orders', title: '指标B：订单量', value: '2,381', delta: '↑ 8.2%', chartType: 'bar' },
  { id: 'conversion', title: '指标C：转化率', value: '3.42%', delta: '↑ 0.6%', chartType: 'line' }
]

const detailRows: DetailRow[] = [
  { metricName: '销售额', date: '2026-04-01', dimension: '华东', value: '¥32,000', note: '--' },
  { metricName: '销售额', date: '2026-04-02', dimension: '华北', value: '¥41,000', note: '--' },
  { metricName: '销售额', date: '2026-04-03', dimension: '华南', value: '¥55,000', note: '--' },
  { metricName: '订单量', date: '2026-04-01', dimension: 'App', value: '812', note: '--' },
  { metricName: '转化率', date: '2026-04-01', dimension: '官网', value: '3.42%', note: '--' }
]

const isCreateMode = ref(false)
const metricName = ref('')
const selectedMeasure = ref('')
const selectedDimension = ref('')
const aggregation = ref('sum')
const timeGrain = ref('day')
const sortOrder = ref('default')
const displayType = ref('line')

const measureOptions = computed(() => props.objectType.properties.filter((property) => property.baseType === 'number'))

const dimensionOptions = computed(() =>
  props.objectType.properties.filter((property) => {
    return ['string', 'enum', 'date', 'datetime'].includes(property.baseType)
  })
)

const headerTitle = computed(() => props.node.label)
const headerSubtitle = computed(() => props.objectType.displayName)

function openCreateMode() {
  isCreateMode.value = true
  selectedMeasure.value = measureOptions.value[0]?.apiName ?? ''
  selectedDimension.value = dimensionOptions.value[0]?.apiName ?? ''
  console.log('new metric clicked', props.node.id)
}

function cancelCreate() {
  isCreateMode.value = false
  console.log('cancel metric create')
}

function addCondition() {
  console.log('add metric condition')
}

function saveMetric() {
  const payload = {
    nodeId: props.node.id,
    objectTypeId: props.objectType.id,
    metricName: metricName.value,
    measure: selectedMeasure.value,
    dimension: selectedDimension.value,
    aggregation: aggregation.value,
    timeGrain: timeGrain.value,
    sortOrder: sortOrder.value,
    displayType: displayType.value
  }

  console.log('save metric', payload)
}

function propertyLabel(property: PropertyType) {
  return `${property.displayName} (${property.apiName})`
}

watch(
  () => props.node.id,
  () => {
    isCreateMode.value = false
    metricName.value = ''
    selectedMeasure.value = ''
    selectedDimension.value = ''
    aggregation.value = 'sum'
    timeGrain.value = 'day'
    sortOrder.value = 'default'
    displayType.value = 'line'
  }
)
</script>

<template>
  <aside class="metrics-workspace" aria-label="Node metrics workspace" @click.stop>
    <header class="metrics-workspace__header">
      <div class="metrics-workspace__title">
        <span class="metrics-workspace__badge">
          <TrendingUp :size="14" />
          Metrics
        </span>
        <div>
          <h2>{{ headerTitle }}</h2>
          <p>{{ headerSubtitle }}</p>
        </div>
      </div>
      <button class="metrics-workspace__close" type="button" aria-label="Close metrics workspace" @click="emit('close')">
        <X :size="16" />
      </button>
    </header>

    <div class="metrics-workspace__body" :class="{ 'metrics-workspace__body--create': isCreateMode }">
      <section class="metrics-workspace__content" aria-label="Metrics overview">
        <div class="metrics-cards" aria-label="Metric cards">
          <article v-for="card in metricCards" :key="card.id" class="metric-card">
            <div class="metric-card__header">
              <span>{{ card.title }}</span>
              <BadgeDollarSign v-if="card.id === 'sales'" :size="16" />
              <BarChart3 v-else :size="16" />
            </div>
            <strong>当前值：{{ card.value }}</strong>
            <small>环比：{{ card.delta }}</small>
            <div class="metric-card__chart" :class="`metric-card__chart--${card.chartType}`" aria-hidden="true">
              <svg v-if="card.chartType === 'line'" viewBox="0 0 160 56" preserveAspectRatio="none">
                <polyline points="4,44 28,22 54,34 82,16 112,30 154,10" />
              </svg>
              <span v-else v-for="height in [28, 44, 22, 36, 52, 30]" :key="height" :style="{ height: `${height}px` }"></span>
            </div>
            <span class="metric-card__caption">{{ card.chartType === 'line' ? '折线图预览' : '柱状图预览' }}</span>
          </article>

          <button class="metric-card metric-card--new" type="button" @click="openCreateMode">
            <Plus :size="28" />
            <strong>新增指标</strong>
            <span>点击后打开右侧创建指标面板</span>
          </button>
        </div>

        <div class="metrics-divider"></div>

        <section class="metrics-table-section" aria-label="Metric detail rows">
          <div class="metrics-table-section__title">
            <Table2 :size="16" />
            <h3>数据明细列表</h3>
          </div>

          <div class="metrics-table-wrap">
            <table class="metrics-table">
              <thead>
                <tr>
                  <th>指标名称</th>
                  <th>日期</th>
                  <th>维度</th>
                  <th>数值</th>
                  <th>备注</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in detailRows" :key="`${row.metricName}-${row.date}-${row.dimension}`">
                  <td>{{ row.metricName }}</td>
                  <td>{{ row.date }}</td>
                  <td>{{ row.dimension }}</td>
                  <td>{{ row.value }}</td>
                  <td>{{ row.note }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="metrics-pagination" aria-label="Pagination">
            <button type="button">‹‹ 上一页</button>
            <button v-for="page in [1, 2, 3, 4, 5]" :key="page" type="button" :class="{ active: page === 1 }">
              {{ page }}
            </button>
            <button type="button">下一页 ››</button>
          </div>
        </section>
      </section>

      <aside v-if="isCreateMode" class="metric-create-panel" aria-label="Create metric">
        <header class="metric-create-panel__header">
          <ChartArea :size="18" />
          <h3>创建指标</h3>
        </header>

        <label class="metric-field">
          <span>指标名称：</span>
          <input v-model="metricName" type="text" placeholder="输入指标名称" />
        </label>

        <label class="metric-field">
          <span>度量：</span>
          <select v-model="selectedMeasure">
            <option value="" disabled>选择字段</option>
            <option v-for="property in measureOptions" :key="property.id" :value="property.apiName">
              {{ propertyLabel(property) }}
            </option>
          </select>
          <small>例如：销售额 / 订单数 / 用户数</small>
        </label>

        <label class="metric-field">
          <span>维度：</span>
          <select v-model="selectedDimension">
            <option value="" disabled>选择维度</option>
            <option v-for="property in dimensionOptions" :key="property.id" :value="property.apiName">
              {{ propertyLabel(property) }}
            </option>
          </select>
          <small>例如：日期 / 地区 / 渠道</small>
        </label>

        <label class="metric-field">
          <span>聚合方法：</span>
          <select v-model="aggregation">
            <option value="sum">求和</option>
            <option value="average">平均</option>
            <option value="max">最大</option>
            <option value="min">最小</option>
          </select>
          <small>可选：求和 / 平均 / 最大 / 最小</small>
        </label>

        <label class="metric-field">
          <span>时间粒度：</span>
          <select v-model="timeGrain">
            <option value="day">按天</option>
            <option value="week">按周</option>
            <option value="month">按月</option>
          </select>
          <small>可选：按天 / 按周 / 按月</small>
        </label>

        <div class="metric-field">
          <span>过滤条件：</span>
          <button class="metric-add-condition" type="button" @click="addCondition">
            <CirclePlus :size="16" />
            添加条件
          </button>
        </div>

        <label class="metric-field">
          <span>排序方式：</span>
          <select v-model="sortOrder">
            <option value="default">默认</option>
            <option value="ascending">升序</option>
            <option value="descending">降序</option>
          </select>
        </label>

        <fieldset class="metric-display-options">
          <legend>展示方式：</legend>
          <label><input v-model="displayType" type="radio" value="line" /> 折线图</label>
          <label><input v-model="displayType" type="radio" value="bar" /> 柱状图</label>
          <label><input v-model="displayType" type="radio" value="area" /> 面积图</label>
          <label><input v-model="displayType" type="radio" value="value" /> 数值卡</label>
        </fieldset>

        <footer class="metric-create-panel__actions">
          <button type="button" @click="cancelCreate">取消</button>
          <button class="metric-create-panel__save" type="button" @click="saveMetric">
            <Save :size="15" />
            保存指标
          </button>
        </footer>
      </aside>
    </div>
  </aside>
</template>
