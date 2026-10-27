# Security Policy for VelvetLog

## 🔒 Security Overview

VelvetLog takes security seriously. This document outlines our security practices, vulnerability reporting process, and guidelines for secure development.

## 🛡️ Security Features

### Data Protection
- **End-to-End Encryption**: All sensitive data encrypted with AES-256
- **Zero-Knowledge Architecture**: Server cannot decrypt user data
- **Local-First Storage**: Data stored locally by default
- **Secure Key Management**: User-controlled encryption keys

### Authentication & Authorization
- **Strong Password Requirements**: 12+ characters, complexity enforcement
- **Multi-Factor Authentication**: TOTP with backup codes
- **Biometric Authentication**: Fingerprint/face recognition support
- **Session Security**: Secure cookies, auto-logout, session encryption

### Infrastructure Security
- **HTTPS Enforcement**: All traffic encrypted in transit
- **Database Encryption**: Data encrypted at rest
- **Input Validation**: All inputs sanitized and validated
- **SQL Injection Prevention**: Parameterized queries only

## 🚨 Reporting Security Vulnerabilities

If you discover a security vulnerability, please follow responsible disclosure:

### Contact Information
- **Email**: security@velvetlog.app
- **PGP Key**: [Public key for encrypted communication]
- **Response Time**: We aim to respond within 24 hours

### What to Include
1. **Vulnerability Description**: Clear explanation of the issue
2. **Steps to Reproduce**: Detailed reproduction steps
3. **Impact Assessment**: Potential security impact
4. **Proof of Concept**: Non-destructive demonstration
5. **Suggested Fix**: If you have ideas for mitigation

### What NOT to Do
- ❌ Don't access or modify user data without permission
- ❌ Don't perform destructive tests
- ❌ Don't publicly disclose before we've had time to fix
- ❌ Don't spam or flood our systems

## 🏆 Security Bounty Program

We appreciate security researchers and offer recognition for valid reports:

### Eligible Vulnerabilities
- **Critical**: Remote code execution, authentication bypass
- **High**: Data exposure, privilege escalation
- **Medium**: XSS, CSRF, data validation issues
- **Low**: Information disclosure, minor security issues

### Rewards
- **Critical**: $500 - $1000 + Hall of Fame
- **High**: $200 - $500 + Hall of Fame
- **Medium**: $50 - $200 + Recognition
- **Low**: Recognition + Our gratitude

### Scope
- **In Scope**: 
  - velvetlog.replit.app
  - velvetlog-staging.replit.app
  - API endpoints
  - Authentication systems
  - Data encryption/decryption

- **Out of Scope**:
  - Third-party services
  - Social engineering
  - Physical attacks
  - DoS/DDoS attacks

## 🔧 Security Development Guidelines

### For Developers

#### Secure Coding Practices
```typescript
// ✅ Good: Parameterized queries
const users = await db.select().from(usersTable).where(eq(usersTable.id, userId));

// ❌ Bad: String concatenation
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// ✅ Good: Input validation
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(12)
});

// ✅ Good: Error handling without information leakage
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', { userId, error });
  return res.status(500).json({ message: 'Internal server error' });
}
```

#### Secret Management
```bash
# ✅ Good: Use environment variables
const apiKey = process.env.API_KEY;

# ✅ Good: Use Replit Secrets
# Set in Replit Secrets panel, access via process.env

# ❌ Bad: Hardcoded secrets
const apiKey = "sk-1234567890abcdef";

# ❌ Bad: Committed .env files
git add .env  # Never do this!
```

#### Authentication Middleware
```typescript
// ✅ Good: Require authentication for sensitive routes
app.get('/api/contacts', authenticateUser, async (req, res) => {
  // Protected endpoint logic
});

// ✅ Good: Rate limiting
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

### Security Checklist

#### Before Committing
- [ ] No secrets in code or commit history
- [ ] All inputs validated and sanitized
- [ ] SQL queries use parameterized statements
- [ ] Authentication required for protected endpoints
- [ ] Sensitive data encrypted before storage
- [ ] Error messages don't leak information

#### Before Deploying
- [ ] Security audit completed (`npm audit`)
- [ ] All tests pass including security tests
- [ ] Secrets properly configured in environment
- [ ] HTTPS enforced in production
- [ ] Database connections encrypted
- [ ] Monitoring and logging enabled

## 🔍 Security Monitoring

### Logging and Monitoring
```typescript
// Security event logging
const securityLogger = {
  loginAttempt: (userId: string, success: boolean, ip: string) => {
    logger.info('Login attempt', { userId, success, ip, timestamp: new Date() });
  },
  
  dataAccess: (userId: string, resource: string, action: string) => {
    logger.info('Data access', { userId, resource, action, timestamp: new Date() });
  },
  
  securityViolation: (ip: string, violation: string, details: any) => {
    logger.warn('Security violation', { ip, violation, details, timestamp: new Date() });
  }
};
```

### Automated Security Checks
```yaml
# GitHub Actions security workflow
name: Security Scan
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run security audit
        run: npm audit --audit-level moderate
      - name: Check for secrets
        run: |
          if grep -r "SECRET\|KEY\|PASSWORD" --include="*.ts" --include="*.js" .; then
            echo "Potential secrets found!"
            exit 1
          fi
```

## 🚑 Incident Response

### Security Incident Workflow
1. **Detection**: Automated monitoring or manual report
2. **Assessment**: Evaluate severity and impact
3. **Containment**: Isolate affected systems
4. **Investigation**: Determine root cause
5. **Remediation**: Apply fixes and patches
6. **Recovery**: Restore normal operations
7. **Post-Incident**: Review and improve processes

### Emergency Contacts
- **Security Team**: security@velvetlog.app
- **Infrastructure**: ops@velvetlog.app
- **Management**: admin@velvetlog.app

### Communication Plan
- **Internal**: Slack #security-incidents
- **Users**: Status page and email notifications
- **Public**: Security advisories if necessary

## 📋 Compliance and Standards

### Standards We Follow
- **OWASP Top 10**: Web application security risks
- **NIST Cybersecurity Framework**: Risk management
- **SOC 2 Type II**: Security controls audit
- **GDPR**: Data protection and privacy

### Regular Security Activities
- **Monthly**: Dependency updates and security patches
- **Quarterly**: Penetration testing and security reviews
- **Annually**: Full security audit and policy review

### Data Retention and Deletion
- **User Data**: Retained as long as account is active
- **Logs**: 90 days for security logs, 30 days for debug logs
- **Backups**: 30 days with automatic deletion
- **Deletion**: Secure wiping of all user data upon request

## 📚 Security Resources

### Training Materials
- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Best Practices](https://snyk.io/blog/10-react-security-best-practices/)

### Security Tools
- **Static Analysis**: ESLint with security plugins
- **Dependency Scanning**: npm audit, Snyk
- **Runtime Protection**: Helmet.js, CORS
- **Monitoring**: Sentry for error tracking

### Documentation
- [API Security Documentation](./docs/API_SECURITY.md)
- [Encryption Implementation Guide](./docs/ENCRYPTION.md)
- [Authentication System Overview](./docs/AUTHENTICATION.md)

## 🔄 Security Policy Updates

This security policy is reviewed and updated regularly. Changes are:
- Announced to all developers
- Documented in our changelog
- Reviewed by security team
- Approved by management

**Last Updated**: 2025-06-25
**Next Review**: 2025-09-25
**Version**: 1.0