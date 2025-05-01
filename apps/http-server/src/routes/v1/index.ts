import { Router } from "express";
import { authRouter } from "./auth.routes.js";

export const indexRouter: Router = Router();

indexRouter.use("/auth", authRouter);
