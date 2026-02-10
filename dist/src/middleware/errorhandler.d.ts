import { type Request, type Response, type NextFunction } from "express";
interface AppError extends Error {
    statusCode?: number;
}
export declare const errorHandler: (error: AppError, req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=errorhandler.d.ts.map