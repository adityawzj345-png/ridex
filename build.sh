#!/bin/bash
set -e

# Build the frontend
echo "Building the frontend..."
cd frontend
npm install
npm run build
cd ..

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt
python migrate_db.py || true
cd ..

echo "Build completed successfully!"
