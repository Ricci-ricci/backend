import {} from "express";
import prisma from "@/utils/prisma";
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        res.status(200).json({ success: true, data: users });
    }
    catch (error) {
        next(error);
    }
};
export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                error: "User ID is required",
            });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            res.status(404).json({ success: false, error: "User not found" });
            return;
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                error: "User ID is required",
            });
            return;
        }
        const { email, name, password } = req.body;
        const updateUser = await prisma.user.update({
            where: { id },
            data: { email, name, password },
        });
        res.status(200).json({ success: true, data: updateUser });
    }
    catch (error) {
        next(error);
    }
};
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                error: "User ID is required",
            });
            return;
        }
        await prisma.user.delete({
            where: { id },
        });
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=user.controller.js.map