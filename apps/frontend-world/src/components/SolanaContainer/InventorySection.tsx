import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import useBuyPokeballs from "../../hook/useBuyPokeballs.js";
import useAuthContext from "../../hook/useAuthContext.js";
import { useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { EventBus } from "../../game/EventBus.js";

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
    const {buyPokeballsFunction, loading, err, tx} = useBuyPokeballs();
    const [inventory, setInventory] = useState<Inventory>();

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
        <div>
            <h1>Inventory</h1>
            <p>Here you can see your inventory</p>
            {err && <div>{err}</div>}
            {inventory ? (
                <div>
                    <p>Standard Pokeballs: {inventory.standardPokeball}</p>
                    <p>Great Pokeballs: {inventory.greatPokeball}</p>
                    <p>Ultra Pokeballs: {inventory.ultraPokeball}</p>
                </div>
            ) : (
                <p>Loading inventory...</p>
            )}
            <button onClick = {handleBuyPokeball} disabled = {loading}>Buy Pokeball</button>
        </div>
    )
}