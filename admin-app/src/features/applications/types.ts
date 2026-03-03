import type { User } from '../users/types';

export interface ExpertApplication {
    id: string;
    userId: string;
    user?: Partial<User>;
    experience: string;
    qualifications: string;
    certificateType: string;
    obtainedYear: string;
    institution: string;
    certificateUrl: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
}
