# VelvetLog Collaboration Guide

## 🚀 Getting Started with Team Development

### Project Setup for New Collaborators

1. **Fork or Clone the Repository**
   ```bash
   git clone https://github.com/your-org/velvetlog.git
   cd velvetlog
   ```

2. **Environment Setup**
   ```bash
   # Install dependencies
   npm install
   
   # Copy environment template
   cp .env.example .env.local
   
   # Start development server
   npm run dev
   ```

3. **Database Setup**
   ```bash
   # Push schema to database
   npm run db:push
   
   # Optional: Seed test data
   npm run db:seed
   ```

## 👥 Collaboration Workflow

### Replit Multiplayer Features

- **Real-time Editing**: Multiple developers can edit the same file simultaneously
- **Shared Terminal**: All team members can access the same terminal session
- **Live Debugging**: Collaborative debugging with shared breakpoints
- **Instant Sync**: Changes are synchronized across all collaborators in real-time

### Branch Strategy

```
main (production)
├── staging (pre-production testing)
├── develop (integration branch)
├── feature/user-auth
├── feature/smart-reminders
├── feature/privacy-dashboard
└── hotfix/security-patch
```

### Code Review Process

1. **Feature Development**
   - Create feature branch from `develop`
   - Implement feature with tests
   - Submit PR to `develop` branch

2. **Review Requirements**
   - ✅ Security review (for auth/encryption changes)
   - ✅ Privacy impact assessment
   - ✅ Performance testing
   - ✅ Mobile responsiveness check
   - ✅ Accessibility compliance

3. **Deployment Pipeline**
   - `develop` → `staging` (automated)
   - `staging` → `main` (manual approval)
   - `main` → production (automated)

## 🔒 Security Guidelines for Collaborators

### Secret Management

```bash
# Never commit secrets to version control
echo "*.env*" >> .gitignore
echo ".env.local" >> .gitignore
echo "secrets.json" >> .gitignore

# Use Replit Secrets for sensitive data
# Access via process.env.SECRET_NAME
```

### Required Secrets

```env
# Authentication
SESSION_SECRET=your_session_secret_here
MASTER_ENCRYPTION_KEY=your_master_key_here

# Database
DATABASE_URL=your_database_connection_string

# Optional Services
SENTRY_DSN=your_sentry_dsn
ANALYTICS_KEY=your_analytics_key
```

### Security Checklist

- [ ] All secrets stored in Replit Secrets (not .env files)
- [ ] No sensitive data in code comments
- [ ] Authentication middleware on protected routes
- [ ] Input validation on all API endpoints
- [ ] Encryption for sensitive data storage
- [ ] HTTPS enforcement in production

## 🛠️ Development Standards

### Code Style

```javascript
// Use TypeScript for type safety
interface Contact {
  id: number;
  name: string;
  tags: string[];
}

// Follow naming conventions
const getUserContacts = async (userId: string): Promise<Contact[]> => {
  // Implementation
};

// Document complex functions
/**
 * Encrypts contact data before storage
 * @param data - Raw contact information
 * @param key - User's encryption key
 * @returns Encrypted data object
 */
```

### Testing Requirements

```bash
# Unit tests for utilities
npm run test:unit

# Integration tests for API
npm run test:api

# E2E tests for critical flows
npm run test:e2e

# Security tests
npm run test:security
```

### Performance Guidelines

- 📱 Mobile-first responsive design
- ⚡ Page load time < 2 seconds
- 🔄 API response time < 200ms
- 💾 Optimize bundle size < 500KB
- 🖼️ Lazy load images and components

## 📁 Project Structure

```
velvetlog/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── types/          # TypeScript definitions
├── server/                 # Express backend
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   ├── auth.ts             # Authentication logic
│   ├── encryption.ts       # Security utilities
│   └── mfa.ts              # Multi-factor auth
├── shared/                 # Shared code
│   └── schema.ts           # Database schema
├── docs/                   # Documentation
├── tests/                  # Test files
└── scripts/                # Build/deployment scripts
```

## 🚀 Deployment Process

### Development Environment

```bash
# Start development server
npm run dev

# Access at: https://your-repl-name.your-username.repl.co
```

### Staging Environment

```bash
# Deploy to staging
git push origin staging

# Staging URL: https://velvetlog-staging.replit.app
```

### Production Deployment

```bash
# Create production build
npm run build

# Deploy to production
npm run deploy

# Production URL: https://velvetlog.replit.app
```

## 🔧 Common Development Tasks

### Adding New Features

1. **Create Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/new-feature-name
   ```

2. **Database Changes**
   ```bash
   # Update schema in shared/schema.ts
   # Push changes to database
   npm run db:push
   ```

3. **API Development**
   ```bash
   # Add routes in server/routes.ts
   # Add storage methods in server/storage.ts
   # Add validation schemas
   ```

4. **Frontend Development**
   ```bash
   # Create components in client/src/components/
   # Add pages in client/src/pages/
   # Update routing in client/src/App.tsx
   ```

### Debugging in Replit

```javascript
// Use console.log for quick debugging
console.log('Debug info:', { userId, contactId });

// Use Replit debugger for complex issues
// Set breakpoints in the editor
// Use the Variables panel to inspect state

// Enable detailed logging
process.env.LOG_LEVEL = 'debug';
```

### Testing Changes

```bash
# Run all tests
npm test

# Run specific test file
npm test -- contact.test.ts

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📊 Monitoring and Analytics

### Performance Monitoring

```javascript
// Add performance tracking
const startTime = performance.now();
// ... operation
const endTime = performance.now();
console.log(`Operation took ${endTime - startTime}ms`);
```

### Error Tracking

```javascript
// Use structured error handling
try {
  await riskyOperation();
} catch (error) {
  console.error('Operation failed:', {
    error: error.message,
    userId,
    timestamp: new Date().toISOString()
  });
}
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database status
   npm run db:status
   
   # Reset database
   npm run db:reset
   ```

2. **Authentication Problems**
   ```bash
   # Clear session data
   # Check SESSION_SECRET environment variable
   # Verify encryption keys
   ```

3. **Build Failures**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Check TypeScript errors
   npm run type-check
   ```

### Getting Help

- 💬 Use Replit's built-in chat for real-time collaboration
- 📝 Create detailed GitHub issues for bugs
- 📖 Check documentation in `/docs` folder
- 🔍 Search existing issues before creating new ones

## 📝 Documentation Standards

### Code Documentation

```typescript
/**
 * Encrypts sensitive contact data before database storage
 * 
 * @param contactData - Raw contact information
 * @param userKey - User's encryption key
 * @returns Promise resolving to encrypted contact object
 * 
 * @example
 * ```typescript
 * const encrypted = await encryptContactData(
 *   { name: "John", email: "john@example.com" },
 *   userEncryptionKey
 * );
 * ```
 */
async function encryptContactData(
  contactData: ContactData, 
  userKey: string
): Promise<EncryptedContact> {
  // Implementation
}
```

### API Documentation

```typescript
/**
 * @route POST /api/contacts
 * @desc Create a new contact
 * @access Private (requires authentication)
 * @body {InsertContact} contact - Contact data
 * @returns {Contact} Created contact
 * @throws {400} Invalid input data
 * @throws {401} Unauthorized
 * @throws {500} Server error
 */
```

This collaboration guide ensures secure, efficient teamwork while maintaining VelvetLog's privacy-first approach and code quality standards.