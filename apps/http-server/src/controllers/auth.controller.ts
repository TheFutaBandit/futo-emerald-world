import { SignUpSchema, LogInSchema } from "../types/authTypes.js";
import { Request, Response } from "express";
import { hash, compare } from "bcrypt";
import { prisma } from "@repo/db"
import { JWT_PASSWORD } from "../config/authConfig.js";
import jwt from 'jsonwebtoken'


export const signupController = async (req : Request, res : Response) : Promise<any> => {
    const parsedData = SignUpSchema.safeParse(req.body);

    if(!parsedData.success) {
        return res.status(400).json({
            message: "Validation Failed",
            errors: parsedData.error.errors,
        });
    }

    const hashedPassword = await hash(parsedData.data.password, 10);

    try {
        let user = await prisma.user.create({
            data: {
                username: parsedData.data.username,
                password: hashedPassword,
                role: parsedData.data.type
            }
        })

        const token = jwt.sign({
            id: user.id,
            userRole: user.role,
            username: user.username
        }, JWT_PASSWORD)

        res.json({
            message: "sign in successful",
            token: token
        })

    } catch (error) {
        res.status(400).json({
            message: "Username already exists",
            error: error,
        })
    }
}

export const loginController = async (req : Request, res : Response) : Promise<any> => {
    const parsedData = LogInSchema.safeParse(req.body);

    if(!parsedData.success) {
        return res.status(400).json({
            message: "Validation Failed",
            errors: parsedData.error.errors,
        });
    }

    const user = await prisma.user.findUnique({
        where: {
            username: parsedData.data.username
        }
    })

    if(!user) {
        return res.status(400).json({
            message: "Invalid username",
        })
    }

    const isPasswordValid = await compare(parsedData.data.password, user.password);

    if(!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid Password",
        })
    }

    const token = jwt.sign({
        id: user.id,
        userRole: user.role,
        username: user.username
    }, JWT_PASSWORD)

    res.status(200).json({
        message: "Login Successful",
        token: token,
    })
}