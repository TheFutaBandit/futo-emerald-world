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


import { Wallet, Store} from "lucide-react";
import { Backpack } from "lucide-react";

const BACKEND_URL = "http://143.110.188.87";

interface customJwtPayload {
    id: string,
    userRole: string
}

interface Inventory {
    standardPokeball: number;
    greatPokeball: number;
    ultraPokeball: number;
}

let id: string | null = null;



export function InventorySection() {
    const { publicKey } = useWallet();
    const { requestAirdropFunction, loading: airdropLoading, err: airdropErr, tx: airdropTx } = useAirdrop()
    const {buyPokeballsFunction, loading, err, tx} = useBuyPokeballs();
    const [inventory, setInventory] = useState<Inventory>();
    const [balance, setBalance] = useState(0);
    const { connection } = useConnection();

    const { token } = useAuthContext();

    if (typeof token === 'string') {
        try {
          const decoded = jwtDecode<customJwtPayload>(token);
          id = decoded.id;
        } catch (err) {
          console.error("Failed to decode token:", err);
          id = null;
        }
      }


    // In InventorySection.tsx
    useEffect(() => {
        if (inventory) {
            // Store the inventory in the EventBus
            EventBus.storeData('inventory', inventory);
        }
        
        const onGetInventory = () => {
            console.log("Sending inventory to game scene:", inventory);
            EventBus.emit('receive-inventory', inventory);
        };
        
        EventBus.on('get-inventory-for-scene', onGetInventory);

        EventBus.storeData('inventory', inventory);

        EventBus.emit('inventory-updated', inventory);
        
        return () => {
            EventBus.removeListener('get-inventory-for-scene', onGetInventory);
        };
    }, [inventory]);

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


    useEffect(() => {
    // Listen for pokeball usage from the game scene
    const onPokeballUsed = async (data: { pokeballType: string }) => {
        console.log(`Pokeball used in game: ${data.pokeballType}`);
        
        try {
            // Call the API to update the inventory in the backend
            const updateResponse = await axios.post(`${BACKEND_URL}/api/v1/pokeball/update`, {
                userId: id,
                pokeballType: data.pokeballType,
                usedCount: 1
            });

            if (updateResponse.data.success) {
                // Update the local inventory state
                setInventory(updateResponse.data.inventory);
                
                // Update the cached inventory in EventBus
                EventBus.storeData('inventory', updateResponse.data.inventory);
            } else {
                console.error("Failed to update inventory:", updateResponse.data);
            }
        } catch (err: any) {
            console.error("Error updating inventory after pokeball use:", err);
        }
    };
    
    EventBus.on('pokeball-used', onPokeballUsed);
    
        return () => {
            EventBus.removeListener('pokeball-used', onPokeballUsed);
        };
    }, [id])

    async function handleBuyPokeball(pokeballType: string) {
        if(!publicKey) {
            console.log("Wallet not connected");
            return;
        }

        if (!id) {
            console.log("User ID not available");
            return;
        }

        try {
            const result = await buyPokeballsFunction(10, 100, id, pokeballType);
            if(result && result.success) {
                console.log("Pokeballs bought successfully by");
                setInventory(result.inventory);
            }
        } catch (error) {
            console.log("Error buying pokeballs", error);
        }
    }

    useEffect(() => {
        EventBus.on('get-inventory-for-scene', () => {
            console.log("Sending inventory to game scene:", inventory);
            EventBus.emit('receive-inventory', inventory);
          });
          return () => {
            EventBus.removeListener('get-inventory-for-scene');
          };
    }, [])

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
                            <Backpack size = "24px" strokeWidth={"1.5px"}/>
                            <div style ={{transform: "translateY(1px)"}}>BACKPACK</div>
                        </div>
                        <div className = "pokeball-row">
                            <div className = "pokeball-image"><img src = "./assets/images/new_pokeball.png"></img></div>
                            <div className = "pokeball-count">{inventory.standardPokeball}x</div>
                        </div>
                        <div className = "pokeball-row">
                            <div className = "pokeball-image"><img src = "./assets/images/greatball.png"></img></div>
                            <div className = "pokeball-count">{inventory.greatPokeball}x</div>
                        </div>
                        <div className = "pokeball-row">
                            <div className = "pokeball-image"><img src = "./assets/images/ultraball.png"></img></div>
                            <div className = "pokeball-count">{inventory.ultraPokeball}x</div>
                        </div>
                    </div>
                ) : (
                    <p style ={{color: "white", fontSize: "16px"}}>Loading inventory...</p>
                )}
                <div className ="sexy_line_inventory" style = {{marginBottom : "0px !important"}}></div>
                <div className = "inventory-shop-section">
                    <div className="shop-section-header">
                        <Store size = "24px" strokeWidth={"1.5px"}/>
                        <div style ={{transform: "translateY(1px)"}}>SHOP</div>
                    </div>
                    <div className = "shop-button-section">
                        <div className = "shop-pokeball-row">
                            <div className = "pokeball-image"><img src = "./assets/images/new_pokeball.png"></img></div>
                            <button className = "buy-pokeball-button" onClick = {() => handleBuyPokeball("standard")} disabled = {loading}>Buy</button>
                        </div>
                        <div className = "shop-pokeball-row">
                            <div className = "pokeball-image"><img src = "./assets/images/greatball.png"></img></div>
                            <button className = "buy-pokeball-button" onClick = {() => handleBuyPokeball("great")} disabled = {loading}>Buy</button>
                        </div>
                        <div className = "shop-pokeball-row">
                            <div className = "pokeball-image"><img src = "./assets/images/ultraball.png"></img></div>
                            <button className = "buy-pokeball-button" onClick = {() => handleBuyPokeball("ultra")} disabled = {loading}>Buy</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}