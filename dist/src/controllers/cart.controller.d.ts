import { type Request, type Response, type NextFunction } from "express";
export declare const addToCart: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCart: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateCartItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const removeCartItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const clearCart: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=cart.controller.d.ts.map