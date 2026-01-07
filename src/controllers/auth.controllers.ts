import { type Request, type Response, type NextFunction } from "express";
import prisma from "@/utils/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Clé secrète pour signer les tokens (à mettre dans ton .env idéalement)
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_change_me";
export const register = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
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
    } catch (error: any) {
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
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
        const token = jwt.sign(
            { userId: user.id, email: user.email }, // Payload (infos dans le token)
            JWT_SECRET,
            { expiresIn: "7d" }, // Le token expire dans 7 jours
        );

        // 4. Envoyer le token
        res.status(200).json({
            success: true,
            token, // Le frontend devra stocker ce token (localStorage)
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error: any) {
        next(error);
    }
};
