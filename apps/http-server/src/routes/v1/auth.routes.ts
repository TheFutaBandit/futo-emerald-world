import { Router } from "express";
import { signupController, loginController } from "../../controllers/auth.controller";

export const authRouter : Router = Router();

authRouter.post("/signup", signupController);

authRouter.post("/login", loginController);
