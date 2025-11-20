# Contentful Products API

A NestJS-based REST API that syncs product data from Contentful and provides public and private endpoints for product management and reporting.

## Features

- **Automated Sync**: Fetches product data from Contentful API every hour
- **Public Products API**: Paginated product listing with filtering (name, category, price range)
- **Soft Delete**: Products can be deleted and won't reappear after sync
- **Private Reports**: JWT-protected endpoints for analytics
- **Swagger Documentation**: API docs available at `/api/docs`

## Tech Stack

- **Node.js**: Active LTS (v20)
- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **API Documentation**: Swagger
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Node.js 20+ (LTS)
- Docker and Docker Compose
- PostgreSQL 16+ (if running without Docker)
- Contentful account with API credentials

## Setup Instructions

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd backend-test
```

2. Create a `.env` file from the example:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - Database credentials
   - Contentful API credentials (SPACE_ID, ACCESS_TOKEN, CONTENT_TYPE)
   - JWT secret (use a strong secret in production)
   - Auth credentials for login endpoint

4. Start the services:
```bash
docker compose up -d
```

The API will be available at `http://localhost:3000`

### Manual Setup

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database:
```bash
# Create database
createdb products_db

# Or using psql
psql -U postgres -c "CREATE DATABASE products_db;"
```

3. Configure environment variables (see `.env.example`)

4. Run migrations (TypeORM will auto-sync schema):
```bash
npm run start:dev
```

5. Build and run:
```bash
npm run build
npm run start:prod
```

## Database Configuration

The application uses PostgreSQL with TypeORM. Database connection is configured via environment variables:

- `DB_HOST`: Database host (default: localhost)
- `DB_PORT`: Database port (default: 5432)
- `DB_USER`: Database username
- `DB_PASS`: Database password
- `DB_NAME`: Database name

**Note**: `synchronize: true` is enabled for development. In production, use migrations instead.

## Contentful Configuration

1. Get your Contentful credentials:
   - Space ID
   - Environment ID (usually "master")
   - Access Token (Content Delivery API token)
   - Content Type ID for products

2. Set these in your `.env` file:
```env
CONTENTFUL_SPACE_ID=your-space-id
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_ACCESS_TOKEN=your-access-token
CONTENTFUL_CONTENT_TYPE=product
```

## Initial Data Refresh

The sync runs automatically every hour. To trigger manually:

1. Wait for the next scheduled run (hourly)
2. Or restart the application (sync runs on startup if configured)

## API Endpoints

### Public Endpoints

#### Get Products