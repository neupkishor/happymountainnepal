#!/bin/bash

# Deployment script for AWS server
# This script sets up the base storage files on the server

echo "Setting up base storage files..."

# Create the base directory if it doesn't exist
mkdir -p src/base

# Check if files already exist
if [ -f "src/base/manager.json" ]; then
    echo "⚠️  manager.json already exists. Skipping..."
else
    echo "Creating manager.json from template..."
    cp src/base/manager.template.json src/base/manager.json
    echo "✅ Created manager.json - PLEASE UPDATE WITH PRODUCTION CREDENTIALS!"
fi

if [ -f "src/base/session.json" ]; then
    echo "⚠️  session.json already exists. Skipping..."
else
    echo "Creating session.json from template..."
    cp src/base/session.template.json src/base/session.json
    echo "✅ Created session.json"
fi

if [ -f "src/base/navigation-components.json" ]; then
    echo "⚠️  navigation-components.json already exists. Skipping..."
else
    echo "Creating navigation-components.json from template..."
    cp src/base/navigation-components.template.json src/base/navigation-components.json
    echo "✅ Created navigation-components.json"
fi

if [ -f "src/base/redirects.json" ]; then
    echo "⚠️  redirects.json already exists. Skipping..."
else
    echo "Creating redirects.json from template..."
    cp src/base/redirects.template.json src/base/redirects.json
    echo "✅ Created redirects.json"
fi

# Set secure permissions
chmod 600 src/base/manager.json
chmod 600 src/base/session.json
chmod 644 src/base/navigation-components.json
chmod 644 src/base/redirects.json

echo ""
echo "✅ Base storage setup complete!"
echo ""
echo "⚠️  IMPORTANT: Update src/base/manager.json with your production credentials"
echo "   Current credentials are from the template and should be changed!"
