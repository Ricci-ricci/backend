import "dotenv/config";
import express, { type Application } from "express";
import { userRoute, productRoute } from "./routes/index.js";
import { type Request, type Response } from "express";
import prisma from "./utils/prisma.js";
import authRoute from "./routes/auth.route.js";
import helmet from "helmet";
import cors from "cors";
import { errorHandler } from "./middleware/errorhandler.js";

const app: Application = express();
const PORT = process.env.PORT || 3000;
// Middlewares de sécurité
app.use(helmet());
app.use(
    cors({
        origin: "https://localhost:4000",
        methods: ["GET", "POST", "PUT", "DELETE"],
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/auth", authRoute);
app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Welcome to E-Commerce API" });
});
app.use(errorHandler);
const startServer = async () => {
    try {
        // Tester la connexion à la DB
        await prisma.$connect();
        console.log("[+] Database connected successfully");

        app.listen(PORT, () => {
            console.log(`[+] Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("[X] Database connection failed:", error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
});
startServer();
