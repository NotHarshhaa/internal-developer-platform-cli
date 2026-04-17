import { BaseTemplate, GeneratedFile, ServiceConfig } from "./base";

export class ReactFrontendTemplate extends BaseTemplate {
  get templateName(): string {
    return "react-frontend";
  }

  get language(): string {
    return "typescript";
  }

  get framework(): string {
    return "react";
  }

  generateFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const svc = this.getServiceName();

    // package.json
    this.addFile(files, "package.json", `{
  "name": "${svc}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.3",
    "@tanstack/react-query": "^5.17.9",
    "zustand": "^4.5.0",
    "axios": "^1.6.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.12",
    "eslint": "^8.56.0"
  }
}
`);

    // vite.config.ts
    this.addFile(files, "vite.config.ts", `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: ${this.config.port},
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
`);

    // tsconfig.json
    this.addFile(files, "tsconfig.json", `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
`);

    this.addFile(files, "tsconfig.node.json", `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
`);

    // index.html
    this.addFile(files, "index.html", `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${svc}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);

    // src/main.tsx
    this.addFile(files, "src/main.tsx", `import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
`);

    // src/App.tsx
    this.addFile(files, "src/App.tsx", `import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import './App.css'

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">${svc}</div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </div>
      </nav>
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
`);

    // src/App.css
    this.addFile(files, "src/App.css", `.app {
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #1a1a2e;
  color: white;
}

.nav-brand {
  font-size: 1.25rem;
  font-weight: bold;
}

.nav-links a {
  color: #ccc;
  text-decoration: none;
  margin-left: 1.5rem;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: #61dafb;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
`);

    // src/index.css
    this.addFile(files, "src/index.css", `*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #213547;
  background: #ffffff;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a {
  color: #61dafb;
  text-decoration: none;
}
`);

    // src/pages/Home.tsx
    this.addFile(files, "src/pages/Home.tsx", `import { useCounterStore } from '../stores/counter'

function Home() {
  const { count, increment, decrement } = useCounterStore()

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Welcome to ${svc}</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        A modern React application generated by IDP CLI.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Counter: {count}</p>
        <button onClick={increment} style={btnStyle}>Increment</button>
        <button onClick={decrement} style={{ ...btnStyle, marginLeft: '0.5rem', background: '#e74c3c' }}>
          Decrement
        </button>
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '0.5rem 1.5rem',
  border: 'none',
  borderRadius: '6px',
  background: '#61dafb',
  color: '#1a1a2e',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 600,
}

export default Home
`);

    // src/pages/About.tsx
    this.addFile(files, "src/pages/About.tsx", `function About() {
  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h1>About ${svc}</h1>
      <p style={{ marginTop: '1rem' }}>
        This application was generated using the Internal Developer Platform CLI.
      </p>
      <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
        <li>React 18 with TypeScript</li>
        <li>Vite for fast HMR</li>
        <li>React Router v6</li>
        <li>Zustand state management</li>
        <li>React Query for data fetching</li>
      </ul>
    </div>
  )
}

export default About
`);

    // src/stores/counter.ts
    this.addFile(files, "src/stores/counter.ts", `import { create } from 'zustand'

interface CounterState {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}))
`);

    // src/vite-env.d.ts
    this.addFile(files, "src/vite-env.d.ts", `/// <reference types="vite/client" />
`);

    this.addFile(files, ".gitignore", `node_modules/
dist/
.env
*.log
.DS_Store
`);

    // Docker
    if (this.config.docker) {
      this.addFile(files, "Dockerfile", `FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`);

      this.addFile(files, "nginx.conf", `server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
`);

      this.addFile(files, ".dockerignore", `node_modules/
dist/
.git
README.md
`);
    }

    // Kubernetes
    if (this.config.k8s) {
      this.addFile(files, "k8s/base/deployment.yaml", `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${svc}
  labels:
    app: ${svc}
spec:
  replicas: ${this.config.replicas}
  selector:
    matchLabels:
      app: ${svc}
  template:
    metadata:
      labels:
        app: ${svc}
    spec:
      containers:
      - name: ${svc}
        image: ${svc}:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: ${this.config.resources.cpuRequest}
            memory: ${this.config.resources.memoryRequest}
          limits:
            cpu: ${this.config.resources.cpuLimit}
            memory: ${this.config.resources.memoryLimit}
`);

      this.addFile(files, "k8s/base/service.yaml", `apiVersion: v1
kind: Service
metadata:
  name: ${svc}
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: ${svc}
`);

      this.addFile(files, "k8s/base/kustomization.yaml", `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
commonLabels:
  app: ${svc}
`);
    }

    // README
    if (this.config.docs) {
      this.addFile(files, "README.md", `# ${svc}

A modern React application generated by IDP CLI.

## Features

- React 18 with TypeScript
- Vite for fast development
- React Router v6
- Zustand state management
- React Query for data fetching

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

App: http://localhost:${this.config.port}

## Build

\`\`\`bash
npm run build
npm run preview
\`\`\`

## Docker

\`\`\`bash
docker build -t ${svc} .
docker run -p 80:80 ${svc}
\`\`\`
`);
    }

    return files;
  }
}
