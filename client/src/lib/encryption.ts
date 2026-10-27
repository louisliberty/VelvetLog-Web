// Client-side encryption utilities
import CryptoJS from 'crypto-js';

export class ClientEncryption {
  /**
   * Encrypt data on client-side before sending to server
   */
  static encrypt(data: string, key: string): { encrypted: string; iv: string } {
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return {
      encrypted: encrypted.toString(),
      iv: iv.toString()
    };
  }

  /**
   * Decrypt data received from server
   */
  static decrypt(encryptedData: { encrypted: string; iv: string }, key: string): string {
    const decrypted = CryptoJS.AES.decrypt(encryptedData.encrypted, key, {
      iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Encrypt object for storage/transmission
   */
  static encryptObject(obj: any, key: string): string {
    const jsonString = JSON.stringify(obj);
    const encrypted = this.encrypt(jsonString, key);
    return JSON.stringify(encrypted);
  }

  /**
   * Decrypt object from storage/transmission
   */
  static decryptObject(encryptedString: string, key: string): any {
    const encryptedData = JSON.parse(encryptedString);
    const decryptedString = this.decrypt(encryptedData, key);
    return JSON.parse(decryptedString);
  }

  /**
   * Generate secure random key
   */
  static generateKey(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  /**
   * Derive key from password
   */
  static deriveKey(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 100000
    }).toString();
  }
}

export class LocalStorage {
  private static readonly STORAGE_KEY = 'velvetlog_secure_data';
  private static readonly KEY_STORAGE = 'velvetlog_user_key';

  /**
   * Store encrypted data locally
   */
  static store(key: string, data: any, userKey: string): void {
    try {
      const encrypted = ClientEncryption.encryptObject(data, userKey);
      const storageData = {
        [key]: encrypted,
        timestamp: Date.now()
      };
      
      const existingData = this.getStorageData();
      const updatedData = { ...existingData, ...storageData };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Failed to store data locally:', error);
    }
  }

  /**
   * Retrieve and decrypt data locally
   */
  static retrieve(key: string, userKey: string): any {
    try {
      const storageData = this.getStorageData();
      if (!storageData[key]) return null;

      return ClientEncryption.decryptObject(storageData[key], userKey);
    } catch (error) {
      console.error('Failed to retrieve data locally:', error);
      return null;
    }
  }

  /**
   * Store user encryption key securely (for biometric unlock)
   */
  static storeUserKey(userId: string, encryptionKey: string, deviceKey: string): void {
    try {
      const encrypted = ClientEncryption.encrypt(encryptionKey, deviceKey);
      const keyData = {
        [userId]: encrypted,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.KEY_STORAGE, JSON.stringify(keyData));
    } catch (error) {
      console.error('Failed to store user key:', error);
    }
  }

  /**
   * Retrieve user encryption key
   */
  static retrieveUserKey(userId: string, deviceKey: string): string | null {
    try {
      const keyDataString = localStorage.getItem(this.KEY_STORAGE);
      if (!keyDataString) return null;

      const keyData = JSON.parse(keyDataString);
      if (!keyData[userId]) return null;

      return ClientEncryption.decrypt(keyData[userId], deviceKey);
    } catch (error) {
      console.error('Failed to retrieve user key:', error);
      return null;
    }
  }

  /**
   * Clear all local data
   */
  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.KEY_STORAGE);
  }

  /**
   * Get raw storage data
   */
  private static getStorageData(): any {
    try {
      const dataString = localStorage.getItem(this.STORAGE_KEY);
      return dataString ? JSON.parse(dataString) : {};
    } catch (error) {
      console.error('Failed to parse storage data:', error);
      return {};
    }
  }

  /**
   * Get storage size in MB
   */
  static getStorageSize(): number {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY) || '';
      return new Blob([data]).size / (1024 * 1024); // Size in MB
    } catch (error) {
      return 0;
    }
  }
}