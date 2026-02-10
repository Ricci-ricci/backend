// backend/src/middleware/errorHandler.ts
import {} from "express";
export const errorHandler = (error, req, res, next) => {
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
//# sourceMappingURL=errorhandler.js.map