# PokéVille: A Pokémon-Inspired Solana Gambling Game

PokéVille is a multiplayer Pokémon-inspired web application where players can explore a 2D world, encounter and catch rare Pokémon using different types of Pokéballs, and earn rewards on the Solana blockchain. The game combines nostalgic Pokémon-style gameplay with blockchain technology to create a unique gaming experience.

Live Application Link: https://futoisland.com/
Tutorial Link (Reccomended to watch first) : https://x.com/BanditFuto/status/1921809566787948933

## 🎮 Game Features

- **Multiplayer Exploration**: Navigate a 2D tile-based world with real-time player interactions
- **Pokémon Encounters**: Find and interact with Pokémon throughout the game world
- **Catching Mechanics**: Use different types of Pokéballs (Standard, Great, Ultra) with varying catch rates
- **Token Economy**: Earn PokéCoins on successful catches based on Pokémon rarity and difficulty
- **In-game Inventory**: Manage your Pokéballs and other items through a reactive inventory system

## 💻 Technical Overview

PokéVille is built as a full-stack application with several interconnected components:

### Architecture

```
├── apps/
│   ├── frontend-world/     # React-based frontend application
│   ├── http-server/        # Express REST API server
│   └── ws-server/          # WebSocket server for real-time multiplayer
└── packages/
    └── db/                 # Shared database models and Prisma schema
```

### Technology Stack

- **Frontend**: React, Phaser.js for game rendering
- **Backend**: Express.js, WebSockets (ws)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based auth system
- **Blockchain**: Solana Web3.js, SPL Token for in-game economy

## 🚀 Key Components

### Game Engine (Phaser.js)
The core gameplay is powered by Phaser.js, providing:
- Tile-based map navigation
- Character animations and movement
- Collision detection
- Pokémon encounters and interaction logic

### WebSocket Server
Real-time multiplayer functionality including:
- Player position synchronization
- Multiple player rendering
- Room-based gameplay

### Blockchain Integration
Solana blockchain integration for:
- Token-based economy using SPL Tokens
- PokéCoin rewards for successful catches
- In-game item purchases (Pokéballs)
- Airdrops for new players

### Authentication System
Secure user management with:
- Username/password authentication
- JWT token generation and validation
- Protected routes for authenticated actions

## 🔧 Game Mechanics

### Pokémon Encounter System
Pokémon have various attributes affecting gameplay:
- **Type**: The Pokémon species (e.g., Solgaleo)
- **Bounty**: Base reward value
- **Multiplier**: Reward multiplier based on rarity
- **Difficulty**: Catch difficulty rating

### Pokéball System
Three tiers of Pokéballs with different catch rates:
- **Standard Pokéball**: Basic catch rate
- **Great Ball**: Improved catch rate
- **Ultra Ball**: Highest catch rate

### Catching Algorithm
The catching system uses a probability-based algorithm:
- Calculate catch chance based on Pokéball type and Pokémon difficulty
- Success rewards player with PokéCoins (Bounty × Multiplier)
- Failure consumes the Pokéball without reward

## 🔄 Data Flow

1. User authenticates via the REST API
2. Frontend connects to WebSocket server for real-time updates
3. Game scene loads with Phaser.js rendering the world
4. Player movement sends updates through WebSockets to other players
5. Pokémon encounters trigger the catch interface
6. Successful catches initiate blockchain transactions for rewards

## 🛠️ Setup and Installation

### Prerequisites
- Node.js (v14+)
- pnpm package manager
- PostgreSQL database
- Solana CLI tools (for local testing)

### Installation Steps
1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/pokeville.git
   cd pokeville
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Configure your database and Solana wallet settings
   ```

4. Push database schema
   ```bash
   cd packages/db
   npx prisma db push
   ```

5. Build the applications
   ```bash
   pnpm run build
   ```

6. Start the servers
   ```bash
   pnpm run start
   ```

## 🌐 Deployment

The application is deployed at [futoisland.com](https://futoisland.com) and consists of:

- Frontend static assets served via a CDN
- WebSocket server for real-time gameplay
- HTTP REST API for authentication and transactions
- Solana devnet integration for blockchain features

## 🔒 Security Considerations

- JWT tokens for secure authentication
- Server-side validation of all blockchain transactions
- Rate limiting on Solana-related endpoints
- Validation of all user inputs using Zod schemas

## 🔮 Future Plans

- Additional Pokémon types with unique abilities
- PVP battle system between players
- Marketplace for trading caught Pokémon as NFTs
- Expanded world map with different regions
- Integration with Solana mainnet

---

## 🌟 Credits

Developed by FutoBandit - An homage to Pokémon Emerald and a celebration of childhood nostalgia through modern web and blockchain technology.

*This project is not affiliated with Nintendo or The Pokémon Company and is created for educational purposes only.*
