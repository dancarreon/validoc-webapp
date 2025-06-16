import {z, ZodType} from "zod";
import {StateType} from "./state-types.ts";
import {StatusType} from "./status-type.ts";

export interface TadType {
    id: string;
    estado?: StateType;
    estadoId: string;
    ciudad: string;
    status: StatusType;
    createdAt: Date;
    updatedAt: Date;
    direccion: string;
}

export class Tad implements Omit<TadType, 'id' | 'createdAt' | 'updatedAt'> {
    constructor(partial: Partial<TadType>) {
        Object.assign(this, partial);
    }

    estadoId!: string;
    ciudad!: string;
    status!: StatusType;
    direccion!: string;
}

export type CreateTadType = Omit<TadType, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateTadType = Omit<TadType, 'id' | 'createdAt' | 'updatedAt'>;

export const TadSchema: ZodType = z.object({
    estadoId: z.string(),
    ciudad: z.string({
        required_error: "Ciudad es requerida",
    }).min(6, "Nombre debe tener al menos 6 caracteres"),
    status: z.enum(["ACTIVE", "INACTIVE"], {
        required_error: "Status es requerido",
    }).default("ACTIVE"),
    direccion: z.string({
        required_error: "Direccion es requerida",
    })
})

export const UpdateTadSchema: ZodType = z.object({
    estadoId: z.string(),
    ciudad: z.string({
        required_error: "Ciudad es requerida",
    }).min(6, "Ciudad debe tener al menos 6 caracteres"),
    status: z.enum(["ACTIVE", "INACTIVE"], {
        required_error: "Status es requerido",
    }).default("ACTIVE"),
    direccion: z.string({
        required_error: "Direccion es requerida",
    })
})
