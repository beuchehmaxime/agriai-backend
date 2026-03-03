export interface User {
    id: string;
    email?: string | null;
    phoneNumber: string;
    name?: string | null;
    userType: 'ADMIN' | 'FARMER' | 'AGRONOMIST';
    createdAt: string;
}

export interface AuthResponseData {
    token: string;
    user: User;
}
