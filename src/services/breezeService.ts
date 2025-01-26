import BreezeConnect from 'breezeconnect'

class BreezeService {
  private breeze: BreezeConnect
  private isInitialized = false

  constructor() {
    this.breeze = new BreezeConnect({
      appKey: import.meta.env.VITE_BREEZE_APP_KEY
    })
  }

  async generateSession(apiSecret: string, sessionToken: string) {
    try {
      await this.breeze.generateSession(apiSecret, sessionToken)
      this.isInitialized = true
      return true
    } catch (error) {
      console.error('Failed to generate session:', error)
      throw error
    }
  }

  async getCustomerDetails() {
    if (!this.isInitialized) {
      throw new Error('Breeze service not initialized')
    }
    return await this.breeze.getCustomerDetails()
  }

  async getFunds() {
    if (!this.isInitialized) {
      throw new Error('Breeze service not initialized')
    }
    return await this.breeze.getFunds()
  }
}

export const breezeService = new BreezeService() 