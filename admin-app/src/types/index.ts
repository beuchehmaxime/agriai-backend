export interface User {
    id: string;
    email?: string | null;
    phoneNumber: string;
    name?: string | null;
    userType: 'ADMIN' | 'FARMER' | 'AGRONOMIST';
    createdAt: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        token: string;
        user: User;
    };
}

export interface Tip {
    id: string;
    title: string;
    content: string;
    imageUrl?: string | null;
    authorId: string;
    author: Partial<User>;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    imageUrl?: string | null;
    categoryId: string;
    category?: Category;
    createdAt: string;
}

export interface Category {
    id: string;
    name: string;
    description?: string | null;
}

export interface Order {
    id: string;
    userId: string;
    user?: User;
    totalAmount: number;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    createdAt: string;
}

export interface ExpertApplication {
    id: string;
    userId: string;
    user?: User;
    experience: string;
    qualifications: string;
    certificateType: string;
    obtainedYear: string;
    institution: string;
    certificateUrl: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
}
