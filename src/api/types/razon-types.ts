import {z, ZodType} from "zod";
import {StatusType} from "./user-types.ts";

export interface RazonType {
    id: string;
    name: string;
    status: StatusType;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateRazonType = Omit<RazonType, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateRazonType = Omit<RazonType, 'id' | 'createdAt' | 'updatedAt'>;

export const CreateRazonSchema: ZodType = z.object({
    name: z.string({
        required_error: "Nombre es requerido",
    }).min(6, "Nombre debe tener al menos 6 caracteres"),
})

export const UpdateRazonSchema: ZodType = z.object({
    name: z.string({
        required_error: "Nombre es requerido",
    }).min(6, "Nombre debe tener al menos 6 caracteres"),
})
