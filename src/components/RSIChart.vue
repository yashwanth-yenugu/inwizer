<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

defineProps<{
  chartData: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
    }[]
  }
}>()

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'RSI Over Time'
    }
  },
  scales: {
    y: {
      min: 0,
      max: 100,
      grid: {
        color: '#f0f0f0'
      }
    }
  }
}
</script>

<template>
  <div class="chart-container">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-container {
  height: 400px;
  width: 100%;
}
</style> 