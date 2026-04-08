# Deployment Guide

## Local Development Setup

### Windows
Run the setup script:
```bash
setup_local.bat
```

Then activate the virtual environment:
```bash
venv\Scripts\activate.bat
```

### Linux/Mac
Run the setup script:
```bash
chmod +x setup_local.sh
./setup_local.sh
```

Then activate the virtual environment:
```bash
source venv/bin/activate
```

### Run the Application
```bash
python app.py
```

The app will run on `http://localhost:10000`

## Render Deployment

### Prerequisites
- A Render account
- Your GROQ API key

### Steps

1. Push your code to GitHub

2. Connect your repository to Render:
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. Render will automatically detect the Dockerfile

4. Configure environment variables:
   - Add `GROQ_API_KEY` with your Groq API key
   - `PORT` is automatically set to 10000

5. Deploy!

### Alternative: Using render.yaml

If you have the `render.yaml` file in your repo, Render will automatically configure everything. Just:
- Connect your repo
- Render reads the `render.yaml` configuration
- Add your `GROQ_API_KEY` in the environment variables section

## Changes Made

- Removed Ollama dependency (langchain-ollama)
- Switched to Groq-only implementation
- Created Dockerfile optimized for Render free tier
- Added .dockerignore to reduce image size
- Created setup scripts for local development
- Updated requirements.txt to remove unnecessary dependencies

## Memory Optimization

The Groq-only implementation significantly reduces memory usage:
- No local LLM models needed
- Lighter dependency footprint
- Better suited for Render's free tier (512MB RAM)
