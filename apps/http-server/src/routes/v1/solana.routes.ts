import { Router } from "express";
import attemptCatchPokemon from "../../services/catch.service.js";

export const SolanaUtilRouter: Router = Router();

SolanaUtilRouter.post('/catch', attemptCatchPokemon);