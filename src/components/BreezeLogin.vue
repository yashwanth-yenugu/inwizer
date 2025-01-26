<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { breezeService } from '../services/breezeService'

const apiSecret = ref('')
const sessionToken = ref('')
const error = ref('')
const isLoading = ref(false)

const emit = defineEmits<{
  (e: 'login-success'): void
}>()

const appLoginUrl = computed(() => 
  `https://api.icicidirect.com/apiuser/login?api_key=${import.meta.env.VITE_BREEZE_APP_KEY}`
)

// Add function to extract session token from URL
const extractSessionFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const apisession = urlParams.get('apisession')
  if (apisession) {
    sessionToken.value = apisession
    // Clean up the URL
    window.history.replaceState({}, document.title, window.location.pathname)
  }
}

// Check for session token on component mount
onMounted(() => {
  extractSessionFromUrl()
})

const handleLogin = async () => {
  if (!apiSecret.value || !sessionToken.value) {
    error.value = 'Please fill in all fields'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    await breezeService.generateSession(apiSecret.value, sessionToken.value)
    const customerDetails = await breezeService.getCustomerDetails()
    console.log('Logged in successfully:', customerDetails)
    emit('login-success')
  } catch (err) {
    error.value = 'Failed to login. Please check your credentials.'
    console.error('Login error:', err)
  } finally {
    isLoading.value = false
  }
}

const redirectToIciciLogin = () => {
  window.location.href = appLoginUrl.value
}
</script>

<template>
  <div class="login-container">
    <h2>Login to Breeze</h2>

    <!-- Show this when there's no session token -->
    <div v-if="!sessionToken" class="initial-login">
      <p>Click below to login with your ICICI Direct account</p>
      <button @click="redirectToIciciLogin" class="login-button">
        Login with ICICI Direct
      </button>
    </div>

    <!-- Show form only after getting session token -->
    <form v-else @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label for="apiSecret">API Secret</label>
        <input 
          id="apiSecret"
          v-model="apiSecret"
          type="password"
          placeholder="Enter your API secret"
          required
        />
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Logging in...' : 'Complete Login' }}
      </button>
    </form>

    <div v-if="!sessionToken" class="help-text">
      <p>To get started:</p>
      <ol>
        <li>Register your app at ICICI Direct Breeze API portal</li>
        <li>Get your App Key and Secret</li>
        <li>Click the login button above to connect your ICICI Direct account</li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.initial-login {
  text-align: center;
  margin: 2rem 0;
}

.login-button {
  font-size: 1.1rem;
  padding: 1rem 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.error-message {
  color: #e74c3c;
  margin: 0.5rem 0;
}

.help-text {
  margin-top: 2rem;
  font-size: 0.9rem;
  color: #666;
}

button {
  padding: 0.75rem;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #95a5a6;
}
</style> 