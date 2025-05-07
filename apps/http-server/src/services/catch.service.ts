import { transfer } from "@solana/spl-token";
import { hash } from "bcrypt";
import { Request, Response } from "express";
import rewardTokens from "./rewardToken.service.js";

export default async function attemptCatchPokemon(req: Request, res: Response) : Promise<any> {
    const { pokemonId, pokemonDifficulty, pokemonBounty, pokemonMultiplier, ball_rate, userWallet } = req.body;
    
    if (!pokemonId) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    const max_no = 1;

    const no_1 = Math.floor(Math.random() * max_no);
    const no_2 = Math.floor(Math.random() * max_no);

    const difference = Math.abs(no_2 - no_1);

    const success = difference < pokemonDifficulty;
    
    if (success) {
        const amount = pokemonBounty * pokemonMultiplier;
        const message = await rewardTokens(amount, userWallet);
        if(!message.success) {
            return res.status(400).json({ 
                message: "Failed to reward tokens",
                success: false,
                error: "Error with the server" 
            });
        }
        return res.status(200).json({ 
            message: "Pokémon caught successfully!",
            success: true,
            catch: true,
        });
    } else {
        return res.status(200).json({ 
            message: "Failed to catch Pokémon",
            success: true,
            catch: false,
        });
    }
}