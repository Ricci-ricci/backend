import { type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
export declare const validate: (schema: z.ZodObject) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=validate.d.ts.map