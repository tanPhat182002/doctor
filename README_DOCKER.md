# 🐳 Docker Quick Start

## Prerequisites
- Docker Desktop installed and running
- Git (to clone the repository)

## Quick Commands

```bash
# 🚀 Interactive Docker menu
npm run docker:run

# 📦 Build Docker images
npm run docker:build

# ⚡ Start full stack
npm run docker:up

# 🛑 Stop all services
npm run docker:down

# 📋 View logs
npm run docker:logs

# 🧹 Clean up everything
npm run docker:clean
```

## Services

| Service | URL | Description |
|---------|-----|-------------|
| **App** | http://localhost:3000 | Next.js Application |
| **Database** | localhost:5432 | PostgreSQL Database |
| **Prisma Studio** | http://localhost:5555 | Database Management |

## Environment Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Update variables in `.env.local`:**
   ```bash
   DATABASE_URL="postgresql://postgres:password@localhost:5432/petmanagement"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   ```

## Development Workflows

### 🔧 Local Development with Docker Database
```bash
# Start only database
docker-compose up db -d

# Run app locally
npm run dev
```

### 🐳 Full Docker Development
```bash
# Start everything
npm run docker:up

# View logs
npm run docker:logs
```

### 🗄️ Database Management
```bash
# Start Prisma Studio
npm run prisma:studio

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed
```

## Troubleshooting

### Docker not running
```bash
ERROR: Cannot connect to the Docker daemon
```
**Solution:** Start Docker Desktop

### Port already in use
```bash
ERROR: Port 3000 is already allocated
```
**Solution:** Stop conflicting services or change ports in `docker-compose.yml`

### Database connection failed
```bash
ERROR: Connection refused
```
**Solution:** 
1. Check if database container is running: `docker-compose ps`
2. Restart services: `npm run docker:down && npm run docker:up`

## File Structure

```
📁 pet-management/
├── 🐳 Dockerfile              # Main app container
├── 🐳 Dockerfile.prisma       # Prisma Studio container
├── 🐳 docker-compose.yml      # Service orchestration
├── 🐳 .dockerignore           # Build optimization
├── 📁 scripts/
│   ├── 🔧 docker-build.sh     # Build script
│   └── 🚀 docker-run.sh       # Interactive run script
├── 📖 DOCKER_GUIDE.md         # Detailed documentation
└── 📖 README_DOCKER.md        # This quick start guide
```

## Next Steps

1. **Development:** Use `npm run docker:run` for interactive menu
2. **Production:** See `VERCEL_DEPLOYMENT.md` for cloud deployment
3. **Advanced:** Read `DOCKER_GUIDE.md` for detailed configuration

---

💡 **Tip:** Use `npm run docker:run` for an interactive menu with all options!