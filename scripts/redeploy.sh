#!/bin/bash

# Quick Redeploy Script
echo "🔄 Redeploying BSC App..."

# Stop PM2
echo "⏹️  Stopping PM2..."
pm2 stop bsc-app || true

# Rebuild
echo "🔨 Building..."
npm run build

# Restart PM2
echo "🚀 Starting PM2..."
pm2 restart ecosystem.config.js

# Show status
echo "✅ Done! Status:"
pm2 status

echo ""
echo "📝 Check logs: pm2 logs bsc-app"
echo "🌐 Access: http://45.80.181.4:3017"
