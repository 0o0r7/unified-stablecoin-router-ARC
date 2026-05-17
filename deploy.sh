#!/bin/bash

# Deploy script for Unified-Stablecoin-Router-ARCTESTNET
# Run this script to push your code to GitHub

REPO_NAME="Unified-Stablecoin-Router-ARCTESTNET"
GITHUB_USER="0o0r7"

echo "Creating GitHub repository..."
curl -s -X POST https://api.github.com/user/repos \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"Ethereum DApp for ARC Testnet\",\"private\":false}"

echo "Adding remote and pushing..."
git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git
git push -u origin main

echo "Done! Your code is now on GitHub."
