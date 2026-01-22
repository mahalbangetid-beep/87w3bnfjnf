#!/bin/bash

# =============================================
# VPS Deployment Script for ourproject.app
# =============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deploying ourproject.app to VPS${NC}"
echo -e "${GREEN}========================================${NC}"

# Configuration
APP_DIR="/var/www/ourproject"
REPO_URL="https://github.com/mahalbangetid-beep/87w3bnfjnf.git"

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}Please don't run as root. Run as regular user with sudo access.${NC}"
    exit 1
fi

# Step 1: Update system
echo -e "\n${YELLOW}[1/7] Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Step 2: Install dependencies
echo -e "\n${YELLOW}[2/7] Installing dependencies...${NC}"
sudo apt install -y curl wget git build-essential nginx

# Install Node.js 20.x if not installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Installing Node.js 20.x...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installing PM2...${NC}"
    sudo npm install -g pm2
fi

echo -e "Node version: $(node -v)"
echo -e "NPM version: $(npm -v)"
echo -e "PM2 version: $(pm2 -v)"

# Step 3: Setup app directory
echo -e "\n${YELLOW}[3/7] Setting up application directory...${NC}"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Clone or pull repository
if [ -d "$APP_DIR/.git" ]; then
    echo -e "${YELLOW}Repository exists, pulling latest changes...${NC}"
    cd $APP_DIR
    git pull origin main
else
    echo -e "${YELLOW}Cloning repository...${NC}"
    git clone $REPO_URL $APP_DIR
fi

# Step 4: Setup Backend
echo -e "\n${YELLOW}[4/7] Setting up backend...${NC}"
cd $APP_DIR/workspace-server

# Install dependencies
npm install --production

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}ERROR: .env file not found!${NC}"
    echo -e "${YELLOW}Please create .env file with required configuration.${NC}"
    echo -e "Required variables: PORT, JWT_SECRET, ENCRYPTION_KEY, SESSION_SECRET, FRONTEND_URL"
    exit 1
fi

# Create uploads directory
mkdir -p uploads

# Step 5: Setup Frontend
echo -e "\n${YELLOW}[5/7] Setting up frontend...${NC}"
cd $APP_DIR/workspace-app

# Install dependencies
npm install

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}Creating .env.production...${NC}"
    cat > .env.production << EOF
VITE_API_BASE_URL=https://api.ourproject.app
VITE_APP_NAME=Our Project
VITE_APP_URL=https://ourproject.app
EOF
fi

# Build frontend
echo -e "${YELLOW}Building frontend for production...${NC}"
npm run build

# Step 6: Setup Nginx
echo -e "\n${YELLOW}[6/7] Configuring Nginx...${NC}"

# Copy nginx config
sudo cp $APP_DIR/deploy/nginx.conf /etc/nginx/sites-available/ourproject.app

# Enable site
sudo ln -sf /etc/nginx/sites-available/ourproject.app /etc/nginx/sites-enabled/

# Remove default site if exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Step 7: Start/Restart PM2
echo -e "\n${YELLOW}[7/7] Starting application with PM2...${NC}"
cd $APP_DIR

# Copy ecosystem config
cp deploy/ecosystem.config.js .

# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Stop existing if running
pm2 delete workspace-api 2>/dev/null || true

# Start with ecosystem
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Setup PM2 startup
pm2 startup systemd -u $USER --hp $HOME | tail -1 | sudo bash

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e ""
echo -e "Frontend: https://ourproject.app"
echo -e "API:      https://api.ourproject.app"
echo -e ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Make sure SSL certificates are configured"
echo -e "2. Add api.ourproject.app DNS record in Cloudflare"
echo -e "3. Test the application"
echo -e ""
echo -e "${GREEN}Useful commands:${NC}"
echo -e "  pm2 logs workspace-api  - View API logs"
echo -e "  pm2 monit               - Monitor processes"
echo -e "  pm2 restart all         - Restart all apps"
