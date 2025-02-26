export enum StatusType {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}

export interface UserType {
    id: string;
    username: string;
    password: string;
    name?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
    status: StatusType;
}

export type CreateUserType = Omit<UserType, 'id' | 'createdAt' | 'updatedAt' | 'status'>;

export type UpdateUserType = Omit<UserType, 'createdAt' | 'updatedAt'>;
