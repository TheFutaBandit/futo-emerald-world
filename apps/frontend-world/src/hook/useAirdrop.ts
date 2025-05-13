import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { useState } from "react";
import useAuthContext from "./useAuthContext";

const BACKEND_URL = "http://159.89.162.31";
interface airdropTokenResponse {
    requestAirdropFunction : () => Promise<any>,
    loading: boolean,
    err: string | null,
    tx: string | null,
}

interface postResponse {
    success: boolean,
    message: string | null,
    tx: string | null
}



export default function useAirdrop() : airdropTokenResponse {
    const [loading, setLoading] = useState<boolean>(false);
    const [err, setErr] = useState<string | null>(null);
    const [tx, setTx] = useState<string | null>(null);

    const wallet = useWallet();
    const {token} = useAuthContext();

    const requestAirdropFunction = async () => {
        setLoading(true);
        try {
            const requestAirdrop = await axios.post<postResponse>(`${BACKEND_URL}/api/v1/airdrop`, {
                    userWallet: wallet.publicKey?.toString()
                }, {
                    headers : {
                        Authorization: `Bearer ${token}`
                    }
                });
            const airdropData = requestAirdrop.data;
    
            if(!airdropData.success) throw new Error('Error in dropping');

            setTx(airdropData.tx);
            
        } catch(err : any) {
            console.error(err);
            setErr(err);
        } finally {
            setLoading(false);
        }
    }

    

    return {
        requestAirdropFunction,
        loading,
        err, 
        tx
    }
}