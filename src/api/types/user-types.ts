import {z, ZodType} from "zod";

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

export class User implements Omit<UserType, 'id' | 'createdAt' | 'updatedAt'> {
    constructor(partial: Partial<UserType>) {
        Object.assign(this, partial);
    }

    username!: string;
    password!: string;
    name!: string;
    lastName!: string;
    email!: string;
    phone!: string;
    status!: StatusType;
}

export type CreateUserType = Omit<UserType, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateUserType = Omit<UserType, 'id' | 'password' | 'createdAt' | 'updatedAt'>;

export const UserSchema: ZodType = z.object({
    username: z.string({
        required_error: "Usuario es requerido",
    }).min(6, "Usurio debe tener al menos 6 caracteres"),
    password: z.string({
        required_error: "Contraseña es requerida",
    }).min(6, "Contraseña debe de tener al menos 6 caracteres"),
    name: z.string().optional(),
    lastName: z.string().optional(),
    email: z.union([z.string().email({
        message: "Email inválido",
    }), z.literal('')]),
    phone: z.union([z.number({
        invalid_type_error: "Teléfono debe contener solo números",
    }), z.literal('')]),
    status: z.string().optional(),
})

export const UpdateUserSchema: ZodType = z.object({
    username: z.string({
        required_error: "Usuario es requerido",
    }).min(6, "Usurio debe tener al menos 6 caracteres"),
    name: z.string().optional(),
    lastName: z.string().optional(),
    email: z.union([z.string().email({
        message: "Email inválido",
    }), z.literal('')]),
    phone: z.union([z.number({
        invalid_type_error: "Teléfono debe contener solo números",
    }), z.literal('')]),
    status: z.string().optional(),
})
