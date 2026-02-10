import {} from "express";
import jwt from "jsonwebtoken";
import prisma from "@/utils/prisma";
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_change_me";
// Middleware pour vérifier l'authentification
export const authenticate = async (req, res, next) => {
    try {
        // Récupérer le token depuis le cookie
        const token = req.cookies.auth_token;
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }
        // Vérifier et décoder le token
        const decoded = jwt.verify(token, JWT_SECRET);
        // Vérifier que l'utilisateur existe toujours
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        // Attacher les informations utilisateur à la requête
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        if (error.name === "JsonWebTokenError") {
            res.status(401).json({
                success: false,
                message: "Invalid token",
            });
            return;
        }
        if (error.name === "TokenExpiredError") {
            res.status(401).json({
                success: false,
                message: "Token expired",
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: "Authentication error",
        });
    }
};
// Middleware pour vérifier le rôle admin
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: "Authentication required",
        });
        return;
    }
    if (req.user.role !== "ADMIN") {
        res.status(403).json({
            success: false,
            message: "Admin access required",
        });
        return;
    }
    next();
};
//# sourceMappingURL=auth.js.map