# Deploy to Netlify (PowerShell)
# This script configures environment variables on Netlify and deploys the dashboard.

$ErrorActionPreference = "Stop"

# Ensure Netlify CLI is installed
if (!(Get-Command netlify -ErrorAction SilentlyContinue)) {
    Write-Host "Netlify CLI not found. Installing globally..." -ForegroundColor Yellow
    npm install -g netlify-cli
}

# Check Netlify auth status
Write-Host "Verifying Netlify login status..." -ForegroundColor Cyan
$authCheck = netlify status --json | ConvertFrom-Json
if (!$authCheck.userId) {
    Write-Host "Not logged in. Running netlify login..." -ForegroundColor Yellow
    netlify login
}

# Link site if not linked
if (!(Test-Path "astrox-license-dash\.netlify")) {
    Write-Host "Linking site to Netlify..." -ForegroundColor Yellow
    netlify link --dir astrox-license-dash
}

# Read local .env if it exists and sync environment variables
$envFile = "astrox-license-dash\.env"
if (Test-Path $envFile) {
    Write-Host "Found local .env file. Syncing environment variables to Netlify..." -ForegroundColor Cyan
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and !$line.StartsWith("#") -and $line.Contains("=")) {
            $split = $line.Split("=", 2)
            $key = $split[0].Trim()
            $value = $split[1].Trim()
            if ($value) {
                Write-Host "Setting Netlify environment variable: $key" -ForegroundColor Gray
                netlify env:set $key "$value" --dir astrox-license-dash
            }
        }
    }
} else {
    Write-Host "Local .env file not found at $envFile. Skipping environment variable sync." -ForegroundColor Yellow
    Write-Host "Make sure to set NEXT_PUBLIC_API_URL, AUTH_SECRET, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, ADMIN_DISCORD_IDS, and HMAC_SECRET manually in your Netlify dashboard." -ForegroundColor Yellow
}

# Ensure AUTH_TRUST_HOST is set to true for NextAuth v5 in production on Netlify
Write-Host "Configuring AUTH_TRUST_HOST on Netlify..." -ForegroundColor Cyan
netlify env:set AUTH_TRUST_HOST "true" --dir astrox-license-dash

# Build and Deploy
Write-Host "Building and deploying to Netlify Production..." -ForegroundColor Green
netlify deploy --prod --build --dir astrox-license-dash
