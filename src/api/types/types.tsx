export enum StatusType {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}

export interface UserType {
    id: number;
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

export interface TrazaType {
    id: number;
    name: string;
    status: StatusType;
}
