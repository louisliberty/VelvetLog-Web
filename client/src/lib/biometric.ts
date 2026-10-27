// Biometric authentication utilities
export class BiometricAuth {
  /**
   * Check if biometric authentication is available
   */
  static async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    try {
      return !!(
        'navigator' in window &&
        'credentials' in navigator &&
        'create' in navigator.credentials &&
        typeof PublicKeyCredential !== 'undefined' &&
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      );
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Register biometric credentials
   */
  static async register(userId: string, userName: string): Promise<PublicKeyCredential> {
    if (!await this.isAvailable()) {
      throw new Error('Biometric authentication not available');
    }

    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: "VelvetLog",
        id: window.location.hostname,
      },
      user: {
        id: new TextEncoder().encode(userId),
        name: userName,
        displayName: userName,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" }, // ES256
        { alg: -257, type: "public-key" } // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred"
      },
      timeout: 60000,
      attestation: "direct"
    };

    try {
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to create biometric credential');
      }

      return credential;
    } catch (error) {
      console.error('Biometric registration failed:', error);
      throw new Error('Biometric registration failed');
    }
  }

  /**
   * Authenticate using biometric credentials
   */
  static async authenticate(allowCredentials?: PublicKeyCredentialDescriptor[]): Promise<PublicKeyCredential> {
    if (!await this.isAvailable()) {
      throw new Error('Biometric authentication not available');
    }

    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      allowCredentials: allowCredentials || [],
      userVerification: 'required',
      timeout: 60000,
    };

    try {
      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Biometric authentication failed');
      }

      return credential;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      throw new Error('Biometric authentication failed');
    }
  }

  /**
   * Get stored credentials for this origin
   */
  static async getStoredCredentials(): Promise<PublicKeyCredentialDescriptor[]> {
    try {
      // This is a simplified version - in practice you'd retrieve from your backend
      const storedCredentialIds = localStorage.getItem('velvetlog_biometric_credentials');
      if (!storedCredentialIds) return [];

      const credentialIds = JSON.parse(storedCredentialIds);
      return credentialIds.map((id: string) => ({
        type: 'public-key' as const,
        id: new TextEncoder().encode(id),
        transports: ['internal'] as AuthenticatorTransport[]
      }));
    } catch (error) {
      console.error('Error getting stored credentials:', error);
      return [];
    }
  }

  /**
   * Store credential ID for future authentication
   */
  static storeCredentialId(credentialId: string): void {
    try {
      const existing = localStorage.getItem('velvetlog_biometric_credentials');
      const credentials = existing ? JSON.parse(existing) : [];
      
      if (!credentials.includes(credentialId)) {
        credentials.push(credentialId);
        localStorage.setItem('velvetlog_biometric_credentials', JSON.stringify(credentials));
      }
    } catch (error) {
      console.error('Error storing credential ID:', error);
    }
  }

  /**
   * Remove stored credential
   */
  static removeCredentialId(credentialId: string): void {
    try {
      const existing = localStorage.getItem('velvetlog_biometric_credentials');
      if (!existing) return;

      const credentials = JSON.parse(existing);
      const filtered = credentials.filter((id: string) => id !== credentialId);
      localStorage.setItem('velvetlog_biometric_credentials', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing credential ID:', error);
    }
  }
}