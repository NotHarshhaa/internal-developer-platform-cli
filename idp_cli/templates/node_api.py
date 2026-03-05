"""Node.js API (Express) service template."""

from pathlib import Path

from idp_cli.templates.base import BaseTemplate
from idp_cli.utils.file_utils import write_file


class NodeAPITemplate(BaseTemplate):
    """Generate a production-ready Node.js Express API service."""

    @property
    def template_name(self) -> str:
        return "node-api"

    @property
    def language(self) -> str:
        return "javascript"

    @property
    def framework(self) -> str:
        return "express"

    def generate_app_code(self) -> None:
        svc = self.service_name
        src_dir = self.service_dir / "src"

        write_file(
            src_dir / "index.js",
            f'''const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const {{ healthRouter }} = require('./routes/health');
const {{ apiRouter }} = require('./routes/api');
const {{ config }} = require('./config');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/', healthRouter);
app.use('/api/v1', apiRouter);

// Error handling
app.use((err, req, res, next) => {{
  console.error(err.stack);
  res.status(500).json({{ error: 'Internal Server Error' }});
}});

const PORT = config.port || 3000;

app.listen(PORT, () => {{
  console.log(`{svc} running on port ${{PORT}}`);
}});

module.exports = app;
''',
        )

        write_file(
            src_dir / "config" / "index.js",
            f'''const config = {{
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  serviceName: '{svc}',
  logLevel: process.env.LOG_LEVEL || 'info',
}};

module.exports = {{ config }};
''',
        )

        write_file(
            src_dir / "routes" / "health.js",
            f'''const express = require('express');
const healthRouter = express.Router();

healthRouter.get('/health', (req, res) => {{
  res.json({{ status: 'healthy', service: '{svc}' }});
}});

healthRouter.get('/ready', (req, res) => {{
  res.json({{ status: 'ready', service: '{svc}' }});
}});

module.exports = {{ healthRouter }};
''',
        )

        write_file(
            src_dir / "routes" / "api.js",
            '''const express = require('express');
const apiRouter = express.Router();

let items = [];
let counter = 0;

apiRouter.get('/items', (req, res) => {
  res.json(items);
});

apiRouter.post('/items', (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  counter++;
  const item = { id: counter, name, description: description || null };
  items.push(item);
  res.status(201).json(item);
});

apiRouter.get('/items/:id', (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json(item);
});

apiRouter.delete('/items/:id', (req, res) => {
  items = items.filter((i) => i.id !== parseInt(req.params.id));
  res.status(204).send();
});

module.exports = { apiRouter };
''',
        )

    def generate_config_files(self) -> None:
        svc = self.service_name

        write_file(
            self.service_dir / "package.json",
            f'''{{
  "name": "{svc}",
  "version": "0.1.0",
  "description": "Auto-generated service by IDP CLI",
  "main": "src/index.js",
  "scripts": {{
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest --coverage",
    "lint": "eslint src/ --ext .js"
  }},
  "dependencies": {{
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "prom-client": "^15.1.0"
  }},
  "devDependencies": {{
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "nodemon": "^3.0.3",
    "supertest": "^6.3.4"
  }}
}}
''',
        )

        write_file(
            self.service_dir / ".env.example",
            f"""# {svc} environment configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
""",
        )

        write_file(
            self.service_dir / ".gitignore",
            """node_modules/
dist/
coverage/
.env
*.log
.DS_Store
""",
        )

    def generate_tests(self) -> None:
        tests_dir = self.service_dir / "tests"

        write_file(
            tests_dir / "health.test.js",
            '''const request = require('supertest');
const app = require('../src/index');

describe('Health Endpoints', () => {
  test('GET /health returns healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  test('GET /ready returns ready status', async () => {
    const res = await request(app).get('/ready');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ready');
  });
});
''',
        )

        write_file(
            tests_dir / "api.test.js",
            '''const request = require('supertest');
const app = require('../src/index');

describe('API Endpoints', () => {
  test('GET /api/v1/items returns empty array', async () => {
    const res = await request(app).get('/api/v1/items');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('POST /api/v1/items creates an item', async () => {
    const res = await request(app)
      .post('/api/v1/items')
      .send({ name: 'Test Item', description: 'A test' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Test Item');
  });

  test('POST /api/v1/items without name returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/items')
      .send({ description: 'Missing name' });
    expect(res.statusCode).toBe(400);
  });
});
''',
        )
