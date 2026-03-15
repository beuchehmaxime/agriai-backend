import { OrderService } from './order.service.js';
import { sendSuccess, sendError } from '../../shared/utils/response.utils.js';
import { OrderStatus } from '@prisma/client';
const orderService = new OrderService();
export const createOrder = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return sendError(res, 'Unauthorized', 401);
        }
        const { items, paymentMethod, phoneNumber } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return sendError(res, 'Order must contain an array of items with productId and quantity', 400);
        }
        if (!paymentMethod || !['MTN_MOMO', 'ORANGE_MOMO', 'CASH_ON_DELIVERY'].includes(paymentMethod)) {
            return sendError(res, 'Valid paymentMethod (MTN_MOMO, ORANGE_MOMO, CASH_ON_DELIVERY) is required', 400);
        }
        if (['MTN_MOMO', 'ORANGE_MOMO'].includes(paymentMethod) && !phoneNumber) {
            return sendError(res, 'phoneNumber is required for Momo payments', 400);
        }
        const order = await orderService.createOrder(userId, items, paymentMethod, phoneNumber);
        sendSuccess(res, 'Order placed successfully', order, 201);
    }
    catch (error) {
        if (error.message.includes('Insufficient stock') || error.message.includes('not found')) {
            return sendError(res, error.message, 400);
        }
        sendError(res, error);
    }
};
export const getOrders = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userType = req.user?.userType;
        if (!userId)
            return sendError(res, 'Unauthorized', 401);
        let orders;
        if (userType === 'ADMIN') {
            const { search } = req.query;
            orders = await orderService.getAllOrders(search);
        }
        else {
            orders = await orderService.getUserOrders(userId);
        }
        sendSuccess(res, 'Orders fetched successfully', orders);
    }
    catch (error) {
        sendError(res, error);
    }
};
export const getOrderById = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user?.id;
        const userType = req.user?.userType;
        const order = await orderService.getOrderById(id);
        if (userType !== 'ADMIN' && order.userId !== userId) {
            return sendError(res, 'Forbidden viewing this order', 403);
        }
        sendSuccess(res, 'Order fetched successfully', order);
    }
    catch (error) {
        if (error.message === 'Order not found') {
            return sendError(res, error.message, 404);
        }
        sendError(res, error);
    }
};
export const updateOrderStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        if (!status || !Object.values(OrderStatus).includes(status)) {
            return sendError(res, 'Invalid order status', 400);
        }
        const updatedOrder = await orderService.updateOrderStatus(id, status);
        sendSuccess(res, 'Order status updated successfully', updatedOrder);
    }
    catch (error) {
        if (error.message === 'Order not found') {
            return sendError(res, error.message, 404);
        }
        sendError(res, error);
    }
};
export const deleteOrder = async (req, res) => {
    try {
        const id = req.params.id;
        await orderService.deleteOrder(id);
        sendSuccess(res, 'Order deleted successfully');
    }
    catch (error) {
        if (error.message === 'Order not found') {
            return sendError(res, error.message, 404);
        }
        sendError(res, error);
    }
};
