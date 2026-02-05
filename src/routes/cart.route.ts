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

const cartRoute = Router();

// Ajouter un produit au panier
cartRoute.post("/", validate(addToCartSchema), addToCart);

// Obtenir le panier d'un utilisateur
cartRoute.get("/:userId", validate(getCartSchema), getCart);

// Mettre à jour la quantité d'un item dans le panier
cartRoute.put("/items/:itemId", validate(updateCartItemSchema), updateCartItem);

// Supprimer un item du panier
cartRoute.delete("/items/:itemId", validate(removeCartItemSchema), removeCartItem);

// Vider le panier d'un utilisateur
cartRoute.delete("/:userId", validate(clearCartSchema), clearCart);

export default cartRoute;
