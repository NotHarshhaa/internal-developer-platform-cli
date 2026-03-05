"""React Frontend template using TypeScript and Vite."""

from pathlib import Path

from idp_cli.templates.base import BaseTemplate
from idp_cli.utils.file_utils import create_directory, write_file, render_template


class ReactFrontendTemplate(BaseTemplate):
    """Template for React frontend applications using TypeScript and Vite."""

    @property
    def template_name(self) -> str:
        return "react-frontend"

    @property
    def language(self) -> str:
        return "typescript"

    @property
    def framework(self) -> str:
        return "react"

    def generate_app_code(self) -> None:
        """Generate React application code."""
        # Create directories
        create_directory(self.service_dir / "src")
        create_directory(self.service_dir / "src" / "components")
        create_directory(self.service_dir / "src" / "pages")
        create_directory(self.service_dir / "src" / "hooks")
        create_directory(self.service_dir / "src" / "services")
        create_directory(self.service_dir / "src" / "types")
        create_directory(self.service_dir / "src" / "utils")
        create_directory(self.service_dir / "public")

        # Generate package.json
        package_json = '''{
  "name": "{{{{service_name}}}}",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.6.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "jsdom": "^23.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0"
  }
}
'''
        rendered_content = render_template(package_json, self.get_template_vars())
        write_file(self.service_dir / "package.json", rendered_content)

        # Generate TypeScript config
        tsconfig_json = '''{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
'''
        write_file(self.service_dir / "tsconfig.json", tsconfig_json)

        # Generate Vite config
        vite_config_ts = '''import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
'''
        write_file(self.service_dir / "vite.config.ts", vite_config_ts)

        # Generate main App component
        app_tsx = '''import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
'''
        write_file(self.service_dir / "src" / "App.tsx", app_tsx)

        # Generate main.tsx
        main_tsx = '''import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
'''
        write_file(self.service_dir / "src" / "main.tsx", main_tsx)

        # Generate CSS files
        index_css = '''/* Reset and base styles */
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
  display: flex;
  place-items: center;
}

#root {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
}
'''
        write_file(self.service_dir / "src" / "index.css", index_css)

        app_css = '''/* App-specific styles */
.App {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background-color: #4b5563;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
}

.dark .card {
  background-color: #1f2937;
  color: white;
}
'''
        write_file(self.service_dir / "src" / "App.css", app_css)

        # Generate Layout component
        layout_tsx = '''import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import './Layout.css'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  return (
    <div className={`layout ${theme}`}>
      <header className="header">
        <div className="container">
          <nav className="nav">
            <Link to="/" className="nav-brand">
              {{.service_name}}
            </Link>
            <div className="nav-links">
              <Link 
                to="/" 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
              >
                About
              </Link>
              <button 
                className="btn btn-secondary" 
                onClick={toggleTheme}
                type="button"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </nav>
        </div>
      </header>
      
      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>
      
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 {{.service_name}}. Built with React & TypeScript.</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
'''
        write_file(self.service_dir / "src" / "components" / "Layout.tsx", layout_tsx, self.get_template_vars())

        # Generate Layout CSS
        layout_css = '''/* Layout styles */
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.dark .header {
  background-color: #1f2937;
  border-bottom-color: #374151;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: #3b82f6;
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  color: #6b7280;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #3b82f6;
  background-color: #f3f4f6;
}

.nav-link.active {
  color: #3b82f6;
  background-color: #eff6ff;
}

.dark .nav-link {
  color: #9ca3af;
}

.dark .nav-link:hover {
  color: #60a5fa;
  background-color: #374151;
}

.dark .nav-link.active {
  color: #60a5fa;
  background-color: #1e3a8a;
}

.main {
  flex: 1;
  padding: 2rem 0;
}

.footer {
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  padding: 1rem 0;
  margin-top: auto;
}

.dark .footer {
  background-color: #111827;
  border-top-color: #374151;
}

.footer p {
  color: #6b7280;
  text-align: center;
}

.dark .footer p {
  color: #9ca3af;
}
'''
        write_file(self.service_dir / "src" / "components" / "Layout.css", layout_css)

        # Generate theme context
        theme_context_tsx = '''import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme')
    return (saved as Theme) || 'light'
  })

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
'''
        write_file(self.service_dir / "src" / "contexts" / "ThemeContext.tsx", theme_context_tsx)

        # Generate pages
        home_page_tsx = '''import React from 'react'
import { useQuery } from '@tanstack/react-query'
import './HomePage.css'

interface HelloResponse {
  message: string
  version: string
}

const HomePage: React.FC = () => {
  const { data, isLoading, error } = useQuery<HelloResponse>({
    queryKey: ['hello'],
    queryFn: async () => {
      // Mock API call - replace with actual API
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            message: 'Hello from {{.service_name}}!',
            version: '1.0.0'
          })
        }, 1000)
      })
    }
  })

  return (
    <div className="home-page">
      <div className="hero">
        <h1>Welcome to {{.service_name}}</h1>
        <p>A modern React application built with TypeScript and Vite</p>
        
        {isLoading && <p>Loading...</p>}
        {error && <p>Error loading data</p>}
        {data && (
          <div className="api-response">
            <h3>API Response:</h3>
            <p>{data.message}</p>
            <p>Version: {data.version}</p>
          </div>
        )}
        
        <div className="cta-buttons">
          <button className="btn btn-primary">
            Get Started
          </button>
          <button className="btn btn-secondary">
            Learn More
          </button>
        </div>
      </div>
      
      <div className="features">
        <h2>Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>⚡ Fast Development</h3>
            <p>Built with Vite for lightning-fast development and builds.</p>
          </div>
          <div className="feature-card">
            <h3>🔒 Type Safety</h3>
            <p>Full TypeScript support for better development experience.</p>
          </div>
          <div className="feature-card">
            <h3>🎨 Modern UI</h3>
            <p>Clean, responsive design with dark mode support.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
'''
        write_file(self.service_dir / "src" / "pages" / "HomePage.tsx", home_page_tsx, self.get_template_vars())

        home_page_css = '''/* HomePage styles */
.home-page {
  text-align: center;
}

.hero {
  padding: 4rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 0.5rem;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.api-response {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin: 2rem auto;
  max-width: 500px;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.features {
  padding: 2rem 0;
}

.features h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #1f2937;
}

.dark .features h2 {
  color: white;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-2px);
}

.dark .feature-card {
  background-color: #1f2937;
  color: white;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #3b82f6;
}

.feature-card p {
  color: #6b7280;
}

.dark .feature-card p {
  color: #9ca3af;
}
'''
        write_file(self.service_dir / "src" / "pages" / "HomePage.css", home_page_css)

        about_page_tsx = '''import React from 'react'
import './AboutPage.css'

const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      <h1>About {{.service_name}}</h1>
      <p>
        This is a modern React application built with TypeScript, Vite, and other best-in-class tools.
      </p>
      
      <div className="tech-stack">
        <h2>Tech Stack</h2>
        <div className="tech-grid">
          <div className="tech-item">
            <h3>React 18</h3>
            <p>A JavaScript library for building user interfaces</p>
          </div>
          <div className="tech-item">
            <h3>TypeScript</h3>
            <p>Typed JavaScript at Any Scale</p>
          </div>
          <div className="tech-item">
            <h3>Vite</h3>
            <p>Next Generation Frontend Tooling</p>
          </div>
          <div className="tech-item">
            <h3>React Router</h3>
            <p>Declarative routing for React</p>
          </div>
          <div className="tech-item">
            <h3>TanStack Query</h3>
            <p>Powerful asynchronous state management</p>
          </div>
          <div className="tech-item">
            <h3>Tailwind CSS</h3>
            <p>Utility-first CSS framework</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
'''
        write_file(self.service_dir / "src" / "pages" / "AboutPage.tsx", about_page_tsx, self.get_template_vars())

        about_page_css = '''/* AboutPage styles */
.about-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 0;
}

.about-page h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #1f2937;
}

.dark .about-page h1 {
  color: white;
}

.about-page > p {
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 3rem;
}

.dark .about-page > p {
  color: #9ca3af;
}

.tech-stack h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #1f2937;
}

.dark .tech-stack h2 {
  color: white;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.tech-item {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.tech-item:hover {
  transform: translateY(-1px);
}

.dark .tech-item {
  background-color: #1f2937;
  color: white;
}

.tech-item h3 {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
  color: #3b82f6;
}

.tech-item p {
  color: #6b7280;
  font-size: 0.875rem;
}

.dark .tech-item p {
  color: #9ca3af;
}
'''
        write_file(self.service_dir / "src" / "pages" / "AboutPage.css", about_page_css)

        not_found_page_tsx = '''import React from 'react'
import { Link } from 'react-router-dom'
import './NotFoundPage.css'

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>Sorry, the page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">
        Go Home
      </Link>
    </div>
  )
}

export default NotFoundPage
'''
        write_file(self.service_dir / "src" / "pages" / "NotFoundPage.tsx", not_found_page_tsx)

        not_found_page_css = '''/* NotFoundPage styles */
.not-found-page {
  text-align: center;
  padding: 4rem 0;
}

.not-found-page h1 {
  font-size: 6rem;
  font-weight: bold;
  color: #3b82f6;
  margin-bottom: 1rem;
}

.not-found-page h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #1f2937;
}

.dark .not-found-page h2 {
  color: white;
}

.not-found-page p {
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

.dark .not-found-page p {
  color: #9ca3af;
}
'''
        write_file(self.service_dir / "src" / "pages" / "NotFoundPage.css", not_found_page_css)

        # Generate public files
        index_html = '''<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{.service_name}}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
'''
        write_file(self.service_dir / "public" / "index.html", index_html, self.get_template_vars())

        # Generate test setup
        create_directory(self.service_dir / "src" / "test")
        test_setup_ts = '''import '@testing-library/jest-dom'
'''
        write_file(self.service_dir / "src" / "test" / "setup.ts", test_setup_ts)

    def generate_config_files(self) -> None:
        """Generate configuration files."""
        # .env.example
        env_example = '''# Environment Variables
VITE_API_URL=http://localhost:8000
VITE_APP_NAME={{.service_name}}
'''
        write_file(self.service_dir / ".env.example", env_example, self.get_template_vars())

        # .gitignore
        gitignore = '''# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Coverage
coverage/

# Test results
test-results/
'''
        write_file(self.service_dir / ".gitignore", gitignore)

        # README
        readme_md = '''# {{.service_name}}

A modern React frontend application built with TypeScript and Vite.

## Features

- ⚡ Fast development with Vite
- 🔒 Full TypeScript support
- 🎨 Modern UI with dark mode
- 📱 Responsive design
- 🧪 Testing with Vitest and React Testing Library
- 🚀 Optimized production builds

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd {{.service_name}}

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts
├── pages/          # Page components
├── services/       # API services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── styles/         # Global styles
```

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router
- **State Management**: TanStack Query
- **Styling**: CSS Modules with CSS Variables
- **Testing**: Vitest + React Testing Library

## License

MIT
'''
        write_file(self.service_dir / "README.md", readme_md, self.get_template_vars())

    def generate_tests(self) -> None:
        """Generate test files."""
        create_directory(self.service_dir / "src" / "components" / "__tests__")

        # Component test
        layout_test_tsx = '''import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from '../Layout'

// Mock the theme context
jest.mock('../contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({
    theme: 'light',
    toggleTheme: jest.fn(),
  }),
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Layout', () => {
  test('renders navigation', () => {
    renderWithRouter(<Layout><div>Test Content</div></Layout>)
    
    expect(screen.getByText('{{.service_name}}')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  test('renders children', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })
})
'''
        write_file(self.service_dir / "src" / "components" / "__tests__" / "Layout.test.tsx", layout_test_tsx, self.get_template_vars())
