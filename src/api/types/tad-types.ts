import {z, ZodType} from "zod";
import {StateType} from "./state-types.ts";
import {StatusType} from "./status-type.ts";

export interface TadType {
    id: string;
    ciudad: string;
    estado?: StateType;
    estadoId: string;
    status: StatusType;
    createdAt: Date;
    updatedAt: Date;
}

export class Tad implements Omit<TadType, 'id' | 'createdAt' | 'updatedAt'> {
    constructor(partial: Partial<TadType>) {
        Object.assign(this, partial);
    }

    ciudad!: string;
    estadoId!: string;
    status!: StatusType;
}

export type CreateTadType = Omit<TadType, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateTadType = Omit<TadType, 'id' | 'createdAt' | 'updatedAt'>;

export const TadSchema: ZodType = z.object({
    ciudad: z.string({
        required_error: "Ciudad es requerida",
    }).min(6, "Nombre debe tener al menos 6 caracteres"),
    estadoId: z.string(),
    status: z.enum(["ACTIVE", "INACTIVE"], {
        required_error: "Status es requerido",
    }).default("ACTIVE"),
})

export const UpdateTadSchema: ZodType = z.object({
    ciudad: z.string({
        required_error: "Ciudad es requerida",
    }).min(6, "Ciudad debe tener al menos 6 caracteres"),
    estadoId: z.string(),
    status: z.enum(["ACTIVE", "INACTIVE"], {
        required_error: "Status es requerido",
    }).default("ACTIVE"),
})
