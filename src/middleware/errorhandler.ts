// backend/src/middleware/errorHandler.ts
import { type Request, type Response, type NextFunction } from "express";

interface AppError extends Error {
    statusCode?: number;
}

export const errorHandler = (
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    // Log l'erreur pour le débogage (dans une vraie app, utilisez un logger comme Winston)
    console.error(error);

    // Récupère le code de statut de l'erreur ou utilise 500 (Internal Server Error) par défaut
    const statusCode = error.statusCode || 500;

    // Prépare le message d'erreur
    const message = error.statusCode
        ? error.message
        : "An unexpected internal server error occurred.";

    // Envoie la réponse d'erreur au client
    res.status(statusCode).json({
        status: "error",
        statusCode,
        message,
    });
};
