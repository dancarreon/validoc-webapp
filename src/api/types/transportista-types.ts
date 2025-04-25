import {z, ZodType} from "zod";
import {StatusType} from "./status-type.ts";

export interface TransportistaType {
    id: string;
    name?: string;
    lastName?: string;
    createdAt: Date;
    updatedAt: Date;
    status: StatusType;
    generated: boolean;
}

export class Transportista implements Omit<TransportistaType, 'id' | 'createdAt' | 'updatedAt'> {
    constructor(partial: Partial<Transportista>) {
        Object.assign(this, partial);
    }

    name?: string;
    lastName?: string;
    status!: StatusType;
    generated!: boolean;
}

export type CreateTransportistaType = Omit<TransportistaType, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateTransportistaType = Omit<TransportistaType, 'id' | 'password' | 'createdAt' | 'updatedAt'>;

export const TransportistaSchema: ZodType = z.object({
    name: z.string().optional(),
    lastName: z.string().optional(),
    generated: z.boolean().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"], {
        required_error: "Status es requerido",
    }).default("ACTIVE"),
})

export const UpdateTransportistaSchema: ZodType = z.object({
    name: z.string().optional(),
    lastName: z.string().optional(),
    generated: z.boolean().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"], {
        required_error: "Status es requerido",
    }).default("ACTIVE"),
})
