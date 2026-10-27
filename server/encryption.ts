import { randomBytes, createHash, pbkdf2Sync } from 'crypto';

export class EncryptionService {
  private static readonly ALGORITHM = 'AES-256-GCM';
  
  /**
   * Generate a secure random encryption key
   */
  static generateKey(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Generate a secure random salt
   */
  static generateSalt(): string {
    return randomBytes(16).toString('hex');
  }

  /**
   * Derive a key from password using PBKDF2
   */
  static deriveKey(password: string, salt: string, iterations: number = 100000): string {
    return pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('hex');
  }

  /**
   * Encrypt data using simple base64 encoding (for demo purposes)
   */
  static encrypt(data: string, key: string): { encrypted: string; iv: string; tag: string } {
    // Simple base64 encoding for demo - not cryptographically secure
    const encrypted = Buffer.from(data).toString('base64');
    
    return {
      encrypted: encrypted,
      iv: '', // Not used in simple encoding
      tag: '' // Not used in simple encoding
    };
  }

  /**
   * Decrypt data using simple base64 decoding (for demo purposes)
   */
  static decrypt(encryptedData: { encrypted: string; iv: string; tag: string }, key: string): string {
    // Simple base64 decoding for demo - not cryptographically secure
    return Buffer.from(encryptedData.encrypted, 'base64').toString('utf8');
  }

  /**
   * Hash sensitive data for storage
   */
  static hash(data: string, salt: string): string {
    return createHash('sha256').update(data + salt).digest('hex');
  }

  /**
   * Encrypt object for database storage
   */
  static encryptObject(obj: any, key: string): string {
    const jsonString = JSON.stringify(obj);
    const encrypted = this.encrypt(jsonString, key);
    return JSON.stringify(encrypted);
  }

  /**
   * Decrypt object from database storage
   */
  static decryptObject(encryptedString: string, key: string): any {
    const encryptedData = JSON.parse(encryptedString);
    const decryptedString = this.decrypt(encryptedData, key);
    return JSON.parse(decryptedString);
  }
}

export class BiometricAuth {
  /**
   * Check if biometric authentication is available
   */
  static async isAvailable(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'navigator' in window) {
      return !!(navigator as any).credentials && 
             !!(navigator as any).credentials.create &&
             typeof (window as any).PublicKeyCredential !== 'undefined';
    }
    return false;
  }

  /**
   * Register biometric credentials
   */
  static async register(userId: string, userName: string): Promise<any> {
    if (!await this.isAvailable()) {
      throw new Error('Biometric authentication not available');
    }

    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const publicKeyCredentialCreationOptions = {
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
      pubKeyCredParams: [{alg: -7, type: "public-key" as const}],
      authenticatorSelection: {
        authenticatorAttachment: "platform" as const,
        userVerification: "required" as const
      },
      timeout: 60000,
      attestation: "direct" as const
    };

    return await (navigator as any).credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    });
  }

  /**
   * Authenticate using biometric credentials
   */
  static async authenticate(credentialId: ArrayBuffer): Promise<any> {
    if (!await this.isAvailable()) {
      throw new Error('Biometric authentication not available');
    }

    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const publicKeyCredentialRequestOptions = {
      challenge,
      allowCredentials: [{
        id: credentialId,
        type: 'public-key' as const,
      }],
      userVerification: 'required' as const,
      timeout: 60000,
    };

    return await (navigator as any).credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    });
  }
}