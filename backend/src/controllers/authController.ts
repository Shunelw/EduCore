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

        res.json({
            message: "Microsoft login successful",
            user: {
                name: result.account.name,
                username: result.account.username,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Microsoft login failed",
        });
    }
};