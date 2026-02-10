import { Router } from "express";
import { getProductById, createProduct, deleteProduct, getAllProduct, getPublishedProduct, updateProduct, } from "../controllers/product.controller.js";
const productRoute = Router();
productRoute.get("/", getAllProduct);
productRoute.get("/published", getPublishedProduct);
productRoute.get("/:id", getProductById);
productRoute.post("/", createProduct);
productRoute.put("/:id", updateProduct);
productRoute.delete("/:id", deleteProduct);
export { productRoute };
//# sourceMappingURL=product.route.js.map