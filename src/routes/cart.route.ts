import { Router } from "express";
import {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart,
} from "../controllers/cart.controller.js";
import { validate } from "../middleware/validate.js";
import {
    addToCartSchema,
    getCartSchema,
    updateCartItemSchema,
    removeCartItemSchema,
    clearCartSchema,
} from "../schemas/cart.schema.js";
import { authenticate } from "../middleware/auth.js";

const cartRoute = Router();

// Ajouter un produit au panier (nécessite authentification)
cartRoute.post("/", authenticate, validate(addToCartSchema), addToCart);

// Obtenir le panier d'un utilisateur (nécessite authentification)
cartRoute.get("/:userId", authenticate, validate(getCartSchema), getCart);

// Mettre à jour la quantité d'un item dans le panier (nécessite authentification)
cartRoute.put(
    "/items/:itemId",
    authenticate,
    validate(updateCartItemSchema),
    updateCartItem,
);

// Supprimer un item du panier (nécessite authentification)
cartRoute.delete(
    "/items/:itemId",
    authenticate,
    validate(removeCartItemSchema),
    removeCartItem,
);

// Vider le panier d'un utilisateur (nécessite authentification)
cartRoute.delete(
    "/:userId",
    authenticate,
    validate(clearCartSchema),
    clearCart,
);

export default cartRoute;
