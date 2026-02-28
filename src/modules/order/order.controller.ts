import { Request, Response } from 'express';
import { OrderService } from './order.service.js';
import { sendSuccess, sendError } from '../../shared/utils/response.utils.js';
import { AuthRequest } from '../../shared/utils/middleware.utils.js';
import { OrderStatus } from '@prisma/client';

const orderService = new OrderService();

export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return sendError(res, 'Unauthorized', 401);
        }

        const { items } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return sendError(res, 'Order must contain an array of items with productId and quantity', 400);
        }

        const order = await orderService.createOrder(userId, items);
        sendSuccess(res, 'Order placed successfully', order, 201);
    } catch (error: any) {
        if (error.message.includes('Insufficient stock') || error.message.includes('not found')) {
            return sendError(res, error.message, 400);
        }
        sendError(res, error);
    }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const userType = req.user?.userType;

        if (!userId) return sendError(res, 'Unauthorized', 401);

        let orders;
        if (userType === 'ADMIN') {
            orders = await orderService.getAllOrders();
        } else {
            orders = await orderService.getUserOrders(userId);
        }

        sendSuccess(res, 'Orders fetched successfully', orders);
    } catch (error: any) {
        sendError(res, error);
    }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const userId = req.user?.id;
        const userType = req.user?.userType;

        const order = await orderService.getOrderById(id);

        if (userType !== 'ADMIN' && order.userId !== userId) {
            return sendError(res, 'Forbidden viewing this order', 403);
        }

        sendSuccess(res, 'Order fetched successfully', order);
    } catch (error: any) {
        if (error.message === 'Order not found') {
            return sendError(res, error.message, 404);
        }
        sendError(res, error);
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { status } = req.body;

        if (!status || !Object.values(OrderStatus).includes(status)) {
            return sendError(res, 'Invalid order status', 400);
        }

        const updatedOrder = await orderService.updateOrderStatus(id, status as OrderStatus);
        sendSuccess(res, 'Order status updated successfully', updatedOrder);
    } catch (error: any) {
        if (error.message === 'Order not found') {
            return sendError(res, error.message, 404);
        }
        sendError(res, error);
    }
};
