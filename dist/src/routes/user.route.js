import { Router } from "express";
import { getAllUsers, deleteUser, getUserById, updateUser, } from "../controllers/user.controller.js";
const userRoute = Router();
userRoute.get("/", getAllUsers);
userRoute.get("/:id", getUserById);
userRoute.put("/:id", updateUser);
userRoute.delete("/:id", deleteUser);
export { userRoute };
//# sourceMappingURL=user.route.js.map