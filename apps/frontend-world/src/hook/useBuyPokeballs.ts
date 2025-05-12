import { 
    useState 
} from 'react';

import { 
    useConnection, 
    useWallet 
} from '@solana/wallet-adapter-react';

import {
    createTransferInstruction,
    createAssociatedTokenAccountInstruction,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    getAccount
} from "@solana/spl-token";

import {
    PublicKey,
    Transaction,
} from "@solana/web3.js";
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL;


export default function useBuyPokeballs() {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [loading, setLoading] = useState<boolean>(false);
    const [err, setErr] = useState<string | null>(null);
    const [tx, setTx] = useState<string | null>(null);

    const BOSS_WALLET_ADDRESS = new PublicKey('boswbs31EkPMqWxZXdg5dExycARpikXkB3qMpH3YEjs');
    const MINT_ADDRESS = new PublicKey('mnteCTzzYLmuu4pV26oLrrm1rv4zjEpufRv2DsuguEb');

    
    const buyPokeballsFunction = async(amount: number = 10, cost: number = 100, userId: string, type : string = "standard") => {
        if(!publicKey) {
            setErr('Wallet not connected');
            return { success: false, error: 'Wallet not connected' };
        }

        try {
            setLoading(true);
            setErr(null);
            setTx(null);

            // Get the user's token account
            const userTokenAccount = await getAssociatedTokenAddress(
                MINT_ADDRESS,
                publicKey,
                false,
                TOKEN_2022_PROGRAM_ID
            );
            console.log("User token account:", userTokenAccount.toString());

            // Get the boss's token account
            const bossTokenAccount = await getAssociatedTokenAddress(
                MINT_ADDRESS,
                BOSS_WALLET_ADDRESS,
                false,
                TOKEN_2022_PROGRAM_ID
            );
            console.log("Boss token account:", bossTokenAccount.toString());

            const transaction = new Transaction();

            // Check if the user's token account exists, create it if not
            try {
                await getAccount(connection, userTokenAccount, 'confirmed', TOKEN_2022_PROGRAM_ID);
                console.log("User token account exists");
            } catch (error) {
                console.log("Creating user token account");
                // Create the user's token account
                transaction.add(
                    createAssociatedTokenAccountInstruction(
                        publicKey,
                        userTokenAccount,
                        publicKey,
                        MINT_ADDRESS,
                        TOKEN_2022_PROGRAM_ID,
                        ASSOCIATED_TOKEN_PROGRAM_ID
                    )
                );
            }

            // Add the transfer instruction
            // Make sure to use the TOKEN_2022_PROGRAM_ID here
            transaction.add(
                createTransferInstruction(
                    userTokenAccount,
                    bossTokenAccount,
                    publicKey,
                    cost * (10**9), // Assuming 9 decimals
                    [],
                    TOKEN_2022_PROGRAM_ID
                )
            );

            // Send the transaction
            const signature = await sendTransaction(transaction, connection);
            console.log("Transaction sent:", signature);

            // Wait for confirmation
            const confirmation = await connection.confirmTransaction(signature, 'confirmed');
            if (confirmation.value.err) {
                throw new Error(`Transaction failed: ${confirmation.value.err}`);
            }

            //backend logic here
            //try catch block for purchasing
            try {
                console.log("sending request to backend")
                const purchaseResponse = await axios.post(`${BACKEND_URL}/api/v1/pokeball/purchase`, {
                    transactionSignature: tx,
                    pokeballType: type,
                    quantity: amount,
                    userId
                });

                const { success } = purchaseResponse.data;

                if(success) {
                    setTx("tx");
                    const updatedInventory = purchaseResponse.data.inventory;
                    console.log(`Backend updated, purchased ${amount} ${type} pokeballs!`);
                    return { 
                        success: true, 
                        signature: "tx", 
                        inventory: updatedInventory,
                        userId
                    };
                    
                } else {
                    throw new Error(purchaseResponse.data.message || 'Failed to update backend');
                }
            } catch (err: any) {
                console.log('axios post request failed')
                throw new Error(err)
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