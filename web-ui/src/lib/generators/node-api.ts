import { BaseTemplate, GeneratedFile, ServiceConfig } from "./base";

export class NodeAPITemplate extends BaseTemplate {
  get templateName(): string {
    return "node-api";
  }

  get language(): string {
    return "typescript";
  }

  get framework(): string {
    return "express";
  }

  generateFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const svc = this.getServiceName();

    // Package.json
    const packageJson = {
      name: svc,
      version: "0.1.0",
      description: `Auto-generated ${svc} service by IDP CLI`,
      main: "dist/index.js",
      scripts: {
        dev: "tsx watch src/index.ts",
        build: "tsc",
        start: "node dist/index.js",
        test: "jest",
        lint: "eslint src --ext .ts",
      },
      dependencies: {
        express: "^4.18.2",
        cors: "^2.8.5",
        dotenv: "^16.3.1",
        helmet: "^7.1.0",
        "express-rate-limit": "^7.1.5",
      },
      devDependencies: {
        "@types/express": "^4.17.21",
        "@types/cors": "^2.8.17",
        "@types/node": "^20.10.6",
        typescript: "^5.3.3",
        tsx: "^4.7.0",
        jest: "^29.7.0",
        "@types/jest": "^29.5.11",
        "ts-jest": "^29.1.1",
        eslint: "^8.56.0",
        "@typescript-eslint/eslint-plugin": "^6.17.0",
        "@typescript-eslint/parser": "^6.17.0",
      },
    };
    this.addFile(files, "package.json", JSON.stringify(packageJson, null, 2));

    // TypeScript config
    const tsconfig = {
      compilerOptions: {
        target: "ES2022",
        module: "commonjs",
        lib: ["ES2022"],
        outDir: "./dist",
        rootDir: "./src",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        moduleResolution: "node",
      },
      include: ["src/**/*"],
      exclude: ["node_modules", "dist", "**/*.test.ts"],
    };
    this.addFile(files, "tsconfig.json", JSON.stringify(tsconfig, null, 2));

    // Main application
    this.addFile(
      files,
      "src/index.ts",
      `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { itemsRouter } from './routes/items';
import { healthRouter } from './routes/health';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Routes
app.use('/health', healthRouter);
app.use('/api/v1/items', itemsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(\`${svc} running on port \${PORT}\`);
});

export default app;
`
    );

    // Health routes
    this.addFile(
      files,
      "src/routes/health.ts",
      `import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ status: 'healthy', service: '${svc}' });
});

router.get('/ready', (req, res) => {
  res.json({ status: 'ready', service: '${svc}' });
});

export { router as healthRouter };
`
    );

    // Items routes
    this.addFile(
      files,
      "src/routes/items.ts",
      `import { Router, Request, Response } from 'express';

const router = Router();

interface Item {
  id: number;
  name: string;
  description?: string;
}

let items: Item[] = [];
let counter = 0;

router.get('/', (req: Request, res: Response) => {
  res.json(items);
});

router.post('/', (req: Request, res: Response) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  counter++;
  const newItem: Item = { id: counter, name, description };
  items.push(newItem);
  res.status(201).json(newItem);
});

router.get('/:id', (req: Request, res: Response) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json(item);
});

router.delete('/:id', (req: Request, res: Response) => {
  const index = items.findIndex(i => i.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  items.splice(index, 1);
  res.status(204).send();
});

export { router as itemsRouter };
`
    );

    // Config
    this.addFile(
      files,
      ".env.example",
      `PORT=3000
NODE_ENV=development
`
    );

    this.addFile(
      files,
      ".gitignore",
      `node_modules/
dist/
.env
.DS_Store
*.log
coverage/
`
    );

    // Tests
    this.addFile(
      files,
      "jest.config.js",
      `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
};
`
    );

    // Docker
    if (this.config.docker) {
      this.addFile(
        files,
        "Dockerfile",
        `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
`
      );

      this.addFile(
        files,
        ".dockerignore",
        `node_modules
dist
.env
.git
.gitignore
*.log
coverage
`
      );
    }

    // Kubernetes
    if (this.config.k8s) {
      this.addFile(
        files,
        "k8s/base/deployment.yaml",
        `apiVersion: apps/v1
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
        - containerPort: 3000
        resources:
          requests:
            cpu: ${this.config.resources.cpuRequest}
            memory: ${this.config.resources.memoryRequest}
          limits:
            cpu: ${this.config.resources.cpuLimit}
            memory: ${this.config.resources.memoryLimit}
        env:
        - name: PORT
          value: "3000"
        - name: NODE_ENV
          value: "production"
`
      );

      this.addFile(
        files,
        "k8s/base/service.yaml",
        `apiVersion: v1
kind: Service
metadata:
  name: ${svc}
  labels:
    app: ${svc}
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
  selector:
    app: ${svc}
`
      );

      this.addFile(
        files,
        "k8s/base/kustomization.yaml",
        `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
commonLabels:
  app: ${svc}
`
      );
    }

    // README
    if (this.config.docs) {
      this.addFile(
        files,
        "README.md",
        `# ${svc}
A production-ready Node.js/Express API service generated by IDP CLI.
## Getting Started
npm install
npm run dev
API available at http://localhost:3000
`
      );
    }

    return files;
  }
}
