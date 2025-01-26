<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import RSIChart from './components/RSIChart.vue'
import BreezeLogin from './components/BreezeLogin.vue'

const currentYear = computed(() => new Date().getFullYear())

const isLoggedIn = ref(false)
const showResults = ref(false)

// Form data
const stockSymbol = ref('')
const startDate = ref('')
const endDate = ref('')
const isLoading = ref(false)

// Stock data
const stockData = ref({
  rsi: 65.4,
  sma20: 156.78,
  ema50: 152.34,
  macd: 2.45,
  volume: '1.2M'
})

// Chart data with proper typing
interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
  }[]
}

const chartData = ref<ChartData>({
  labels: [],
  datasets: [{
    label: 'RSI',
    data: [],
    borderColor: '#2c3e50',
    backgroundColor: 'rgba(44, 62, 80, 0.1)',
  }]
})

const calculateRSI = (prices: number[]) => {
  const periods = 14
  const gains = []
  const losses = []
  
  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1]
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? Math.abs(change) : 0)
  }
  
  // Calculate average gains and losses
  const avgGain = gains.slice(0, periods).reduce((a, b) => a + b) / periods
  const avgLoss = losses.slice(0, periods).reduce((a, b) => a + b) / periods
  
  // Calculate RS and RSI
  const rs = avgGain / avgLoss
  const rsi = 100 - (100 / (1 + rs))
  
  return Math.round(rsi * 100) / 100
}

const handleAnalyze = async () => {
  isLoading.value = true
  try {
    // Using Yahoo Finance API (you'll need to sign up for an API key)
    const API_KEY = 'YOUR_YAHOO_FINANCE_API_KEY'
    const response = await axios.get(`https://yfapi.net/v8/finance/chart/${stockSymbol.value}`, {
      params: {
        range: '6mo',
        interval: '1mo',
        events: 'history'
      },
      headers: {
        'x-api-key': API_KEY
      }
    })

    // Process the data
    const timestamps = response.data.chart.result[0].timestamp
    const prices = response.data.chart.result[0].indicators.quote[0].close

    // Calculate RSI for each month
    const monthlyRSI = []
    const labels = []

    for (let i = 0; i < timestamps.length; i++) {
      const date = new Date(timestamps[i] * 1000)
      labels.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }))
      
      // Calculate RSI using previous 14 periods
      if (i >= 14) {
        const periodPrices = prices.slice(i - 14, i + 1)
        monthlyRSI.push(calculateRSI(periodPrices))
      }
    }

    // Update chart data with proper typing
    chartData.value = {
      labels: labels.slice(14),
      datasets: [{
        label: 'RSI',
        data: monthlyRSI,
        borderColor: '#2c3e50',
        backgroundColor: 'rgba(44, 62, 80, 0.1)',
      }]
    }

    // Update current RSI value
    stockData.value.rsi = monthlyRSI[monthlyRSI.length - 1]
    showResults.value = true

  } catch (error) {
    console.error('Error fetching stock data:', error)
    alert('Error fetching stock data. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const handleLoginSuccess = () => {
  isLoggedIn.value = true
}
</script>

<template>
  <div class="app">
    <header>
      <h1>Algo Trading Dashboard</h1>
    </header>

    <main class="content">
      <BreezeLogin 
        v-if="!isLoggedIn" 
        @login-success="handleLoginSuccess" 
      />

      <div v-else>
        <section class="input-section">
          <h2>Stock Analysis Tool</h2>
          <form @submit.prevent="handleAnalyze" class="analysis-form">
            <div class="form-group">
              <label for="stock">Stock Symbol</label>
              <input 
                id="stock"
                v-model="stockSymbol"
                type="text"
                placeholder="e.g., AAPL"
                required
              >
            </div>

            <div class="form-group">
              <label for="startDate">Start Date</label>
              <input 
                id="startDate"
                v-model="startDate"
                type="date"
                required
              >
            </div>

            <div class="form-group">
              <label for="endDate">End Date</label>
              <input 
                id="endDate"
                v-model="endDate"
                type="date"
                required
              >
            </div>

            <button type="submit" :disabled="isLoading">
              {{ isLoading ? 'Analyzing...' : 'Analyze Stock' }}
            </button>
          </form>
        </section>

        <section v-if="showResults" class="results-section">
          <h3>Analysis Results for {{ stockSymbol }}</h3>
          <div class="chart-section">
            <RSIChart :chart-data="chartData" />
          </div>
          <div class="indicators-grid">
            <div class="indicator-card">
              <h4>RSI</h4>
              <p :class="{ 'overbought': stockData.rsi > 70, 'oversold': stockData.rsi < 30 }">
                {{ stockData.rsi }}
              </p>
            </div>
            <div class="indicator-card">
              <h4>20-Day SMA</h4>
              <p>${{ stockData.sma20 }}</p>
            </div>
            <div class="indicator-card">
              <h4>50-Day EMA</h4>
              <p>${{ stockData.ema50 }}</p>
            </div>
            <div class="indicator-card">
              <h4>MACD</h4>
              <p>{{ stockData.macd }}</p>
            </div>
            <div class="indicator-card">
              <h4>Volume</h4>
              <p>{{ stockData.volume }}</p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <footer>
      <p>&copy; {{ currentYear }} Algo Trading App</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
}

header {
  padding: 1.5rem;
  background-color: #2c3e50;
  color: white;
}

h1 {
  margin: 0;
  font-size: 1.8rem;
}

.content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.input-section {
  background-color: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.analysis-form {
  display: grid;
  gap: 1.5rem;
  max-width: 600px;
  margin: 2rem auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  color: #2c3e50;
}

input {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  padding: 1rem;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #34495e;
}

button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.results-section {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.indicators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.indicator-card {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 6px;
  text-align: center;
}

.indicator-card h4 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.indicator-card p {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #2c3e50;
}

.overbought {
  color: #e74c3c !important;
}

.oversold {
  color: #27ae60 !important;
}

footer {
  padding: 1.5rem;
  background-color: #2c3e50;
  text-align: center;
  color: white;
}

@media (max-width: 768px) {
  .content {
    padding: 1rem;
  }
  
  .indicators-grid {
    grid-template-columns: 1fr;
  }
}

.chart-section {
  margin: 2rem 0;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
