import { Router } from "express";

import { getUserInventory, purchasePokeballs, updatePokeballCount } from "../../controllers/pokeball.controller.js";

export const pokeballRouter: Router = Router();

pokeballRouter.get("/inventory", getUserInventory)
pokeballRouter.post("/purchase", purchasePokeballs)
pokeballRouter.post("/update", updatePokeballCount);