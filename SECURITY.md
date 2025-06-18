# Security Policy

## Supported Versions

The following versions of Garasje Avlesning are currently being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Garasje Avlesning seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisories**: [Create a security advisory](https://github.com/torsteinpaulsen/garasje-avlesning/security/advisories/new) (preferred method)
2. **Email**: Send details to the repository maintainer via GitHub profile contact

### What to Include

Please include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline

- **Initial Response**: Within 48 hours
- **Assessment**: Within 1 week
- **Resolution**: Depending on severity:
  - Critical: Within 7 days
  - High: Within 14 days
  - Medium: Within 30 days
  - Low: Within 60 days

## Security Best Practices

When deploying Garasje Avlesning:

1. **Environment Variables**: Never commit `.env` files or expose sensitive credentials
2. **Google Service Account**: Keep your service account JSON file secure and limit its permissions
3. **Database**: Ensure your SQLite database file has appropriate file permissions
4. **Network**: Use HTTPS in production environments
5. **Updates**: Keep the application and its dependencies up to date
6. **Access Control**: Limit access to the Unraid web interface and Docker container

## Dependencies

This project uses automated dependency scanning via:
- GitHub Dependabot for security updates
- npm audit in CI/CD pipeline

## Disclosure Policy

When we receive a security report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find similar problems
3. Prepare fixes for all supported releases
4. Release new security fix versions
5. Prominently announce the problem in release notes

## Comments on this Policy

If you have suggestions on how this process could be improved, please submit a pull request.