import { OrderRepository } from './order.repository.js';
import { ProductRepository } from '../product/product.repository.js';
import { MockMomoService } from '../transaction/mock-momo.service.js';
export class OrderService {
    orderRepository;
    productRepository;
    momoService;
    constructor() {
        this.orderRepository = new OrderRepository();
        this.productRepository = new ProductRepository();
        this.momoService = new MockMomoService();
    }
    async createOrder(userId, items, paymentMethod, phoneNumber) {
        if (!items || items.length === 0) {
            throw new Error('Order must contain at least one item');
        }
        let totalAmount = 0;
        const orderItemsData = [];
        // Verify stock and calculate total sum
        for (const item of items) {
            const product = await this.productRepository.findById(item.productId);
            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }
            if (product.stockQuantity < item.quantity) {
                throw new Error(`Insufficient stock for product ${product.name}`);
            }
            totalAmount += product.price * item.quantity;
            orderItemsData.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price // Snapshot historical price
            });
        }
        let paymentStatus = 'PENDING';
        if (paymentMethod === 'MTN_MOMO' || paymentMethod === 'ORANGE_MOMO') {
            if (!phoneNumber) {
                throw new Error('Phone number is required for Momo payments');
            }
            const momoResponse = await this.momoService.initiatePayment(phoneNumber, totalAmount, paymentMethod);
            if (!momoResponse.success) {
                throw new Error(`Payment failed: ${momoResponse.message}`);
            }
            paymentStatus = 'SUCCESS';
        }
        // Create the order
        const createdOrder = await this.orderRepository.create({
            user: { connect: { id: userId } },
            totalAmount,
            status: 'PENDING',
            paymentMethod,
            paymentStatus,
            items: {
                create: orderItemsData
            }
        });
        // Deduct inventory
        for (const item of items) {
            const product = await this.productRepository.findById(item.productId);
            if (product) {
                await this.productRepository.update(product.id, {
                    stockQuantity: product.stockQuantity - item.quantity
                });
            }
        }
        return createdOrder;
    }
    async getUserOrders(userId) {
        return this.orderRepository.findByUserId(userId);
    }
    async getAllOrders(search) {
        return this.orderRepository.findAll(search);
    }
    async getOrderById(id) {
        const order = await this.orderRepository.findById(id);
        if (!order)
            throw new Error('Order not found');
        return order;
    }
    async updateOrderStatus(id, status) {
        const order = await this.orderRepository.findById(id);
        if (!order)
            throw new Error('Order not found');
        return this.orderRepository.updateStatus(id, status);
    }
    async deleteOrder(id) {
        const order = await this.orderRepository.findById(id);
        if (!order)
            throw new Error('Order not found');
        await this.orderRepository.delete(id);
    }
}
