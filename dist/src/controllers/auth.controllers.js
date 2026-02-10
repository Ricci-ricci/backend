import {} from "express";
import prisma from "@/utils/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// Clé secrète pour signer les tokens (à mettre dans ton .env idéalement)
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_change_me";
export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        // 1. Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: "Email already exists",
            });
            return;
        }
        // 2. Hasher le mot de passe (Sécurité)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // 3. Créer l'utilisateur
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword, // On sauvegarde le hash, pas le texte clair
            },
        });
        // 4. Répondre (sans renvoyer le mot de passe !)
        res.status(201).json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // 1. Trouver l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
            return;
        }
        // 2. Vérifier le mot de passe (Hash vs Clair)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
            return;
        }
        // 3. Générer le Token JWT
        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, // Payload (infos dans le token)
        JWT_SECRET, { expiresIn: "7d" });
        // 4. Configurer le cookie avec le token
        res.cookie("auth_token", token, {
            httpOnly: true, // Le cookie ne peut pas être accédé via JavaScript (protection XSS)
            secure: process.env.NODE_ENV === "production", // HTTPS seulement en production
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Protection CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en millisecondes
            path: "/", // Cookie disponible sur toutes les routes
        });
        // 5. Envoyer la réponse avec le token (optionnel pour le frontend)
        res.status(200).json({
            success: true,
            token, // Envoyé aussi dans la réponse pour compatibilité
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            message: "Login successful",
        });
    }
    catch (error) {
        next(error);
    }
};
// Déconnexion (supprimer le cookie)
export const logout = async (req, res, next) => {
    try {
        // Supprimer le cookie en le remplaçant par un cookie expiré
        res.cookie("auth_token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            maxAge: 0, // Expire immédiatement
            path: "/",
        });
        res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    }
    catch (error) {
        next(error);
    }
};
// Vérifier l'authentification (vérifier le token dans le cookie)
export const verifyAuth = async (req, res, next) => {
    try {
        const token = req.cookies.auth_token;
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Not authenticated",
            });
            return;
        }
        // Vérifier et décoder le token
        const decoded = jwt.verify(token, JWT_SECRET);
        // Récupérer les informations de l'utilisateur
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            user,
        });
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
        next(error);
    }
};
//# sourceMappingURL=auth.controllers.js.map