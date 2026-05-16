# Kimi WebBridge Integration Skill

This skill enables Kimi WebBridge browser automation with mindweave-platform for automated tasks like content creation, product management, and customer service operations.

## Overview

Kimi WebBridge is a browser extension that allows AI agents to control Chrome/Edge browsers programmatically - clicking, filling forms, navigating, and extracting data. This integration connects it with mindweave-platform for end-to-end automation.

## Prerequisites

- Google Chrome or Microsoft Edge browser installed
- Kimi WebBridge extension installed
- Node.js 18+ for platform backend
- Access to mindweave-platform repository

## Installation

### Step 1: Install Kimi WebBridge

```bash
curl -fsSL https://kimi-web-img.moonshot.cn/webbridge/install.sh | bash
```

### Step 2: Install Browser Extension

1. Download the extension from Chrome Web Store (search for "Kimi WebBridge")
2. Or manually load from: `~/.kimi-webbridge/extension/`

### Step 3: Configure Platform

```bash
cd mindweave-platform
npm install
cp .env.example .env
```

## Usage

### Run Automation Scripts

```bash
npm install playwright

# Use .cjs extension (required for CommonJS)
node scripts/create-content.cjs --type blog --title "Your Title"
node scripts/manage-product.cjs --action create --name "Product" --price 99
```

## Configuration

Edit `config.json` to customize the automation settings.

## Troubleshooting

- Ensure WebBridge extension is connected
- Check platform URL in config
- Increase delay if pages load slowly