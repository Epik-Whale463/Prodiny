import uvicorn
import os
from app import app

if __name__ == "__main__":
    # Production server configuration
    port = int(os.getenv("PORT", 8000))
    host = "0.0.0.0"  # Required for Render deployment
    
    # Run with production settings
    uvicorn.run(
        "app:app",
        host=host,
        port=port,
        workers=1,  # Single worker for Render free tier
        reload=False,  # Disable reload in production
        access_log=True,
        log_level="info"
    )
