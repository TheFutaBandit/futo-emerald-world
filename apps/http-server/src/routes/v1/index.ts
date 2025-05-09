import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { AirdropRouter } from "./airdrop.routes.js";
import { SolanaUtilRouter } from "./solana.routes.js";
import { pokeballRouter } from "./pokeball.routes.js";

export const indexRouter: Router = Router();

indexRouter.use("/auth", authRouter);

indexRouter.use("/airdrop", AirdropRouter);

indexRouter.use("/solana", SolanaUtilRouter);

indexRouter.use('/pokeball', pokeballRouter);
