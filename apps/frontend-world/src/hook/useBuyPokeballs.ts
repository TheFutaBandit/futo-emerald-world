import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

import { 
    createTransferInstruction, 
    getAssociatedTokenAddressSync,
    TOKEN_2022_PROGRAM_ID 
  } from '@solana/spl-token';



export default function useBuyPokeballs() {
    const { connection } = useConnection();
    const { publicKey, signTransaction } = useWallet();

    const [loading, setLoading] = useState<boolean>(false);
    const [err, setErr] = useState<string | null>(null);
    const [tx, setTx] = useState<string | null>(null);

    const BOSS_WALLET_ADDRESS = new PublicKey('7YcM2pScrnZEjoDu2STaS83BtmDujJHZ86Ei9CUnUeCL');
    const MINT_ADDRESS = new PublicKey('mnteCTzzYLmuu4pV26oLrrm1rv4zjEpufRv2DsuguEb');

    const buyPokeballsFunction = async(amount: number = 10, cost: number = 10) => {
        if(!publicKey || !signTransaction) {
            setErr('Wallet not connected');
            return;
        }

        try {
            setLoading(true);
            setErr(null);
            setTx(null);

            const userTokenAccount = getAssociatedTokenAddressSync(
                MINT_ADDRESS,
                publicKey,
                false,
                TOKEN_2022_PROGRAM_ID
            );

            const bossTokenAccount = getAssociatedTokenAddressSync(
                MINT_ADDRESS,
                BOSS_WALLET_ADDRESS,
                false,
                TOKEN_2022_PROGRAM_ID
            );

            const transferInstruction = createTransferInstruction(
                userTokenAccount,
                bossTokenAccount,
                publicKey,
                cost * Math.pow(10, 9),
                [],
                TOKEN_2022_PROGRAM_ID
            )

            const transaction = new Transaction().add(transferInstruction);

            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            const signedTransaction = await signTransaction(transaction);

            const signature = await connection.sendRawTransaction(signedTransaction.serialize());

            console.log('Transaction Signature', signature);

            const confirmation = await connection.confirmTransaction({
                blockhash,
                lastValidBlockHeight,
                signature
            });

            if(confirmation.value.err) {
                throw new Error(`Transaction failed: ${confirmation.value.err}`);
            }

            console.log('Transaction confirmed');
            setTx(signature);

            //backend update about inventory

            const flag = true;

            if(flag) {
                console.log(`Successfully purchased ${amount} pokeballs!`);
                return {
                  success: true,
                  signature,
                };
            } else {
                throw new Error('Failed to update inventory');
            }
        } catch (error: any) {
            console.error('Error buying pokeballs:', error);
            setErr(error.message);
            return {
                success: false,
                error: error.message
            };
        } finally {
            setLoading(false);
        }
    }

    return {
        buyPokeballsFunction, 
        loading, 
        err, 
        tx
    };    

}