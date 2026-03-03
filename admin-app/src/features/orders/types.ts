import type { User } from '../users/types';
import type { Product } from '../products/types';

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    product: Product;
}

export interface Order {
    id: string;
    userId: string;
    user: Partial<User>;
    totalAmount: number;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    createdAt: string;
    items: OrderItem[];
}
