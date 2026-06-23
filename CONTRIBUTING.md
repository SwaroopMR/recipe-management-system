# Contributing to Recipe Vault

Thank you for your interest in contributing to **Recipe Vault**! We welcome improvements to code, layouts, and documentation.

---

## Code of Conduct

Please treat all contributors with respect. Maintain a clean, professional communication tone across issues, pull requests, and commit logs.

---

## Coding Standards

### 1. Technology Rules
- **Frontend**: Next.js 15 App Router, React, TypeScript.
- **Styling**: Tailwind CSS v4, global CSS variables, Outfit font.
- **State/Queries**: React Query for network requests, Context for browser local storage.
- **Forms**: Zod schema validation.

### 2. Linting & Formats
Before pushing code, verify that checks compile cleanly:
```bash
# Run ESLint validation
npm run lint

# Check type check compiler
npx tsc --noEmit

# Run production build compilation
npm run build
```

---

## Development Workflow

1. **Fork the Repository**: Clone it to your local machine.
2. **Create a Feature Branch**: Use descriptive names:
   ```bash
   git checkout -b feat/add-cooking-tips
   ```
3. **Commit Guidelines**: Prefix commits with descriptive labels matching the changelog scopes:
   - `feat:` for new capabilities.
   - `fix:` for bugs.
   - `docs:` for documentation.
   - `perf:` for latency optimizations.
4. **Submit Pull Request**: Open a PR pointing to the `main` branch. Provide screenshots or recordings of visual edits!
