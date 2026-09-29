<script setup lang="ts">
import { computed } from 'vue'
import { NDataTable as NativeDataTable } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

defineOptions({ name: 'SortableDataTable', inheritAttrs: false })

const props = defineProps<{
  columns: DataTableColumns<any>
  data?: Record<string, unknown>[]
}>()

const nonSortableKeys = new Set(['action', 'actions', 'operation', 'operations', 'operate', 'select', 'checkbox', 'expand'])

function numericValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return null
  const normalized = value.trim().replace(/[￥¥$,，\s]/g, '').replace(/%$/, '')
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function dateValue(value: unknown): number | null {
  if (typeof value !== 'string' || !/(?:\d{4}[-/.年]\d{1,2}[-/.月]\d{1,2})/.test(value)) return null
  const parsed = Date.parse(value.replace(/[年月]/g, '-').replace(/日/, ''))
  return Number.isFinite(parsed) ? parsed : null
}

function compare(left: unknown, right: unknown): number {
  if (left == null) return right == null ? 0 : 1
  if (right == null) return -1
  if (typeof left === 'boolean' && typeof right === 'boolean') return Number(left) - Number(right)

  const leftNumber = numericValue(left)
  const rightNumber = numericValue(right)
  if (leftNumber !== null && rightNumber !== null) return leftNumber - rightNumber

  const leftDate = dateValue(left)
  const rightDate = dateValue(right)
  if (leftDate !== null && rightDate !== null) return leftDate - rightDate

  return String(left).localeCompare(String(right), 'zh-CN', { numeric: true, sensitivity: 'base' })
}

function getValue(row: Record<string, unknown>, key: string): unknown {
  if (key in row) return row[key]
  return key.split('.').reduce<unknown>((value, segment) => {
    if (!value || typeof value !== 'object') return undefined
    return (value as Record<string, unknown>)[segment]
  }, row)
}

const sortableColumns = computed(() => props.columns.map((column) => {
  if (!column || typeof column !== 'object' || column.type || column.sorter || column.key == null) return column

  const key = String(column.key)
  const title = typeof column.title === 'string' ? column.title.trim() : ''
  if (nonSortableKeys.has(key.toLowerCase()) || /^(操作|动作)$/.test(title)) return column
  if (props.data?.length && !props.data.some((row) => getValue(row, key) !== undefined)) return column

  return {
    ...column,
    sorter: (rowA: Record<string, unknown>, rowB: Record<string, unknown>) => compare(getValue(rowA, key), getValue(rowB, key)),
  }
}))
</script>

<template>
  <NativeDataTable v-bind="$attrs" :data="props.data" :columns="sortableColumns">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </NativeDataTable>
</template>
