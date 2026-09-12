import { prisma } from "../config/prisma";
import { generateToken } from "../utils/jwt";
import { Request, Response } from "express";
import { msalClient } from "../config/auth";

export const login = async (req: Request, res: Response) => {
    try {
        const authUrl = await msalClient.getAuthCodeUrl({
            scopes: ["openid", "profile", "email"],
            redirectUri: process.env.AZURE_REDIRECT_URI!,
        });

        res.redirect(authUrl);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to start Microsoft login",
        });
    }
};

export const callback = async (
    req: Request,
    res: Response
) => {
    try {
        const code = req.query.code as string;

        if (!code) {
            return res.status(400).json({
                message: "Authorization code is missing",
            });
        }

        const result = await msalClient.acquireTokenByCode({
            code,
            scopes: ["openid", "profile", "email"],
            redirectUri: process.env.AZURE_REDIRECT_URI!,
        });

        if (!result.account) {
            return res.status(401).json({
                message: "Microsoft account information not found",
            });
        }

        const account = result.account;

        const email = account.username;

        if (!email || !email.endsWith("@au.edu")) {
            return res.status(403).json({
                message: "Only AU university accounts are allowed",
            });
        }

        // Find user by Microsoft ID first
        let user = await prisma.user.findUnique({
            where: {
                microsoftId: account.homeAccountId,
            },
            include: {
                role: true,
            },
        });

        // If not found, try university email
        if (!user) {
            user = await prisma.user.findUnique({
                where: {
                    email,
                },
                include: {
                    role: true,
                },
            });
        }

        // Account must already exist in EduCore
        if (!user) {
            return res.status(403).json({
                message:
                    "Your university account is not registered in EduCore",
            });
        }

        // Connect Microsoft account to existing EduCore user
        if (!user.microsoftId) {
            user = await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    microsoftId: account.homeAccountId,
                },
                include: {
                    role: true,
                },
            });
        }

        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role.roleName,
        });

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.roleName,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Microsoft login failed",
        });
    }
};