import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { EncryptionService } from './encryption';

export interface LocalAuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    encryptionKey: string;
  };
}

export class LocalAuthService {
  /**
   * Register a new local user account
   */
  static async register(email: string, password: string, firstName?: string, lastName?: string, phone?: string) {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Validate password strength
    if (!this.validatePassword(password)) {
      throw new Error('Password does not meet security requirements');
    }

    // Generate salt and hash password
    const salt = EncryptionService.generateSalt();
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate user's encryption key (derived from password)
    const userEncryptionKey = EncryptionService.deriveKey(password, salt);
    
    // Encrypt the encryption key with a master key (stored encrypted)
    const masterKey = process.env.MASTER_ENCRYPTION_KEY || EncryptionService.generateKey();
    const encryptedUserKey = EncryptionService.encrypt(userEncryptionKey, masterKey);

    // Create user
    const userId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const user = await storage.createLocalUser({
      id: userId,
      email,
      firstName,
      lastName,
      phone,
      passwordHash,
      salt,
      encryptionKey: JSON.stringify(encryptedUserKey),
      isLocalAccount: true,
      privacySettings: {
        dataRetention: '5years',
        shareAnalytics: false,
        marketingEmails: false,
        securityNotifications: true
      },
      backupEnabled: false
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        profileImageUrl: user.profileImageUrl,
        subscriptionStatus: user.subscriptionStatus,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        hasSeenWelcome: user.hasSeenWelcome,
      },
      encryptionKey: userEncryptionKey
    };
  }

  /**
   * Authenticate local user
   */
  static async login(email: string, password: string) {
    console.log('🔧 LocalAuthService.login - looking up user by email:', email);
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      console.log('❌ User not found for email:', email);
      throw new Error('Invalid credentials');
    }
    
    console.log('🔧 User found:', { id: user.id, isLocalAccount: user.isLocalAccount, hasPasswordHash: !!user.passwordHash });
    
    if (!user.isLocalAccount) {
      console.log('❌ User is not a local account');
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash!);
    console.log('🔧 Password validation result:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Password mismatch');
      throw new Error('Invalid credentials');
    }

    // Decrypt user's encryption key
    const masterKey = process.env.MASTER_ENCRYPTION_KEY || EncryptionService.generateKey();
    const encryptedUserKey = JSON.parse(user.encryptionKey!);
    const userEncryptionKey = EncryptionService.decrypt(encryptedUserKey, masterKey);

    // Update last login
    await storage.updateUserLastLogin(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        profileImageUrl: user.profileImageUrl,
        subscriptionStatus: user.subscriptionStatus,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        hasSeenWelcome: user.hasSeenWelcome,
      },
      encryptionKey: userEncryptionKey
    };
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): boolean {
    // At least 12 characters, uppercase, lowercase, number, special char
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
  }

  /**
   * Register biometric authentication
   */
  static async registerBiometric(userId: string, credentialId: string) {
    await storage.updateUserBiometric(userId, credentialId);
  }

  /**
   * Authenticate with biometric
   */
  static async authenticateBiometric(credentialId: string) {
    const user = await storage.getUserByBiometric(credentialId);
    if (!user) {
      throw new Error('Invalid biometric credentials');
    }

    // Decrypt user's encryption key
    const masterKey = process.env.MASTER_ENCRYPTION_KEY || EncryptionService.generateKey();
    const encryptedUserKey = JSON.parse(user.encryptionKey!);
    const userEncryptionKey = EncryptionService.decrypt(encryptedUserKey, masterKey);

    // Update last login
    await storage.updateUserLastLogin(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        profileImageUrl: user.profileImageUrl,
        subscriptionStatus: user.subscriptionStatus,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        hasSeenWelcome: user.hasSeenWelcome,
      },
      encryptionKey: userEncryptionKey
    };
  }
}

/**
 * Middleware to authenticate local users
 */
export const authenticateLocal = async (req: LocalAuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // For demo purposes, using simple JWT-like structure
    // In production, use proper JWT with signing
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    if (!decoded.userId || !decoded.encryptionKey) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      encryptionKey: decoded.encryptionKey
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};