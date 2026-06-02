# Contributing to Workout Planner

Thank you for your interest in contributing to the Workout Planner project! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Open a Pull Request

## Development Setup

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
cp .env.example .env
cargo run
```

### Using Docker Compose
```bash
docker-compose up -d
```

## Code Style Guidelines

### Frontend (Svelte/JavaScript)
- Use consistent indentation (2 spaces)
- Use meaningful variable and component names
- Follow Svelte best practices
- Add comments for complex logic

### Backend (Rust)
- Follow Rust naming conventions
- Use `cargo fmt` for code formatting
- Use `cargo clippy` for linting
- Write tests for new functionality

## Commit Message Guidelines

- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, Remove, etc.)
- Keep messages concise (under 72 characters for the first line)
- Example: `Add workout timer functionality to frontend`

## Pull Request Process

1. Update relevant documentation
2. Add tests for new features
3. Ensure all tests pass
4. Provide a clear description of changes
5. Link any relevant issues
6. Request review from maintainers

## Reporting Issues

When reporting issues, please include:
- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment information (OS, browser, versions)

## Code of Conduct

Be respectful and constructive in all interactions with other contributors.

Thank you for contributing!
