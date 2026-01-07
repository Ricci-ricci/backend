import { Router } from "express";
import { register, login } from "../controllers/auth.controllers.js";
import { validate } from "../middleware/validate.js";
import { signUpSchema } from "../schemas/auth.schema.js";

const authRoute = Router();

authRoute.post("/register", validate(signUpSchema), register);
authRoute.post("/login", login);

export default authRoute;
