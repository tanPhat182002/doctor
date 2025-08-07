This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database or Supabase account
- Git
- Docker (for containerized deployment)

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🐳 Docker Deployment

### Local Development with Docker
```bash
# Build and run with Docker Compose
docker-compose up --build

# Run Prisma Studio (optional)
docker-compose --profile tools up prisma-studio
```

### CI/CD Deployment with GitHub Actions

This project includes automated deployment to EC2 using GitHub Actions and Docker Hub.

#### Setup Required Secrets
Add these secrets to your GitHub repository:

```
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-password
DATABASE_URL=your-database-connection-string
DIRECT_URL=your-direct-database-connection
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret
NEXT_PUBLIC_API_URL=https://your-domain.com
```

#### Deployment Process
1. Push to `deploy-with-docker-ec2` branch
2. GitHub Actions will:
   - Build Docker image
   - Push to Docker Hub
   - Deploy to self-hosted EC2 runner
   - Clean up old containers and images

#### Self-hosted Runner Setup
On your EC2 instance:
1. Install Docker
2. Setup GitHub Actions self-hosted runner
3. Ensure runner has access to Docker commands

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
