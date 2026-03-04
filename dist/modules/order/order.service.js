import { OrderRepository } from './order.repository.js';
import { ProductRepository } from '../product/product.repository.js';
export class OrderService {
    orderRepository;
    productRepository;
    constructor() {
        this.orderRepository = new OrderRepository();
        this.productRepository = new ProductRepository();
    }
    async createOrder(userId, items) {
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
        // Create the order
        const createdOrder = await this.orderRepository.create({
            user: { connect: { id: userId } },
            totalAmount,
            status: 'PENDING',
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
