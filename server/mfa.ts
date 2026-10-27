import { randomBytes } from 'crypto';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

export interface MFASetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export class MFAService {
  /**
   * Generate TOTP secret and QR code for setup
   */
  static async generateTOTPSetup(userId: string, email: string): Promise<MFASetup> {
    const serviceName = 'VelvetLog';
    const secret = speakeasy.generateSecret({
      name: email,
      issuer: serviceName,
      length: 32
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
    const backupCodes = this.generateBackupCodes();

    return {
      secret: secret.base32!,
      qrCodeUrl,
      backupCodes
    };
  }

  /**
   * Verify TOTP token
   */
  static verifyTOTP(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1 // Allow 1 time step tolerance
    });
  }

  /**
   * Generate backup recovery codes
   */
  static generateBackupCodes(count: number = 8): string[] {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = randomBytes(4).toString('hex').toUpperCase();
      const formatted = `${code.slice(0, 4)}-${code.slice(4, 8)}`;
      codes.push(formatted);
    }
    return codes;
  }

  /**
   * Verify backup code
   */
  static verifyBackupCode(code: string, storedCodes: string[]): boolean {
    return storedCodes.includes(code.toUpperCase().replace(/\s/g, ''));
  }

  /**
   * Generate SMS token (6-digit numeric)
   */
  static generateSMSToken(): string {
    const token = Math.floor(100000 + Math.random() * 900000);
    return token.toString();
  }

  /**
   * Verify SMS token with time window
   */
  static verifySMSToken(
    provided: string, 
    stored: string, 
    generatedAt: Date, 
    windowMinutes: number = 5
  ): boolean {
    const now = new Date();
    const elapsed = (now.getTime() - generatedAt.getTime()) / (1000 * 60);
    
    return provided === stored && elapsed <= windowMinutes;
  }

  /**
   * Generate app-specific password for API access
   */
  static generateAppPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password.match(/.{1,4}/g)?.join('-') || password;
  }
}

export interface MFAConfig {
  totpEnabled: boolean;
  smsEnabled: boolean;
  backupCodesEnabled: boolean;
  requireForSensitive: boolean;
  rememberDevice: boolean;
  deviceTrustDays: number;
}

export const defaultMFAConfig: MFAConfig = {
  totpEnabled: false,
  smsEnabled: false,
  backupCodesEnabled: true,
  requireForSensitive: true,
  rememberDevice: true,
  deviceTrustDays: 30
};

/**
 * MFA middleware for protecting sensitive routes
 */
export const requireMFA = (config: Partial<MFAConfig> = {}) => {
  const finalConfig = { ...defaultMFAConfig, ...config };
  
  return async (req: any, res: any, next: any) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user has MFA enabled
    const mfaEnabled = user.totpSecret || user.smsNumber;
    if (!mfaEnabled) {
      // If MFA is required but not set up, prompt for setup
      return res.status(403).json({ 
        message: 'MFA setup required',
        requireMFASetup: true 
      });
    }

    // Check if device is trusted (optional)
    if (finalConfig.rememberDevice) {
      const deviceId = req.headers['x-device-id'];
      const trustedDevice = user.trustedDevices?.find(
        (device: any) => device.id === deviceId && 
        device.expiresAt > new Date()
      );
      
      if (trustedDevice) {
        return next();
      }
    }

    // Check for MFA token in request
    const mfaToken = req.headers['x-mfa-token'] || req.body.mfaToken;
    if (!mfaToken) {
      return res.status(403).json({ 
        message: 'MFA token required',
        requireMFA: true 
      });
    }

    // Verify MFA token
    let isValid = false;
    
    // Try TOTP first
    if (user.totpSecret) {
      isValid = MFAService.verifyTOTP(mfaToken, user.totpSecret);
    }
    
    // Try backup codes if TOTP fails
    if (!isValid && user.backupCodes) {
      isValid = MFAService.verifyBackupCode(mfaToken, user.backupCodes);
      
      // Mark backup code as used
      if (isValid) {
        user.backupCodes = user.backupCodes.filter(
          (code: string) => code !== mfaToken.toUpperCase().replace(/\s/g, '')
        );
        // Save updated backup codes to database
      }
    }

    if (!isValid) {
      return res.status(403).json({ message: 'Invalid MFA token' });
    }

    next();
  };
};