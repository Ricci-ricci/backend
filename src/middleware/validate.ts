// backend/src/middleware/validate.ts
import { type Request, type Response, type NextFunction } from "express";
import { z, ZodError } from "zod";

export const validate =
    (schema: z.ZodObject) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
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
