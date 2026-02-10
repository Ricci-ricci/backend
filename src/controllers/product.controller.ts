import { type Request, type Response, type NextFunction } from "express";
import prisma from "../utils/prisma.js";

export const createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const {
            title,
            description,
            price,
            published,
            image,
            features,
            categoryName,
        } = req.body;
        const product = await prisma.product.create({
            data: {
                title,
                description,
                price,
                published,
                image,
                features,
                categoryName,
            },
        });
        res.status(201).json({ success: true, data: product });
    } catch (error: any) {
        next(error);
    }
};

export const getAllProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const products = await prisma.product.findMany();
        res.status(200).json({ success: true, data: products });
    } catch (error: any) {
        next(error);
    }
};

export const getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                error: "Product ID is required",
            });
            return;
        }
        const product = await prisma.product.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
                published: true,
                image: true,
                features: true,
                categoryName: true,
            },
        });
        res.status(200).json({ success: true, data: product });
    } catch (error: any) {
        next(error);
    }
};

export const updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            price,
            published,
            image,
            features,
            categoryName,
        } = req.body;
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Product ID is required",
            });
            return;
        }
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                title,
                description,
                price,
                published,
                image,
                features,
                categoryName,
            },
        });
        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error: any) {
        next(error);
    }
};

export const deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Product ID is required",
            });
            return;
        }
        await prisma.product.delete({
            where: { id },
        });
        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error: any) {
        next(error);
    }
};

export const getPublishedProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const products = await prisma.product.findMany({
            where: { published: true },
        });
        res.status(200).json({ success: true, data: products });
    } catch (error: any) {
        next(error);
    }
};
