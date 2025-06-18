# Contributing to Garasje Avlesning

Thank you for considering contributing to Garasje Avlesning! This document provides guidelines and information for contributors.

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How to Contribute

### Reporting Bugs

1. **Check existing issues** first to avoid duplicates
2. **Use the bug report template** when creating new issues
3. **Include as much detail as possible**:
   - Environment information
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Container logs if relevant

### Requesting Features

1. **Check existing feature requests** first
2. **Use the feature request template**
3. **Explain the use case** and why it would be valuable
4. **Consider implementation complexity** and maintenance burden

### Contributing Code

#### Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/garasje-avlesning.git
   cd garasje-avlesning
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Setup

1. **Backend development**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```

2. **Frontend development**:
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm start
   ```

#### Code Standards

1. **TypeScript**: All new code should be written in TypeScript
2. **Linting**: Run `npm run lint` before committing
3. **Testing**: Add tests for new functionality
4. **Documentation**: Update documentation for user-facing changes

#### Commit Guidelines

1. **Use conventional commits**:
   - `feat:` new features
   - `fix:` bug fixes
   - `docs:` documentation changes
   - `style:` formatting, no code changes
   - `refactor:` code refactoring
   - `test:` adding tests
   - `chore:` maintenance tasks

2. **Examples**:
   ```
   feat: add support for water meters
   fix: resolve image upload issue on mobile
   docs: update Unraid setup guide
   ```

#### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Run the test suite**: `npm test`
4. **Run linting**: `npm run lint`
5. **Update CHANGELOG.md** with your changes
6. **Create a pull request** with:
   - Clear description of changes
   - Reference to related issues
   - Screenshots if UI changes
   - Testing instructions

## Development Guidelines

### Backend Development

- **Database changes**: Always use migrations or schema updates
- **API changes**: Maintain backward compatibility when possible
- **Error handling**: Use consistent error formats
- **Logging**: Use appropriate log levels
- **Security**: Follow security best practices

### Frontend Development

- **Components**: Keep components small and focused
- **State management**: Use React Query for server state
- **Styling**: Use Tailwind CSS classes
- **Accessibility**: Follow WCAG guidelines
- **Performance**: Optimize images and bundle size

### Docker Development

- **Multi-stage builds**: Keep images small
- **Security**: Run as non-root user
- **Health checks**: Include proper health checks
- **Volumes**: Use appropriate volume mappings

## Project Structure

```
├── backend/           # Node.js/Express API
├── frontend/          # React application
├── docker/            # Docker configurations and templates
├── .github/           # GitHub workflows and templates
├── docs/              # Additional documentation
├── SPEC.md            # Technical specification
├── DEPLOYMENT.md      # Deployment guide
└── UNRAID-SETUP.md   # Unraid-specific setup
```

## Testing

### Backend Testing
```bash
cd backend
npm test                # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
```

### Frontend Testing
```bash
cd frontend
npm test               # Run all tests
npm test -- --coverage # Generate coverage report
```

### Integration Testing
```bash
docker-compose up -d   # Start services
# Test the application manually
# Run end-to-end tests if available
```

## Documentation

- **API changes**: Update OpenAPI specification if available
- **User-facing changes**: Update relevant .md files
- **New features**: Add to README.md and appropriate guides
- **Breaking changes**: Document in CHANGELOG.md

## Release Process

1. **Update version** in package.json files
2. **Update CHANGELOG.md** with all changes
3. **Create release PR** with version bump
4. **Tag release** after merge: `git tag v1.x.x`
5. **GitHub Actions** will automatically build and publish Docker images

## Getting Help

- **Check existing documentation** first
- **Search existing issues** for similar problems
- **Create a discussion** for questions about development
- **Join our community** (if applicable)

## License

By contributing to Garasje Avlesning, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- README.md contributor section
- Release notes
- GitHub contributors page

Thank you for contributing to Garasje Avlesning! 🏠⚡