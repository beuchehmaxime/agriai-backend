import type { Category } from '../categories/types';

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    imageUrl?: string | null;
    categoryId: string;
    category?: Category;
    diseaseTags: string[];
    createdAt: string;
}
