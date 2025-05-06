import {
    createTransferInstruction,
    createAssociatedTokenAccountInstruction,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TokenOwnerOffCurveError
} from "@solana/spl-token";
import {
    Connection,
    Keypair,
    ParsedAccountData,
    PublicKey,
    sendAndConfirmTransaction,
    Transaction,
    Signer
} from "@solana/web3.js";

import type { Account } from "@solana/spl-token";

import {
    TokenAccountNotFoundError,
    TokenInvalidAccountOwnerError,
    TokenInvalidMintError,
    TokenInvalidOwnerError
} from "@solana/spl-token";

import type { Commitment, ConfirmOptions } from "@solana/web3.js";
import { getAccount } from "@solana/spl-token";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";


import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { Request, Response } from "express";


const SOLANA_RPC_NET = 'https://api.devnet.solana.com';

const SOLANA_CONNECTION = new Connection(SOLANA_RPC_NET);

const MINT_ADDRESS = 'mnteCTzzYLmuu4pV26oLrrm1rv4zjEpufRv2DsuguEb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

const BOSS_WALLET_KEY = JSON.parse(process.env.BOSS_WALLET_KEY || '[]');
const FROM_KEYPAIR = Keypair.fromSecretKey(new Uint8Array(BOSS_WALLET_KEY));
const FROM_PUBLIC_KEY = FROM_KEYPAIR.publicKey;
console.log(`Using boss wallet: ${FROM_PUBLIC_KEY.toString()}`);

async function getNumberDecimals(mintAddress: string): Promise<number> {
    const info = await SOLANA_CONNECTION.getParsedAccountInfo(new PublicKey(MINT_ADDRESS));
    const result = (info.value?.data as ParsedAccountData).parsed.info.decimals as number;
    return result;
}

async function getAssociatedTokenAddress(
    mint: PublicKey,
    owner: PublicKey,
    allowOwnerOffCurve = false,
    programId = TOKEN_2022_PROGRAM_ID,
    associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID,
): Promise<PublicKey> {
    if (!allowOwnerOffCurve && !PublicKey.isOnCurve(owner.toBuffer())) throw new TokenOwnerOffCurveError();

    const [address] = await PublicKey.findProgramAddress(
        [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
        associatedTokenProgramId,
    );

    return address;
}

async function createSourceATAIfNotExist() {
    const associatedTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(MINT_ADDRESS),
        FROM_PUBLIC_KEY,
    );
    const accountInfo = await SOLANA_CONNECTION.getAccountInfo(associatedTokenAccount);

    if (accountInfo === null) {
        console.log(`Source ATA for ${MINT_ADDRESS} and ${FROM_PUBLIC_KEY.toString()} does not exist. Creating...`);
        const transaction = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                FROM_KEYPAIR.publicKey, // payer
                associatedTokenAccount, // associatedTokenAccount
                FROM_PUBLIC_KEY, // owner
                new PublicKey(MINT_ADDRESS) // mint
            )
        );
        const latestBlockHash = await SOLANA_CONNECTION.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = latestBlockHash.blockhash;
        transaction.feePayer = FROM_PUBLIC_KEY;
        transaction.sign(FROM_KEYPAIR);

        const signature = await sendAndConfirmTransaction(SOLANA_CONNECTION, transaction, [FROM_KEYPAIR]);
        console.log(`Source ATA created successfully! Transaction: ${signature}`);
    } else {
        console.log(`Source ATA for ${MINT_ADDRESS} and ${FROM_PUBLIC_KEY.toString()} already exists: ${associatedTokenAccount.toString()}`);
    }
    return associatedTokenAccount;
}

