# Docker PostgreSQL Setup for LeaseUp

This directory contains a Docker Compose configuration to run PostgreSQL locally for development.

## Quick Start

1. **Start the database:**

   ```bash
   cd packages/prisma
   docker-compose up -d
   ```

2. **Set up environment variables:**
   Add these to your `.env` file in the project root:

   ```env
   # PostgreSQL Database URLs
   POSTGRES_URL="postgresql://leaseup:leaseup_dev_password@localhost:5432/leaseup_dev"
   POSTGRES_PRISMA_URL="postgresql://leaseup:leaseup_dev_password@localhost:5432/leaseup_dev"

   # Individual connection parameters
   POSTGRES_HOST="localhost"
   POSTGRES_USER="leaseup"
   POSTGRES_PASSWORD="leaseup_dev_password"
   POSTGRES_DATABASE="leaseup_dev"
   POSTGRES_PORT="5432"
   POSTGRES_URL_NON_POOLING="postgresql://leaseup:leaseup_dev_password@localhost:5432/leaseup_dev"
   ```

3. **Run Prisma migrations:**

   ```bash
   npx prisma migrate dev
   ```

4. **Seed the database (optional):**
   ```bash
   npm run seed
   ```

## Services

### PostgreSQL Database

- **Image:** `postgres:15-alpine`
- **Port:** `5432`
- **Database:** `leaseup_dev`
- **Username:** `leaseup`
- **Password:** `leaseup_dev_password`

### pgAdmin (Optional)

- **Image:** `dpage/pgadmin4:latest`
- **Port:** `8080`
- **Email:** `admin@leaseup.dev`
- **Password:** `admin`
- **URL:** http://localhost:8080

## Useful Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f postgres

# Access PostgreSQL CLI
docker-compose exec postgres psql -U leaseup -d leaseup_dev

# Reset database (WARNING: This will delete all data)
docker-compose down -v
docker-compose up -d

# Backup database
docker-compose exec postgres pg_dump -U leaseup leaseup_dev > backup.sql

# Restore database
docker-compose exec -T postgres psql -U leaseup -d leaseup_dev < backup.sql
```

## Configuration Details

- **Data Persistence:** Database data is stored in a Docker volume `postgres_data`
- **Health Checks:** PostgreSQL includes health checks to ensure the service is ready
- **Network:** Services run on a custom network `leaseup-network`
- **Restart Policy:** Services restart automatically unless manually stopped

## Troubleshooting

1. **Port already in use:** If port 5432 is already in use, change it in the docker-compose.yml file
2. **Permission issues:** Ensure Docker has the necessary permissions to create volumes
3. **Connection refused:** Wait for the health check to pass before connecting to the database

## Security Note

The default credentials are for development only. Never use these credentials in production.
