import { Router } from "express";
import { authRouter } from "./auth.routes";

export const indexRouter: Router = Router();

indexRouter.use("/auth", authRouter);
