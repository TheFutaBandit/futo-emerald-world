import { Router } from "express";
import transferTokens  from "../../services/airdrop.service.js";

export const AirdropRouter: Router = Router();

AirdropRouter.post('/', transferTokens);


