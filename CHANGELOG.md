# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of Garasje Avlesning app

## [1.0.0] - 2024-01-15

### Added
- **Core Features**
  - Meter management (CRUD operations)
  - Reading registration (manual and photo)
  - Image upload with automatic compression
  - SQLite database with optimized schema
  - RESTful API with comprehensive validation

- **Frontend**
  - Responsive React web interface
  - Dashboard with meter overview
  - Camera integration for photo readings
  - Reading history and statistics
  - Administration panel for meter management
  - Settings page with export functionality

- **Backend**
  - Express.js API server
  - SQLite database with better-sqlite3
  - Image processing with Sharp
  - Structured logging with Winston
  - Security middleware (Helmet, CORS, rate limiting)
  - Comprehensive error handling

- **Google Sheets Integration**
  - Automatic synchronization every hour
  - Manual sync functionality
  - Service account authentication
  - Robust error handling and retry logic
  - Configurable sync intervals

- **Export Features**
  - Excel export with multiple sheets
  - Monthly summary reports
  - Automatic column formatting
  - Comprehensive data export

- **Docker Support**
  - Multi-stage Dockerfile for optimized production builds
  - Docker Compose for easy local development
  - Health checks and proper signal handling
  - Resource limits and security best practices

- **Unraid Integration**
  - Optimized Unraid template
  - Detailed setup documentation
  - Copy/paste configuration values
  - Community Applications ready

- **Documentation**
  - Comprehensive technical specification (SPEC.md)
  - Detailed deployment guide (DEPLOYMENT.md)
  - Step-by-step Unraid setup guide (UNRAID-SETUP.md)
  - Environment configuration examples

- **Developer Experience**
  - TypeScript throughout the stack
  - ESLint and Prettier configuration
  - Jest testing setup
  - GitHub Actions for CI/CD
  - Automated Docker Hub builds

### Technical Details
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js 20 + Express + TypeScript
- **Database**: SQLite with optimized indexing
- **Authentication**: JWT-based (ready for future implementation)
- **File Storage**: Local file system with volume mapping
- **Image Processing**: Sharp for compression and resizing
- **API**: RESTful with comprehensive validation using Joi
- **Logging**: Winston with rotating log files
- **Security**: Helmet, CORS, rate limiting, input validation

### Supported Platforms
- Docker on Linux/Windows/macOS
- Unraid 6.9+
- Any system with Docker support
- Browsers: Chrome, Firefox, Safari, Edge (mobile and desktop)

### Environment Support
- Development with hot reload
- Production with optimized builds
- Docker containers with health checks
- Unraid with persistent storage