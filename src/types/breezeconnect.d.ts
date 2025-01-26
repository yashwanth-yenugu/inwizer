declare module 'breezeconnect' {
  interface BreezeConnect {
    generateSession(apiSecret: string, sessionToken: string): Promise<void>;
    getCustomerDetails(): Promise<any>;
    getFunds(): Promise<any>;
    // Add other required method declarations
  }

  interface BreezeConnectConfig {
    appKey: string;
  }

  const BreezeConnect: {
    new (config: BreezeConnectConfig): BreezeConnect;
  };
  
  export = BreezeConnect;
} 