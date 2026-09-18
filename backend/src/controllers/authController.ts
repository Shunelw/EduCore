import { prisma } from "../config/prisma";
import { generateToken } from "../utils/jwt";
import { getInitialRole, isAdminEmail } from "../utils/accountRole";
import { Request, Response } from "express";
import { msalClient } from "../config/auth";
import { AuthRequest } from "../middleware/authMiddleware";

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

        console.log("Microsoft account:");
        console.log("name:", account.name);
        console.log("username:", account.username);
        console.log("homeAccountId:", account.homeAccountId);

        const email = account.username.trim().toLowerCase();

        let user = await prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });

        if (!user) {
            const roleName = getInitialRole(email);

            if (!roleName) {
                return res.status(403).json({
                    message: "Unable to determine your EduCore role",
                });
            }

            const role = await prisma.role.findUnique({
                where: {
                    roleName,
                },
            });

            if (!role) {
                return res.status(500).json({
                    message: `Role ${roleName} does not exist`,
                });
            }

            user = await prisma.user.create({
                data: {
                    microsoftId: account.homeAccountId,
                    name: account.name || email,
                    email,
                    roleId: role.id,
                },
                include: {
                    role: true,
                },
            });
        }

        // An allowlisted account is promoted on login whether it is new or
        // already exists. Removing it from ADMIN_EMAILS does not auto-demote it.
        const promoteToAdmin =
            isAdminEmail(email) && user.role.roleName !== "ADMIN";

        // Connect Microsoft account to existing EduCore user, apply any admin
        // promotion, and record this login for system activity monitoring.
        user = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                microsoftId: user.microsoftId || account.homeAccountId,
                lastLoginAt: new Date(),
                ...(promoteToAdmin
                    ? {
                          role: {
                              connect: { roleName: "ADMIN" },
                          },
                      }
                    : {}),
            },
            include: {
                role: true,
            },
        });

        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role.roleName,
        });

        const frontendUrl = process.env.FRONTEND_URL!;

        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Microsoft login failed",
        });
    }
};

export const me = async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            include: { role: true },
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            department: user.department,
            role: user.role.roleName,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch current user",
        });
    }
};
