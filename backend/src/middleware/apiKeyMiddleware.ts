import { Request, Response, NextFunction } from "express";
import { isValidPartnerApiKey } from "../utils/partnerRequest";

// Protects partner-facing endpoints. Unlike JWT auth (which identifies a
// logged-in EduCore user), this identifies a trusted external system using
// a shared secret sent in the x-api-key header.
export const requireApiKey = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (
        !isValidPartnerApiKey(
            req.headers["x-api-key"],
            process.env.PARTNER_API_KEY
        )
    ) {
        return res.status(401).json({
            message: "Invalid or missing API key",
        });
    }

    next();
};
