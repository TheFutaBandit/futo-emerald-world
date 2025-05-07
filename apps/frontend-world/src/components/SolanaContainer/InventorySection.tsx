import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import useBuyPokeballs from "../../hook/useBuyPokeballs.js";

export function InventorySection() {
    const { publicKey } = useWallet();
    const [pokeballs, setPokeballs] = useState(0);
    const {buyPokeballsFunction, loading, err, tx} = useBuyPokeballs();

    async function handleBuyPokeball() {
        if(!publicKey) {
            console.log("Wallet not connected");
            return;
        }

        try {
            const result = await buyPokeballsFunction(10, 100);
            if(result && result.success) {
                console.log("Pokeballs bought successfully");
                setPokeballs(pokeballs + 10);
            }
            setPokeballs(pokeballs + 10);
        } catch (error) {
            console.log("Error buying pokeballs", error);
        }
    }

    return (
        <div>
            <h1>Inventory</h1>
            <p>Here you can see your inventory</p>
            {err && <div>{err}</div>}
            <div>see your pokeballs: {pokeballs}</div>
            <button onClick = {handleBuyPokeball} disabled = {!loading}>Buy Pokeball</button>
        </div>
    )
}