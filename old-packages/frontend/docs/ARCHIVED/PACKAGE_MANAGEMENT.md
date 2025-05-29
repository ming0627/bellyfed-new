# Package Management in Bellyfed

This document explains the package management approach used in the Bellyfed project.

## Package Manager: npm

Bellyfed uses [npm](https://www.npmjs.com/) as its package manager. npm is the default package manager for Node.js and is chosen for its:

- **Widespread adoption**: Most JavaScript developers are familiar with npm
- **Stability**: npm is mature and well-maintained
- **Extensive ecosystem**: npm has the largest package registry in the world
- **Integration**: npm is integrated with most development tools and CI/CD platforms

## Setup Instructions

### Installing Dependencies

```bash
# Install all dependencies
npm install

# Add a new dependency
npm install package-name

# Add a dev dependency
npm install --save-dev package-name
```

## Configuration Files

The project includes several configuration files for package management:

- **package.json**: Main package configuration
- **package-lock.json**: Lock file that ensures consistent installations

## Best Practices

1. **Always commit package-lock.json**: This ensures consistent installations across all environments
2. **Use semantic versioning**: For dependencies, use semantic versioning (e.g., ^1.2.3) to get compatible updates
3. **Update dependencies regularly**: Run `npm update` regularly to keep dependencies up to date
4. **Check for vulnerabilities**: Run `npm audit` to check for security vulnerabilities
5. **Use npm scripts**: Define common tasks in the scripts section of package.json

## Common Issues

### Dependency Conflicts

If you encounter dependency conflicts, try:

```bash
# Clear npm cache
npm cache clean --force

# Reinstall with force
npm install --force
```

### Outdated Dependencies

To check for outdated dependencies:

```bash
npm outdated
```

To update all dependencies to their latest compatible version:

```bash
npm update
```

## CI/CD Integration

For CI/CD pipelines, ensure that npm is used consistently:

```yaml
# Example GitHub Actions workflow
steps:
  - uses: actions/checkout@v3
  - uses: actions/setup-node@v3
    with:
      node-version: 18
      cache: 'npm'
  - run: npm ci
  - run: npm run build
```

## Security

Regularly run security audits to check for vulnerabilities:

```bash
npm audit
```

Fix security issues when possible:

```bash
npm audit fix
```
