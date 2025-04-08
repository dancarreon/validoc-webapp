import {z, ZodType} from "zod";
import {StatusType} from "./user-types.ts";

export interface ClaveType {
    id: string;
    clave: number;
    name: string;
    status: StatusType;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateClaveType = Omit<ClaveType, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateClaveType = Omit<ClaveType, 'id' | 'createdAt' | 'updatedAt'>;

export const ClaveSchema: ZodType = z.object({
    name: z.string({
        required_error: "Nombre es requerido",
    }).min(6, "Nombre debe tener al menos 6 caracteres"),
})

export const UpdateClaveSchema: ZodType = z.object({
    name: z.string({
        required_error: "Nombre es requerido",
    }).min(6, "Nombre debe tener al menos 6 caracteres"),
})
