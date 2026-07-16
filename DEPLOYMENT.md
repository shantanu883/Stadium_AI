# 🚀 Deployment Guide

## Overview
This guide covers secure deployment of Stadium AI for production environments with emphasis on security, performance, and reliability.

## 🏗️ Production Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Load Balancer │────│  Web Application │────│    Database     │
│   (CloudFlare)  │    │   (Node.js/PM2)  │    │   (PostgreSQL)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
    ┌────▼────┐              ┌────▼────┐              ┌────▼────┐
    │   CDN   │              │  Redis  │              │ Backups │
    │ Assets  │              │ Session │              │ Storage │
    └─────────┘              └─────────┘              └─────────┘
```

## 🔧 Environment Setup

### 1. Server Requirements
- **OS**: Ubuntu 22.04 LTS or CentOS 8+
- **Node.js**: v18+ (LTS recommended)
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Storage**: 50GB+ SSD
- **Network**: HTTPS (Port 443), SSH (Port 22)

### 2. Dependencies Installation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx as reverse proxy
sudo apt install nginx -y

# Install certbot for SSL certificates
sudo apt install certbot python3-certbot-nginx -y
```

### 3. Application Setup

```bash
# Clone repository
git clone https://github.com/your-org/stadium-ai.git
cd stadium-ai

# Install dependencies
npm install

# Build application
npm run build

# Set up environment variables
cp .env.example .env.production
```

## ⚙️ Environment Configuration

### Production Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=3001

# Security
ALLOWED_ORIGINS=https://stadiumai.com,https://www.stadiumai.com
SESSION_SECRET=your-super-secure-session-secret-here
JWT_SECRET=your-jwt-secret-minimum-32-characters

# API Keys
GEMINI_API_KEY=your-production-gemini-key

# Database (when implemented)
DATABASE_URL=postgresql://user:password@localhost:5432/stadiumai
REDIS_URL=redis://localhost:6379

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn-for-error-tracking

# Email/Notifications
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=notifications@stadiumai.com
SMTP_PASS=your-smtp-password

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS=true
```

### Environment Security

```bash
# Secure environment file
sudo chown app:app .env.production
sudo chmod 600 .env.production

# Create app user (don't run as root)
sudo useradd -m -s /bin/bash app
sudo usermod -aG sudo app
```

## 🔐 SSL/TLS Configuration

### 1. Obtain SSL Certificate

```bash
# Using Let's Encrypt (recommended for production)
sudo certbot --nginx -d stadiumai.com -d www.stadiumai.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

### 2. Nginx Configuration

```nginx
# /etc/nginx/sites-available/stadiumai.com
server {
    listen 80;
    server_name stadiumai.com www.stadiumai.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name stadiumai.com www.stadiumai.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/stadiumai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stadiumai.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    # Static files
    location / {
        root /var/www/stadiumai/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 3. Enable Site

```bash
# Enable site and restart nginx
sudo ln -s /etc/nginx/sites-available/stadiumai.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔄 Process Management with PM2

### 1. PM2 Ecosystem File

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'stadium-ai',
    script: 'dist-server/server/index.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    
    // Logging
    log_file: '/var/log/stadiumai/combined.log',
    out_file: '/var/log/stadiumai/out.log',
    error_file: '/var/log/stadiumai/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Auto-restart configuration
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Health monitoring
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true
  }],
  
  deploy: {
    production: {
      user: 'app',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-org/stadium-ai.git',
      path: '/var/www/stadiumai',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};
```

### 2. Start Application

```bash
# Create log directory
sudo mkdir -p /var/log/stadiumai
sudo chown app:app /var/log/stadiumai

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u app --hp /home/app
```

## 📊 Monitoring & Logging

### 1. PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Application logs
pm2 logs stadium-ai

# Process status
pm2 status

# Restart application
pm2 restart stadium-ai

# Reload with zero-downtime
pm2 reload stadium-ai
```

### 2. System Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# System resource monitoring
htop
iotop
nethogs
```

### 3. Log Rotation

```bash
# Configure logrotate
sudo tee /etc/logrotate.d/stadiumai > /dev/null <<EOF
/var/log/stadiumai/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 app app
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

## 🛡️ Security Hardening

### 1. Firewall Configuration

```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Check status
sudo ufw status verbose
```

### 2. System Security

```bash
# Update packages regularly
sudo apt update && sudo apt upgrade -y

# Install fail2ban
sudo apt install fail2ban -y

# Configure fail2ban for nginx
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
EOF

sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Application Security

```bash
# Remove unnecessary packages
sudo apt autoremove -y

# Disable unused services
sudo systemctl disable apache2 2>/dev/null || true

# Secure shared memory
echo "tmpfs /run/shm tmpfs defaults,noexec,nosuid 0 0" | sudo tee -a /etc/fstab
```

## 🔄 Deployment Workflow

### 1. Automated Deployment

```bash
# Using PM2 Deploy
pm2 deploy production

# Or manual deployment
git pull origin main
npm install
npm run build
pm2 reload stadium-ai --update-env
```

### 2. Health Checks

```bash
#!/bin/bash
# healthcheck.sh

# Check if application is running
if ! pm2 describe stadium-ai > /dev/null; then
    echo "Application is not running"
    exit 1
fi

# Check HTTP response
if ! curl -f -s http://localhost:3001/api/health > /dev/null; then
    echo "Health check failed"
    exit 1
fi

echo "Application is healthy"
exit 0
```

### 3. Rollback Strategy

```bash
# Quick rollback using PM2
pm2 deploy production revert 1

# Manual rollback
git checkout previous-working-commit
npm run build
pm2 reload stadium-ai
```

## 📈 Performance Optimization

### 1. Nginx Optimization

```nginx
# Add to main nginx.conf
worker_processes auto;
worker_connections 1024;

# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types
    text/plain
    text/css
    text/js
    text/xml
    text/javascript
    application/javascript
    application/json
    application/xml+rss;
```

### 2. Node.js Optimization

```bash
# Set optimal Node.js flags
export NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=128"

# Enable clustering in PM2
pm2 start ecosystem.config.js --env production
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -ti:3001
   sudo kill -9 <PID>
   ```

2. **Permission denied**
   ```bash
   sudo chown -R app:app /var/www/stadiumai
   sudo chmod +x /var/www/stadiumai/dist-server/server/index.js
   ```

3. **SSL certificate issues**
   ```bash
   sudo certbot renew --force-renewal
   sudo systemctl reload nginx
   ```

4. **High memory usage**
   ```bash
   pm2 reload stadium-ai
   pm2 monit
   ```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] SSL certificates obtained
- [ ] Nginx configuration tested
- [ ] Firewall rules configured
- [ ] Monitoring setup complete

### Deployment
- [ ] Code built successfully
- [ ] Health checks passing
- [ ] PM2 processes running
- [ ] Nginx serving correctly
- [ ] SSL/HTTPS working

### Post-Deployment
- [ ] Application accessible via HTTPS
- [ ] API endpoints responding
- [ ] Logs being generated
- [ ] Monitoring alerts configured
- [ ] Backup systems verified

---

*This deployment guide ensures a secure, scalable, and maintainable Stadium AI production environment.*