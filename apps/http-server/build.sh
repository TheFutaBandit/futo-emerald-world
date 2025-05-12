#!/bin/bash
# Navigate to the repo root
cd ../..

# Install pnpm
npm install -g pnpm

# Install only http-server and its dependencies
pnpm install --filter="http-server..." --filter="@repo/db"

# Build the DB package first
pnpm run build --filter="@repo/db"

# Push the database schema
cd packages/db
npx prisma db push

# Then build the http-server
cd ../../apps/http-server
pnpm run build