#!/bin/bash
# Navigate to the repo root
cd ../..

# Install pnpm
npm install -g pnpm

# Install only ws-server and its dependencies
pnpm install --filter="ws-server..." --filter="@repo/db"

# Build the DB package first
pnpm run build --filter="@repo/db" || true

# Then build the ws-server
cd apps/ws-server
pnpm run build