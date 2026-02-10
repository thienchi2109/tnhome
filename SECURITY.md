# Security Guidelines

## Database Credentials Security

### Issue Resolved (2026-01-22)
Previously, database credentials were hardcoded in `docker-compose.yml` and committed to git history. This has been fixed by moving all sensitive configuration to environment variables.

### Current Setup

**Environment Files:**
- `.env` - Your local environment file (NEVER commit this)
- `.env.example` - Template with placeholder values (safe to commit)
- `.env.docker` - Docker-specific defaults for local dev (NEVER commit production values here)

**Docker Compose:**
The `docker-compose.yml` now reads credentials from environment variables with fallback defaults:
```yaml
environment:
  POSTGRES_USER: ${POSTGRES_USER:-postgres}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
  POSTGRES_DB: ${POSTGRES_DB:-tnhome}
```

### Production Deployment Checklist

When deploying to production, ensure you:

1. **Generate Strong Credentials**
   ```bash
   # Generate a strong password (Linux/Mac)
   openssl rand -base64 32

   # Or use a password manager
   ```

2. **Update Production Environment Variables**
   - Never use default passwords (`postgres`, `password`, etc.)
   - Use different credentials for each environment
   - Store production secrets in a secure vault (e.g., HashiCorp Vault, AWS Secrets Manager)

3. **Secure Database Access**
   - Change the default PostgreSQL port if exposed to the internet
   - Use firewall rules to restrict database access
   - Consider using Docker secrets for sensitive data
   - Never expose port 5432 publicly in production

4. **Review Git History**
   If you've already committed credentials:
   - Rotate all exposed credentials immediately
   - Consider using `git filter-branch` or BFG Repo-Cleaner to remove secrets from history
   - Note: Simply deleting from current commit doesn't remove from git history

### Docker Usage

**Local Development:**
```bash
# Copy the example and set your local values
cp .env.example .env

# Start containers
npm run docker:up
```

**Production Deployment:**
```bash
# Set environment variables in your deployment platform
# OR use Docker secrets
# OR mount a secure .env file at runtime

docker-compose up -d
```

### Best Practices

1. **Never commit** `.env` or `.env.docker` files with real credentials
2. **Always use** environment variables for sensitive data
3. **Rotate credentials** regularly in production
4. **Use strong passwords** (minimum 32 characters, random)
5. **Limit database exposure** - bind to localhost or private networks only
6. **Enable SSL/TLS** for database connections in production
7. **Use secrets management** tools for production deployments

### Checking for Exposed Secrets

Before committing:
```bash
# Check for potential secrets
git diff

# Scan with git-secrets or similar tools
git secrets --scan
```

### Emergency Response

If credentials are exposed:
1. **Immediately rotate** all exposed credentials
2. **Audit logs** for unauthorized access
3. **Review git history** and remove secrets if needed
4. **Notify stakeholders** if data may have been compromised

## Other Security Considerations

### Authentication (Clerk)
- API keys are in `.env` (never commit)
- Admin emails controlled via `ADMIN_EMAILS` environment variable

### Payment (VietQR)
- Bank account details in environment variables
- No sensitive payment data stored in database

### File Uploads (Cloudinary)
- API credentials in environment variables
- Implement file type and size restrictions
- Sanitize uploaded filenames

### API Security
- Use HTTPS in production
- Implement rate limiting
- Validate all user input with Zod
- Use parameterized queries (Prisma handles this)

## Reporting Security Issues

If you discover a security vulnerability, please email: [your-security-email@example.com]

Do NOT create public GitHub issues for security vulnerabilities.
