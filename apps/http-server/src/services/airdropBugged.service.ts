// import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
// import { 
//   createTransferInstruction, 
//   getOrCreateAssociatedTokenAccount,
//   ASSOCIATED_TOKEN_PROGRAM_ID,
//   TOKEN_2022_PROGRAM_ID,
// } from "@solana/spl-token";
// import { Request, Response } from "express";
// import * as dotenv from 'dotenv';
// import { fileURLToPath } from 'url';
// import { dirname, resolve } from 'path';

// // Get the directory path in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Load environment variables
// dotenv.config({ path: resolve(__dirname, '../../.env') });

// const BOSS_WALLET_KEY = JSON.parse(process.env.BOSS_WALLET_KEY || '[]');
// const TOKEN_MINT_ADDRESS = process.env.TOKEN_MINT_ADDRESS as string;

// const SOLANA_RPC_NET = "https://api.devnet.solana.com";

// console.log(`Using token mint: ${TOKEN_MINT_ADDRESS}`);

// // Validate boss wallet key
// if (!Array.isArray(BOSS_WALLET_KEY) || BOSS_WALLET_KEY.length !== 64) {
//     throw new Error('BOSS_WALLET_KEY must be an array of 64 numbers');
// }

// // CRITICAL: Use the Token Extensions Program ID instead of the original Token Program ID
// const TOKEN_EXTENSIONS_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

// export const AirdropService = async(req: Request, res: Response): Promise<any> => {
//     try {
//         const { userWallet } = req.body;

//         if(!userWallet) {
//             return res.status(400).json({message: 'Recipient wallet required'});
//         }
        
//         console.log(`Processing airdrop request for wallet: ${userWallet}`);

//         const connection = new Connection(SOLANA_RPC_NET, {
//             commitment: 'confirmed',
//             confirmTransactionInitialTimeout: 60000
//         });

//         const boss_wallet = Keypair.fromSecretKey(
//             Uint8Array.from(BOSS_WALLET_KEY)
//         );
//         console.log(`Boss wallet: ${boss_wallet.publicKey.toString()}`);

//         const tokenMint = new PublicKey(TOKEN_MINT_ADDRESS);
//         const userPublicKey = new PublicKey(userWallet);
        
//         console.log(`Token Mint: ${tokenMint.toString()}`);
//         console.log(`User Public Key: ${userPublicKey.toString()}`);

//         // Check if the mint is using the Token Extensions Program
//         const mintInfo = await connection.getParsedAccountInfo(tokenMint);
//         console.log(`Mint owner: ${mintInfo.value?.owner.toString()}`);
        
//         // Explicitly pass the Token Extensions Program ID with CORRECT PARAMETER ORDER
//         console.log('Creating sender token account...');
//         const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
//             connection,
//             boss_wallet,
//             tokenMint,
//             boss_wallet.publicKey,
//             false,                      // allowOwnerOffCurve
//             'confirmed',                // commitment
//             TOKEN_EXTENSIONS_PROGRAM_ID // programId
//         );
//         console.log(`Sender token account: ${senderTokenAccount.address.toString()}`);
        
//         console.log('Creating recipient token account...');
//         const userTokenAccount = await getOrCreateAssociatedTokenAccount(
//             connection,
//             boss_wallet,
//             tokenMint,
//             userPublicKey,               // commitment
//             TOKEN_2022_PROGRAM_ID // programId
//         );
//         console.log(`Recipient token account: ${userTokenAccount.address.toString()}`);
        
//         // Check sender balance
//         console.log(`Sender token balance: ${senderTokenAccount.amount.toString()}`);
        
//         // Amount to transfer
//         const transferAmount = 1000 * (10**9);
        
//         // Create transfer instruction with the correct program ID
//         console.log(`Creating transfer instruction for ${transferAmount} tokens`);
//         const transferInstruction = createTransferInstruction(
//             senderTokenAccount.address,
//             userTokenAccount.address,
//             boss_wallet.publicKey,
//             transferAmount,
//             [],                         // No multisig signers (optional)
//             TOKEN_EXTENSIONS_PROGRAM_ID // programId (optional)
//         );

//         // Build and send transaction
//         const transaction = new Transaction().add(transferInstruction);
//         transaction.feePayer = boss_wallet.publicKey;
        
//         console.log('Sending transaction...');
//         const signature = await sendAndConfirmTransaction(
//             connection,
//             transaction,
//             [boss_wallet],
//             {
//                 skipPreflight: false,
//                 preflightCommitment: 'confirmed',
//                 commitment: 'confirmed'
//             }
//         );
        
//         console.log(`Transaction confirmed: ${signature}`);

//         return res.status(200).json({
//             success: true,
//             signature,
//             explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
//         });
//     } catch(error: any) {
//         console.error('Airdrop error:', error);
//         return res.status(400).json({
//             message: "failed",
//             error: error.message
//         });
//     }
// }