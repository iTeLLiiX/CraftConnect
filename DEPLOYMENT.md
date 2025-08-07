# Deployment Guide für CraftConnect

## 1. Vercel Deployment (Empfohlen)

### 1.1 Vorbereitung
```bash
# Stellen Sie sicher, dass alle Änderungen committed sind
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 1.2 Vercel CLI Installation
```bash
npm install -g vercel
```

### 1.3 Vercel Login
```bash
vercel login
```

### 1.4 Deployment
```bash
# Erste Deployment
vercel

# Für Produktion
vercel --prod
```

### 1.5 Umgebungsvariablen in Vercel
Gehen Sie zu Ihrem Vercel Dashboard und fügen Sie diese Umgebungsvariablen hinzu:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_NAME=CraftConnect
NEXT_PUBLIC_APP_DESCRIPTION=Handwerker-Vermittlungsplattform

# Production Configuration
NODE_ENV=production
NEXT_PUBLIC_DEBUG=false
```

### 1.6 Custom Domain (Optional)
1. Gehen Sie zu **Settings > Domains**
2. Fügen Sie Ihre Domain hinzu
3. Konfigurieren Sie die DNS-Einträge
4. Aktualisieren Sie die Umgebungsvariablen

## 2. Docker Deployment

### 2.1 Dockerfile erstellen
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2.2 Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  craftconnect:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    restart: unless-stopped
```

### 2.3 Docker Deployment
```bash
# Build und Start
docker-compose up -d

# Logs anzeigen
docker-compose logs -f

# Stoppen
docker-compose down
```

## 3. Kubernetes Deployment

### 3.1 Namespace erstellen
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: craftconnect
```

### 3.2 ConfigMap für Umgebungsvariablen
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: craftconnect-config
  namespace: craftconnect
data:
  NEXT_PUBLIC_APP_NAME: "CraftConnect"
  NEXT_PUBLIC_APP_DESCRIPTION: "Handwerker-Vermittlungsplattform"
  NODE_ENV: "production"
  NEXT_PUBLIC_DEBUG: "false"
```

### 3.3 Secret für sensitive Daten
```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: craftconnect-secrets
  namespace: craftconnect
type: Opaque
data:
  NEXT_PUBLIC_SUPABASE_URL: <base64-encoded-url>
  NEXT_PUBLIC_SUPABASE_ANON_KEY: <base64-encoded-key>
  SUPABASE_SERVICE_ROLE_KEY: <base64-encoded-service-key>
  NEXT_PUBLIC_APP_URL: <base64-encoded-app-url>
```

### 3.4 Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: craftconnect
  namespace: craftconnect
spec:
  replicas: 3
  selector:
    matchLabels:
      app: craftconnect
  template:
    metadata:
      labels:
        app: craftconnect
    spec:
      containers:
      - name: craftconnect
        image: craftconnect:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: craftconnect-config
        - secretRef:
            name: craftconnect-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 3.5 Service
```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: craftconnect-service
  namespace: craftconnect
spec:
  selector:
    app: craftconnect
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

### 3.6 Ingress (für SSL/TLS)
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: craftconnect-ingress
  namespace: craftconnect
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: craftconnect-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: craftconnect-service
            port:
              number: 80
```

### 3.7 Kubernetes Deployment ausführen
```bash
# Namespace erstellen
kubectl apply -f k8s/namespace.yaml

# ConfigMap und Secret erstellen
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Deployment starten
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# Status überprüfen
kubectl get pods -n craftconnect
kubectl get services -n craftconnect
kubectl get ingress -n craftconnect
```

## 4. AWS CDK Deployment

### 4.1 CDK Setup
```bash
# CDK installieren
npm install -g aws-cdk

# CDK initialisieren
cdk init app --language typescript

# Dependencies installieren
npm install
```

### 4.2 CDK Stack
```typescript
// lib/craftconnect-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';

export class CraftconnectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'CraftConnectVPC', {
      maxAzs: 2,
      natGateways: 1,
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'CraftConnectCluster', {
      vpc,
      containerInsights: true,
    });

    // Application Load Balancer Fargate Service
    const loadBalancedFargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'CraftConnectService', {
      cluster,
      memoryLimitMiB: 1024,
      cpu: 512,
      desiredCount: 2,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset('.'),
        containerPort: 3000,
        environment: {
          NODE_ENV: 'production',
          NEXT_PUBLIC_APP_NAME: 'CraftConnect',
        },
        secrets: {
          NEXT_PUBLIC_SUPABASE_URL: ecs.Secret.fromSecretsManager(
            cdk.SecretValue.secretsManager('craftconnect/supabase-url')
          ),
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ecs.Secret.fromSecretsManager(
            cdk.SecretValue.secretsManager('craftconnect/supabase-anon-key')
          ),
        },
      },
      publicLoadBalancer: true,
    });

    // Auto Scaling
    const scaling = loadBalancedFargateService.service.autoScaleTaskCount({
      maxCapacity: 10,
      minCapacity: 2,
    });

    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    // S3 Bucket für Uploads
    const uploadBucket = new s3.Bucket(this, 'CraftConnectUploads', {
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'CraftConnectDistribution', {
      defaultBehavior: {
        origin: new origins.LoadBalancerV2Origin(loadBalancedFargateService.loadBalancer),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/uploads/*': {
          origin: new origins.S3Origin(uploadBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
      },
    });

    // Outputs
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: loadBalancedFargateService.loadBalancer.loadBalancerDnsName,
    });

    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: distribution.distributionDomainName,
    });
  }
}
```

### 4.3 CDK Deploy
```bash
# CDK Bootstrap (nur beim ersten Mal)
cdk bootstrap

# Deploy
cdk deploy

# Destroy (wenn nötig)
cdk destroy
```

## 5. CI/CD Pipeline

### 5.1 GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm ci
    - run: npm run lint
    - run: npm run type-check
    - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm ci
    - run: npm run build
    - uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 6. Monitoring und Logging

### 6.1 Health Check Endpoint
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      return NextResponse.json(
        { status: 'error', message: 'Database connection failed' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Health check failed' },
      { status: 503 }
    );
  }
}
```

### 6.2 Logging Configuration
```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});
```

## 7. Performance Optimierung

### 7.1 Next.js Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['supabase.co', 'lh3.googleusercontent.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ],
};

module.exports = nextConfig;
```

## 8. Backup und Recovery

### 8.1 Database Backup
```bash
# Supabase Backup (automatisch)
# Gehen Sie zu Supabase Dashboard > Settings > Database > Backups

# Manueller Export
pg_dump -h your-project-ref.supabase.co -U postgres -d postgres > backup.sql
```

### 8.2 File Backup
```bash
# S3 Backup Script
aws s3 sync s3://your-upload-bucket s3://your-backup-bucket/$(date +%Y-%m-%d)
```

---

**Wichtige Deployment-Checkliste:**

- [ ] Umgebungsvariablen konfiguriert
- [ ] Supabase Auth Redirect URLs aktualisiert
- [ ] SSL/TLS Zertifikate installiert
- [ ] Health Check Endpoint implementiert
- [ ] Monitoring und Logging eingerichtet
- [ ] Backup-Strategie definiert
- [ ] Performance-Tests durchgeführt
- [ ] Security Headers konfiguriert
- [ ] Error Handling implementiert
- [ ] CI/CD Pipeline getestet
