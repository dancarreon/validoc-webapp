import {z, ZodType} from "zod";
import {StatusType} from "./status-type.ts";

export interface ClaveType {
    id: string;
    clave: string;
    name: string;
    status: StatusType;
    createdAt: Date;
    updatedAt: Date;
}

export class Clave implements Omit<ClaveType, 'id' | 'createdAt' | 'updatedAt'> {
    constructor(partial: Partial<ClaveType>) {
        Object.assign(this, partial);
    }

    clave!: string;
    name!: string
    status!: StatusType;
}

export type CreateClaveType = Omit<ClaveType, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateClaveType = Omit<ClaveType, 'id' | 'createdAt' | 'updatedAt'>;

export const CreateClaveSchema: ZodType = z.object({
    clave: z.string(),
    name: z.string({
        required_error: "Nombre es requerido",
    }).min(6, "Nombre debe tener al menos 6 caracteres"),
    status: z.enum(["ACTIVE", "INACTIVE"], {
        required_error: "Estado es requerido",
    }).default("ACTIVE"),
})

export const UpdateClaveSchema: ZodType = z.object({
    clave: z.string(),
    name: z.string({
        required_error: "Nombre es requerido",
    }).min(6, "Nombre debe tener al menos 6 caracteres"),
    status: z.enum(["ACTIVE", "INACTIVE"], {
        required_error: "Estado es requerido",
    }).default("ACTIVE"),
})
