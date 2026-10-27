#!/bin/bash

# VelvetLog Development Setup Script
# This script sets up the development environment for new collaborators

set -e

echo "🚀 Setting up VelvetLog development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20 or later."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 18 or later."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not found in environment"
    echo "   Make sure to set up your database connection in Replit Secrets"
    echo "   or create a .env.local file with DATABASE_URL"
fi

# Check if required secrets are available
REQUIRED_SECRETS=("SESSION_SECRET" "MASTER_ENCRYPTION_KEY")
MISSING_SECRETS=()

for secret in "${REQUIRED_SECRETS[@]}"; do
    if [ -z "${!secret}" ]; then
        MISSING_SECRETS+=("$secret")
    fi
done

if [ ${#MISSING_SECRETS[@]} -ne 0 ]; then
    echo "⚠️  Missing required environment variables:"
    for secret in "${MISSING_SECRETS[@]}"; do
        echo "   - $secret"
    done
    echo "   Please add these to Replit Secrets or your .env.local file"
fi

# Set up database schema (if DATABASE_URL is available)
if [ -n "$DATABASE_URL" ]; then
    echo "🗄️  Setting up database schema..."
    npm run db:push
    echo "✅ Database schema updated"
else
    echo "⏭️  Skipping database setup (DATABASE_URL not available)"
fi

# Create development configuration
echo "⚙️  Creating development configuration..."

# Create .env.local template if it doesn't exist
if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
# VelvetLog Development Environment
# Copy this file and update with your actual values

NODE_ENV=development
PORT=5000

# Database (get from Replit Database or use your own PostgreSQL)
DATABASE_URL=your_database_url_here

# Security (generate secure random values)
SESSION_SECRET=your_session_secret_here
MASTER_ENCRYPTION_KEY=your_master_encryption_key_here

# Optional: Monitoring and Analytics
# SENTRY_DSN=your_sentry_dsn
# ANALYTICS_KEY=your_analytics_key

# Optional: External Services
# OPENAI_API_KEY=your_openai_key
# TWILIO_ACCOUNT_SID=your_twilio_sid
# TWILIO_AUTH_TOKEN=your_twilio_token
EOF
    echo "📄 Created .env.local template"
    echo "   Please update it with your actual values"
fi

# Set up Git hooks for code quality
echo "🔧 Setting up Git hooks..."
mkdir -p .git/hooks

# Pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook for VelvetLog

echo "🔍 Running pre-commit checks..."

# Run TypeScript type checking
echo "   Checking TypeScript..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ TypeScript errors found. Please fix them before committing."
    exit 1
fi

# Run tests
echo "   Running tests..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Please fix them before committing."
    exit 1
fi

# Check for secrets in staged files
echo "   Checking for secrets..."
if git diff --cached --name-only | xargs grep -l "SECRET\|KEY\|PASSWORD\|TOKEN" 2>/dev/null; then
    echo "⚠️  Potential secrets detected in staged files:"
    git diff --cached --name-only | xargs grep -n "SECRET\|KEY\|PASSWORD\|TOKEN" 2>/dev/null || true
    echo "   Please review and ensure no actual secrets are being committed."
    echo "   Use Replit Secrets or .env.local for sensitive data."
fi

echo "✅ Pre-commit checks passed!"
EOF

chmod +x .git/hooks/pre-commit

# Generate secure keys for development
echo "🔐 Generating development keys..."

# Function to generate secure random string
generate_key() {
    openssl rand -hex 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
}

SESSION_KEY=$(generate_key)
ENCRYPTION_KEY=$(generate_key)

echo "   Generated SESSION_SECRET: $SESSION_KEY"
echo "   Generated MASTER_ENCRYPTION_KEY: $ENCRYPTION_KEY"
echo ""
echo "   💡 Add these to your Replit Secrets or .env.local file"

# Create development scripts
echo "📝 Creating development helper scripts..."

# Database reset script
cat > scripts/reset-db.sh << 'EOF'
#!/bin/bash
echo "🗄️  Resetting database..."
npm run db:push --force
echo "✅ Database reset complete"
EOF
chmod +x scripts/reset-db.sh

# Test script with coverage
cat > scripts/test-with-coverage.sh << 'EOF'
#!/bin/bash
echo "🧪 Running tests with coverage..."
npm run test:coverage
echo "📊 Coverage report generated in ./coverage/"
EOF
chmod +x scripts/test-with-coverage.sh

# Build and preview script
cat > scripts/preview-build.sh << 'EOF'
#!/bin/bash
echo "🏗️  Building production bundle..."
npm run build

echo "🔍 Starting preview server..."
npm run preview
EOF
chmod +x scripts/preview-build.sh

# Create development documentation
echo "📚 Setting up documentation..."

if [ ! -d "docs" ]; then
    mkdir docs
fi

# API documentation template
if [ ! -f "docs/API.md" ]; then
    cat > docs/API.md << 'EOF'
# VelvetLog API Documentation

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

### POST /api/auth/login
Authenticate user credentials.

### POST /api/auth/logout
Invalidate user session.

## Contact Management

### GET /api/contacts
Retrieve user's contacts.

### POST /api/contacts
Create a new contact.

### PUT /api/contacts/:id
Update existing contact.

### DELETE /api/contacts/:id
Delete contact.

## More endpoints documented in code...
EOF
fi

# Final setup verification
echo "🔍 Verifying setup..."

# Check if all required files exist
REQUIRED_FILES=("package.json" "tsconfig.json" "server/index.ts" "client/src/main.tsx")
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -ne 0 ]; then
    echo "❌ Missing required files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
    exit 1
fi

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. 🔐 Set up your environment variables in Replit Secrets"
echo "2. 🗄️  Configure your database connection"
echo "3. 🚀 Start development with: npm run dev"
echo "4. 🧪 Run tests with: npm test"
echo ""
echo "📖 Read COLLABORATION_GUIDE.md for detailed development guidelines"
echo "🆘 Need help? Check the troubleshooting section in the guide"
echo ""
echo "Happy coding! 🚀"
EOF
chmod +x scripts/setup-dev.sh