async function getOrCreateAssociatedTokenAccount(
    connection: Connection,
    payer: Signer,
    mint: PublicKey,
    owner: PublicKey,
    allowOwnerOffCurve = false,
    commitment?: Commitment,
    confirmOptions?: ConfirmOptions,
    programId = TOKEN_2022_PROGRAM_ID,
    associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID,
): Promise<Account> {
    const associatedToken = getAssociatedTokenAddressSync(
        mint,
        owner,
        allowOwnerOffCurve,
        programId,
        associatedTokenProgramId,
    );

    // This is the optimal logic, considering TX fee, client-side computation, RPC roundtrips and guaranteed idempotent.
    // Sadly we can't do this atomically.
    let account: Account;
    try {
        account = await getAccount(connection, associatedToken, commitment, programId);
    } catch (error: unknown) {
        // TokenAccountNotFoundError can be possible if the associated address has already received some lamports,
        // becoming a system account. Assuming program derived addressing is safe, this is the only case for the
        // TokenInvalidAccountOwnerError in this code path.
        if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
            // As this isn't atomic, it's possible others can create associated accounts meanwhile.
            try {
                const transaction = new Transaction().add(
                    createAssociatedTokenAccountInstruction(
                        payer.publicKey,
                        associatedToken,
                        owner,
                        mint,
                        programId,
                        associatedTokenProgramId,
                    ),
                );

                await sendAndConfirmTransaction(connection, transaction, [payer], confirmOptions);
            } catch (error: unknown) {
                // Ignore all errors; for now there is no API-compatible way to selectively ignore the expected
                // instruction error if the associated account exists already.
            }

            // Now this should always succeed
            account = await getAccount(connection, associatedToken, commitment, programId);
        } else {
            throw error;
        }
    }

    if (!account.mint.equals(mint)) throw new TokenInvalidMintError();
    if (!account.owner.equals(owner)) throw new TokenInvalidOwnerError();

    return account;
}

export default async function rewardTokens(rewardAmount : number, userWallet : any): Promise<any> {
    try {
        const TRANSFER_AMOUNT = rewardAmount;

        const DESTINATION_WALLET = new PublicKey(userWallet);

        console.log(`Sending ${TRANSFER_AMOUNT} ${(MINT_ADDRESS)} from ${(FROM_PUBLIC_KEY.toString())} to ${(DESTINATION_WALLET)}.`)

        // Step 1: Ensure Source ATA exists
        console.log(`1 - Ensuring Source Token Account exists`);
        const sourceAccountAddress = await createSourceATAIfNotExist();
        const sourceAccountInfo = await SOLANA_CONNECTION.getAccountInfo(sourceAccountAddress);
        if (!sourceAccountInfo) {
            console.error("Error: Source Token Account not found after creation attempt.");
            return;
        }
        console.log(`   Source Account: ${sourceAccountAddress.toString()}`);

        // Step 2: Get or Create Destination Token Account
        console.log(`2 - Getting or Creating Destination Token Account`);
        const destinationAccount = await getOrCreateAssociatedTokenAccount(
            SOLANA_CONNECTION,
            FROM_KEYPAIR, // payer
            new PublicKey(MINT_ADDRESS), // mint
            new PublicKey(DESTINATION_WALLET), // owner
        );
        console.log(`   Destination Account: ${destinationAccount.address.toString()}`);

        // Step 3: Fetch Number of Decimals for Mint:
        console.log(`3 - Fetching Number of Decimals for Mint: ${MINT_ADDRESS}`);
        const numberDecimals = await getNumberDecimals(MINT_ADDRESS);
        console.log(`   Number of Decimals: ${numberDecimals}`);

         // Step 4: Create and Send Transaction
        console.log(`4 - Creating and Sending Transaction`);
        const tx = new Transaction();
        tx.add(createTransferInstruction(
            sourceAccountAddress,
            destinationAccount.address,
            FROM_PUBLIC_KEY,
            TRANSFER_AMOUNT * Math.pow(10, numberDecimals),
            [],
            TOKEN_2022_PROGRAM_ID 
        ));

        const latestBlockHash = await SOLANA_CONNECTION.getLatestBlockhash('confirmed');
        tx.recentBlockhash = latestBlockHash.blockhash;
        tx.feePayer = FROM_PUBLIC_KEY;
        tx.sign(FROM_KEYPAIR);

        const signature = await sendAndConfirmTransaction(SOLANA_CONNECTION, tx, [FROM_KEYPAIR]);
        console.log(
            '\x1b[32m', // Green Text
            `   Transaction Success!🎉`,
            `\n   https://explorer.solana.com/tx/${signature}?cluster=devnet`
        );

        return {
            message: 'Transaction Success',
            signature: signature,
            transactionUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
            success: true
        };

    } catch (error: any) {
        console.error('Error transferring tokens:', error);
        return {
            message: 'Error transferring tokens',
            error: error.message,
            success: false
        }
    } 
}  

