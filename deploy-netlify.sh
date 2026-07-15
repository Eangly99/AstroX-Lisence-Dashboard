#!/usr/bin/env bash
# Deploy to Netlify (Bash)
# This script configures environment variables on Netlify and deploys the dashboard.

set -e

# Auto-detect directory and navigate to the project folder if run from the root
if [ "$(basename "$PWD")" = "cipher-license-bot" ]; then
    echo "Navigating to cipher-dash..."
    cd cipher-dash
fi

# Ensure Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Netlify CLI not found. Installing globally..."
    npm install -g netlify-cli
fi

# Check Netlify auth status
echo "Verifying Netlify login status..."
if ! netlify status --json | grep -q '"userId"'; then
    echo "Not logged in. Running netlify login..."
    netlify login
fi

# Link site if not linked
if [ ! -d ".netlify" ]; then
    echo "Linking site to Netlify..."
    netlify link
fi

# Read local .env if it exists and sync environment variables
ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
    echo "Found local .env file. Syncing environment variables to Netlify..."
    while IFS= read -r line || [ -n "$line" ]; do
        # Strip comments and whitespace
        clean_line=$(echo "$line" | sed -e 's/#.*//' -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
        if [ -n "$clean_line" ] && [[ "$clean_line" == *"="* ]]; then
            key=$(echo "$clean_line" | cut -d'=' -f1 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
            value=$(echo "$clean_line" | cut -d'=' -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
            if [ -n "$value" ]; then
                echo "Setting Netlify environment variable: $key"
                netlify env:set "$key" "$value"
            fi
        fi
    done < "$ENV_FILE"
else
    echo "Local .env file not found at $ENV_FILE. Skipping environment variable sync."
    echo "Make sure to set NEXT_PUBLIC_API_URL, AUTH_SECRET, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, ADMIN_DISCORD_IDS, and HMAC_SECRET manually in your Netlify dashboard."
fi

# Ensure AUTH_TRUST_HOST is set to true for NextAuth v5 in production on Netlify
echo "Configuring AUTH_TRUST_HOST on Netlify..."
netlify env:set AUTH_TRUST_HOST "true"

# Build and Deploy
echo "Building and deploying to Netlify Production..."
netlify deploy --prod --build
