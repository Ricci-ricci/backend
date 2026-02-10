// backend/src/middleware/validate.ts
import {} from "express";
import { z, ZodError } from "zod";
export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: "Validation error",
                errors: error.issues,
            });
        }
        // En cas d'autre type d'erreur, on la passe au prochain middleware d'erreur
        next(error);
    }
};
//# sourceMappingURL=validate.js.map