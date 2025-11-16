# SvelteKit Node.js Server - Docker Setup

This project now uses `@sveltejs/adapter-node` to generate a standalone Node.js server.

## Build and Run with Docker

### Build the Docker image

```bash
docker build -t solagratia-app .
```

### Run the container

```bash
docker run -p 3000:3000 solagratia-app
```

The application will be available at `http://localhost:3000`

### Run with environment variables

```bash
docker run -p 3000:3000 -e VITE_SG_API=https://api.example.com solagratia-app
```

### Docker Compose (optional)

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - HOST=0.0.0.0
      - PORT=3000
      # Add your environment variables here
      # - VITE_SG_API=https://api.example.com
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

## Multi-Stage Build Benefits

The Dockerfile uses a multi-stage build:
- **Stage 1 (builder)**: Installs all dependencies and builds the app
- **Stage 2 (runner)**: Creates a minimal production image with only runtime dependencies

This results in:
- Smaller final image size
- Faster deployment
- Better security (no dev dependencies in production)

## Local Development

```bash
npm install
npm run dev
```

## Build for Production (without Docker)

```bash
npm run build
node build
```

## Configuration

The adapter-node is configured in `svelte.config.js` with output directory set to `build/`.

Environment variables can be passed at runtime or set in the Dockerfile/docker-compose.yml.
