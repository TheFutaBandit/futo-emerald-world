import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import useBuyPokeballs from "../../hook/useBuyPokeballs.js";
import useAuthContext from "../../hook/useAuthContext.js";
import { useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { EventBus } from "../../game/EventBus.js";
import useAirdrop from '../../hook/useAirdrop';
import { useConnection } from "@solana/wallet-adapter-react";
import '../styles/inventoryStyles.css'
import { LAMPORTS_PER_SOL } from "@solana/web3.js";


import { Wallet } from "lucide-react";
import { Backpack } from "lucide-react";

const BACKEND_URL = "http://localhost:3000"

interface customJwtPayload {
    id: string,
    userRole: string
}

interface Inventory {
    standardPokeball: number;
    greatPokeball: number;
    ultraPokeball: number;
}



export function InventorySection() {
    const { publicKey } = useWallet();
    const { requestAirdropFunction, loading: airdropLoading, err: airdropErr, tx: airdropTx } = useAirdrop()
    const {buyPokeballsFunction, loading, err, tx} = useBuyPokeballs();
    const [inventory, setInventory] = useState<Inventory>();
    const [balance, setBalance] = useState(0);
    const { connection } = useConnection();

    const { token } = useAuthContext();

    let { id } = jwtDecode<customJwtPayload>(token!);


    useEffect(() => {
        console.log("inventory bus: ", EventBus);

        const catchAttemptCallback = async () => {
            try {
                console.log("hey do I even send a request for update")
                const updateResponse = await axios.post(`${BACKEND_URL}/api/v1/pokeball/update`, {
                    userId: id,
                    pokeballType: "standard",
                    usedCount: 1
                })

                console.log(updateResponse.data);

                if(updateResponse.data.success) {
                    setInventory(updateResponse.data.inventory);
                } else {
                    console.error("bad request")
                }
            } catch(err: any) {
                throw new Error(err);
            }
        }
        
        EventBus.addListener('catch-attempt', catchAttemptCallback);

        EventBus.on('get-inventory-for-scene', () => {
            console.log("sending payload inventory");
            EventBus.emit('receive-inventory', {inventory: inventory});
        })

        return () => {
            EventBus.removeListener('catch-attempt', catchAttemptCallback);
            EventBus.removeListener('get-inventory-for-scene')
        }
    }, [])

    useEffect(() => {
        if(id) {
            fetchInventory()
        }
    }, [id])

    useEffect(() => {
        const updateBalance = async () => {
          if (publicKey) {
            connection.onAccountChange(
              publicKey,
              (updatedAccountInfo) => {
                setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL);
              },
              {
                commitment: "confirmed"
              }
            );

            const accountInfo = await connection.getAccountInfo(publicKey);

            if (accountInfo) {
              setBalance(accountInfo.lamports / LAMPORTS_PER_SOL);
            } else {
              throw new Error("Account info not found");
            }
          } else {
            console.error("Wallet not connected or connection unavailable");
          }
        };
    
        updateBalance();
      }, [connection, publicKey]);

    const fetchInventory = async(): Promise<Inventory | null> => {
        try {
            console.log("alright I am sending the fetch request now");
            const response = await axios.get(`${BACKEND_URL}/api/v1/pokeball/inventory`, {
                params: {
                    id
                }
            });
            const fetchedInventory = response.data.inventory;
            setInventory(fetchedInventory);
            return fetchedInventory;
        } catch(err) {
            console.error("Error in fetching: ", err)
            return null;
        }
    }

    async function handleBuyPokeball() {
        if(!publicKey) {
            console.log("Wallet not connected");
            return;
        }

        try {
            const result = await buyPokeballsFunction(10, 100, id);
            if(result && result.success) {
                console.log("Pokeballs bought successfully by");
                setInventory(result.inventory);
            }
        } catch (error) {
            console.log("Error buying pokeballs", error);
        }
    }

    return (
        <div className = "inventory-container">
            <h1>INVENTORY</h1>
            <div className ="sexy_line_inventory"></div>
            <div className="Airdrop-Section">
                <div className = "token-desc">PokeCoins power all transactions. Airdrop some to get started.</div>
                <button className = "Airdrop-Button" onClick = {requestAirdropFunction} disabled = {airdropLoading}>Airdrop</button>
                {airdropErr && <div>error: {airdropErr}</div>}
                {airdropTx && <div>Hey I have a transcation!</div>}
                <div className = "sol-balance-container">
                    <Wallet color="#ECDBBA" strokeWidth={"1px"} size="18px"/>
                    <div>{balance.toFixed(4)} sol</div>
                </div>
            </div>
            {err && <div>{err}</div>}
            <div className ="sexy_line_inventory"></div>
            <div className = "inventory-pokeball-section">
                {inventory ? (
                    <div className = "Pokeball-Section">
                        <div className="pokeball-section-header">
                            <Backpack size = "21px" strokeWidth={"1px"}/>
                            <div style ={{transform: "translateY(1px)"}}>Backpack</div>
                        </div>
                        <div className = "pokeball-row">
                            <div className = "pokeball-image"><img src = "./assets/images/new_pokeball.png"></img></div>
                            {inventory.standardPokeball}x
                        </div>
                        <div className = "pokeball-row">
                            <div className = "pokeball-image"><img src = "./assets/images/greatball.png"></img></div>
                            {inventory.greatPokeball}x
                        </div>
                        <div className = "pokeball-row">
                            <div className = "pokeball-image"><img src = "./assets/images/ultraball.png"></img></div>
                            {inventory.ultraPokeball}x
                        </div>
                    </div>
                ) : (
                    <p style ={{color: "white", fontSize: "16px"}}>Loading inventory...</p>
                )}
                <div style = {{
                    display: "flex"
                }}>
                    <button className = "buy-pokeball-button" onClick = {handleBuyPokeball} disabled = {loading}>Buy Pokeball (1000PKC)</button>
                </div>
            </div>
        </div>
    )
}