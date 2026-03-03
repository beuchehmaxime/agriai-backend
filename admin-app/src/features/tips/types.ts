import type { User } from '../users/types';

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
