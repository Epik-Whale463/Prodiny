#!/bin/bash

# Prodiny Deployment Script for Render

echo "🚀 Preparing Prodiny for deployment..."

# Backend preparation
echo "📦 Preparing backend..."
cd backend

# Ensure all dependencies are listed
echo "fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pydantic==2.5.0
python-dotenv==1.0.0
gunicorn==21.2.0" > requirements.txt

echo "✅ Backend ready for deployment"

# Frontend preparation
echo "📦 Preparing frontend..."
cd ../frontend

# Install dependencies
npm install

# Update package.json scripts for production
npm pkg set scripts.build="next build && next export"

echo "✅ Frontend ready for deployment"

# Go back to root
cd ..

echo "🎉 Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Push code to GitHub"
echo "2. Connect repository to Render"
echo "3. Set environment variables"
echo "4. Deploy services"
