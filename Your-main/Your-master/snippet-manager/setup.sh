#!/bin/bash
# SnipVCS - Code Snippet Manager Setup Script
# Run this from the snippet-manager directory

set -e

echo "Installing dependencies..."
npm install

echo ""
echo "Setup complete! Run the dev server with:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser."
