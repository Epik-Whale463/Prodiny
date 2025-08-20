# Deployment Guide for Prodiny Platform

## Prerequisites
- GitHub account
- Render account (free tier available)
- Your code pushed to GitHub

## Backend Deployment Steps

### 1. Prepare Backend for Production
```bash
cd backend
# Update requirements.txt with specific versions
# Create production server file
```

### 2. Environment Variables for Backend
In Render dashboard, set these environment variables:
- `JWT_SECRET_KEY`: Generate a secure random string
- `CORS_ORIGINS`: https://your-frontend-url.onrender.com
- `ENVIRONMENT`: production

### 3. Deploy Backend
- Connect your GitHub repository
- Select backend folder as root directory
- Build command: `pip install -r requirements.txt`
- Start command: `python server.py`

## Frontend Deployment Steps

### 1. Prepare Frontend for Production
```bash
cd frontend
# Update next.config.ts for static export
# Set environment variables
```

### 2. Environment Variables for Frontend
- `NEXT_PUBLIC_API_URL`: https://your-backend-url.onrender.com
- `NODE_ENV`: production

### 3. Deploy Frontend
- Build command: `npm ci && npm run build`
- Publish directory: `out`

## Database Setup
- Use Render's PostgreSQL service or continue with SQLite for simplicity
- For SQLite: Ensure database file is in a persistent directory

## Post-Deployment
1. Test API endpoints
2. Verify CORS settings
3. Check frontend-backend communication
4. Monitor logs for any issues
