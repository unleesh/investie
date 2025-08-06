# Contributing to Investie Backend

## 🚀 Quick Start for New Developers

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd investie

# Install dependencies
npm install

# Setup environment
cd apps/backend
cp .env.example .env
# Edit .env with your API keys

# Build the project
npm run build

# Start development server
npm run start:dev
```

## 🔧 Development Workflow

### 1. **Branch Strategy**
- `main` - Production ready code
- `develop` - Development branch
- `feature/your-feature-name` - Feature branches
- `fix/issue-description` - Bug fixes

### 2. **Before Making Changes**
```bash
# Create a new branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Test your changes
npm run test
npm run test:e2e
node test-news-e2e.js

# Format code
npm run format
npm run lint
```

### 3. **Commit Guidelines**
Use conventional commits:
```
feat: add new stock validation endpoint
fix: resolve news caching issue
docs: update API documentation
test: add unit tests for stock validator
```

### 4. **Pull Request Process**
1. Push your branch to GitHub
2. Create a Pull Request to `develop`
3. Add description of changes
4. Request review from team members
5. Address feedback
6. Merge after approval

## 📋 Code Standards

### TypeScript
- Use strict typing
- Add interfaces for all data structures
- Document complex functions

### Testing
- Write unit tests for new features
- Update E2E tests if needed
- Ensure all tests pass before PR

### API Design
- Follow RESTful conventions
- Add proper error handling
- Document new endpoints in README

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run E2E tests
npm run test:e2e

# Test news workflow
node test-news-e2e.js

# Test specific stock
node test-single-stock.js AAPL
```

## 📚 Project Structure

```
apps/backend/
├── src/
│   ├── news/          # News processing module
│   ├── market/        # Market data module
│   ├── stocks/        # Stock information module
│   ├── chat/          # AI chat functionality
│   └── ai/            # AI evaluation services
├── test/              # E2E tests
├── data/              # Local data storage (gitignored)
└── dist/              # Compiled JavaScript
```

## 🔑 Environment Variables

See `.env.example` for required API keys and configuration.

## 🐛 Debugging

### Common Issues
1. **Build errors**: Run `npm run build` in root and backend
2. **API errors**: Check your API keys in `.env`
3. **Port conflicts**: Change PORT in `.env`

### Logs
- Check `backend.log` for application logs
- Use `npm run start:debug` for debugging

## 📞 Getting Help

- Check existing issues on GitHub
- Ask questions in team chat
- Review documentation in `/docs`
- Run `node test-news-e2e.js` to verify setup

## 🎯 Key Development Areas

- **News Module**: Stock news processing and AI analysis
- **Market Module**: Market data and summaries  
- **Stock Module**: Individual stock information
- **Chat Module**: AI-powered investment chat
- **Validation**: Stock symbol validation system

Happy coding! 🚀
