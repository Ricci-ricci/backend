import { Router } from "express";
import {
    register,
    login,
    logout,
    verifyAuth,
} from "../controllers/auth.controllers.js";
import { validate } from "../middleware/validate.js";
import { signUpSchema } from "../schemas/auth.schema.js";

const authRoute = Router();

authRoute.post("/register", validate(signUpSchema), register);
authRoute.post("/login", login);
authRoute.post("/logout", logout);
authRoute.get("/verify", verifyAuth);

export default authRoute;
