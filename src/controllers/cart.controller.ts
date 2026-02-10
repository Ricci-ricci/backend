import { type Request, type Response, type NextFunction } from "express";
import prisma from "../utils/prisma";

// Ajouter un produit au panier
export const addToCart = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { userId, productId, quantity } = req.body;

        // Vérifier si le produit existe
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            res.status(404).json({
                success: false,
                message: "Product not found",
            });
            return;
        }

        // Vérifier le stock disponible
        if (product.stock < quantity) {
            res.status(400).json({
                success: false,
                message: "Insufficient stock",
            });
            return;
        }

        // Trouver ou créer le panier de l'utilisateur
        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: true },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: {
                    userId,
                },
                include: { items: true },
            });
        }

        // Vérifier si le produit est déjà dans le panier
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId,
            },
        });

        if (existingItem) {
            // Mettre à jour la quantité
            const updatedItem = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: existingItem.quantity + quantity,
                },
                include: {
                    product: true,
                },
            });

            res.status(200).json({
                success: true,
                message: "Cart item updated",
                data: updatedItem,
            });
        } else {
            // Créer un nouvel item dans le panier
            const cartItem = await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                },
                include: {
                    product: true,
                },
            });

            res.status(201).json({
                success: true,
                message: "Product added to cart",
                data: cartItem,
            });
        }
    } catch (error: any) {
        next(error);
    }
};

// Obtenir le panier d'un utilisateur
export const getCart = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            res.status(400).json({
                success: false,
                message: "User ID is required",
            });
            return;
        }

        const cart = await prisma.cart.findUnique({
            where: { userId: userId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!cart) {
            res.status(404).json({
                success: false,
                message: "Cart not found",
            });
            return;
        }

        // Calculer le total du panier
        const total = cart.items.reduce(
            (sum: number, item: any) =>
                sum + item.product.price * item.quantity,
            0,
        );

        res.status(200).json({
            success: true,
            data: {
                ...cart,
                total,
            },
        });
    } catch (error: any) {
        next(error);
    }
};

// Mettre à jour la quantité d'un item dans le panier
export const updateCartItem = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (!itemId) {
            res.status(400).json({
                success: false,
                message: "Item ID is required",
            });
            return;
        }

        if (quantity < 1) {
            res.status(400).json({
                success: false,
                message: "Quantity must be at least 1",
            });
            return;
        }

        const cartItem = await prisma.cartItem.findUnique({
            where: { id: itemId },
            include: { product: true },
        });

        if (!cartItem) {
            res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
            return;
        }

        // Vérifier le stock disponible
        if (cartItem.product.stock < quantity) {
            res.status(400).json({
                success: false,
                message: "Insufficient stock",
            });
            return;
        }

        const updatedItem = await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
            include: { product: true },
        });

        res.status(200).json({
            success: true,
            message: "Cart item updated",
            data: updatedItem,
        });
    } catch (error: any) {
        next(error);
    }
};

// Supprimer un item du panier
export const removeCartItem = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { itemId } = req.params;

        if (!itemId) {
            res.status(400).json({
                success: false,
                message: "Item ID is required",
            });
            return;
        }

        await prisma.cartItem.delete({
            where: { id: itemId },
        });

        res.status(200).json({
            success: true,
            message: "Item removed from cart",
        });
    } catch (error: any) {
        next(error);
    }
};

// Vider le panier
export const clearCart = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            res.status(400).json({
                success: false,
                message: "User ID is required",
            });
            return;
        }

        const cart = await prisma.cart.findUnique({
            where: { userId: userId },
        });

        if (!cart) {
            res.status(404).json({
                success: false,
                message: "Cart not found",
            });
            return;
        }

        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
        });
    } catch (error: any) {
        next(error);
    }
};
