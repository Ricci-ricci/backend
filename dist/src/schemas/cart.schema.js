import { z } from "zod";
// Schéma pour ajouter un produit au panier
export const addToCartSchema = z.object({
    body: z.object({
        userId: z.string().min(1, "User ID is required"),
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().int().positive("Quantity must be a positive integer"),
    }),
});
// Schéma pour mettre à jour un item du panier
export const updateCartItemSchema = z.object({
    params: z.object({
        itemId: z.string().min(1, "Item ID is required"),
    }),
    body: z.object({
        quantity: z.number().int().positive("Quantity must be a positive integer"),
    }),
});
// Schéma pour obtenir le panier d'un utilisateur
export const getCartSchema = z.object({
    params: z.object({
        userId: z.string().min(1, "User ID is required"),
    }),
});
// Schéma pour supprimer un item du panier
export const removeCartItemSchema = z.object({
    params: z.object({
        itemId: z.string().min(1, "Item ID is required"),
    }),
});
// Schéma pour vider le panier
export const clearCartSchema = z.object({
    params: z.object({
        userId: z.string().min(1, "User ID is required"),
    }),
});
//# sourceMappingURL=cart.schema.js.map