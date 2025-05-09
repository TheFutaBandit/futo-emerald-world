import { Request, Response } from "express";
import { prisma } from "@repo/db";

export const getUserInventory = async (req: Request, res: Response): Promise<any> => {
    console.log("does the controller receive the thing");
    console.log(req.query);
    const userId = req.query.id as string;
    console.log(userId);
    

    if(!userId) {
        //oye remember to zod safeParse checks here
        return res.status(400).json({ error: "User ID is required" });
    }

    console.log("does the thing get here");


    try {
        console.log("Alright Ill start finding the inventory")
        let inventory = await prisma.inventory.findUnique({
            where: {
                userId: userId!
            }
        })
        console.log("If not found, does this return an error perhaps?")

        if(!inventory) {
            inventory = await prisma.inventory.create({
                data: {
                  userId,
                  standardPokeball: 0,
                  greatPokeball: 0,
                  ultraPokeball: 0
                }
            });
        }

        res.status(200).json({
            success: true,
            inventory
        })
    } catch (error) {
        console.error("Error fetching inventory:", error);
        res.status(400).json({
            success: false,
            message: "Server error in fetching inventory",
        })
    }
} 

export const purchasePokeballs = async (req: Request, res: Response): Promise<any> => {
    try {
        console.log(req.body); // Debugging: Log the incoming request body

        const { transactionSignature, pokeballType, quantity, userId } = req.body;

        // Validate required fields
        console.log("Validating Fields")
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        //ignoring transaction null check
        if (!pokeballType || !quantity) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        console.log("Fields have been validated")
        // Verify the Solana transaction (placeholder for actual verification logic)
        console.log('Verifying transaction...');
        
        console.log("Is the backend able to fetch the details?")
        // Fetch the user's inventory
        let inventory = await prisma.inventory.findUnique({
            where: { userId }
        });

        console.log("Yes or no")

        if (!inventory) {
            return res.status(400).json({
                success: false,
                message: "Inventory not found"
            });
        }

        // Update inventory based on pokeball type
        const updateData: any = {};
        switch (pokeballType) {
            case "standard":
                updateData.standardPokeball = inventory.standardPokeball + quantity;
                break;
            case "great":
                updateData.greatPokeball = inventory.greatPokeball + quantity;
                break;
            case "ultra":
                updateData.ultraPokeball = inventory.ultraPokeball + quantity;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid pokeball type"
                });
        }

        // Update the inventory in the database
        const updatedInventory = await prisma.inventory.update({
            where: { userId },
            data: { ...updateData }
        });

        // Send the success response
        return res.status(200).json({
            success: true,
            message: `Successfully purchased ${quantity} ${pokeballType} pokeballs`,
            inventory: updatedInventory
        });
    } catch (error) {
        console.error("Error purchasing pokeballs:", error);

        // Send an error response
        return res.status(500).json({
            success: false,
            message: "Server error in purchasing pokeballs"
        });
    }
};


export const updatePokeballCount = async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId, pokeballType, usedCount = 1 } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!pokeballType) {
            return res.status(400).json({
              success: false,
              message: "Pokeball type is required"
            });
        } //yaha bhi zod fuckwit

        const inventory = await prisma.inventory.findUnique({
            where: { userId }
        });
          
        if (!inventory) {
            return res.status(404).json({
              success: false,
              message: "Inventory not found"
            });
        }

        let currentCount = 0;
        const updateData: any = {};

        switch (pokeballType) {
            case "standard":
              currentCount = inventory.standardPokeball;
              updateData.standardPokeball = Math.max(0, currentCount - usedCount);
              break;
            case "great":
              currentCount = inventory.greatPokeball;
              updateData.greatPokeball = Math.max(0, currentCount - usedCount);
              break;
            case "ultra":
              currentCount = inventory.ultraPokeball;
              updateData.ultraPokeball = Math.max(0, currentCount - usedCount);
              break;
            default:
              return res.status(400).json({
                success: false,
                message: "Invalid pokeball type"
              });
        }

        if (currentCount < usedCount) {
            return res.status(400).json({
              success: false,
              message: `Not enough ${pokeballType} pokeballs. You have ${currentCount} but need ${usedCount}.`
            });
        }

        const updatedInventory = await prisma.inventory.update({
            where: { 
                userId 
            },
            data: {
                ...updateData
            }
        });

        return res.status(200).json({
            success: true,
            message: `Used ${usedCount} ${pokeballType} pokeballs`,
            inventory: updatedInventory
        });
    } catch (error) {
        console.error("error updating pokball count: " + error);
        return res.status(400).json({
            success: false,
            message: "Error updating pokeball count"
        });
    }
}