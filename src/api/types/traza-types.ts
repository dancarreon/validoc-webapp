import {StatusType} from "./status-type.ts";
import {z, ZodType} from "zod";

export interface TrazaType {
    id: string;
    tadDireccionId: string;
    claveConcentradoraId: string;
    razonSocialComercialId: string;
    productoId: string;
    capAutotanque1: number | null;
    capAutotanque2: number | null;
    capAutotanque3: number | null;
    litrosTotales: number | null;
    precioLitro: number | null;
    destino: string | null;
    sello1Autotanque1: string | null;
    sello2Autotanque1: string | null;
    sello1Autotanque2: string | null;
    sello2Autotanque2: string | null;
    nombreTransportista: string | null;
    nombreOperador: string | null;
    fechaHoraPemex: Date | null;
    fechaHoraTrasvase: Date | null;
    folioPemex1: string | null;
    folioPemex2: string | null;
    folioPemex3: string | null;
    folioFiscalPemex1: string | null;
    folioFiscalPemex2: string | null;
    folioFiscalPemex3: string | null;
    folioRemisionNacional: string | null;
    folioFiscalRemisionNacional: string | null;
    folioTrasvase: string | null;
    numeroTractor: string | null;
    placasTractor: string | null;
    autotanque1: string | null;
    placasAutotanque1: string | null;
    autotanque2: string | null;
    placasAutotanque2: string | null;
    autotanque3: string | null;
    folio: string | null;
    cfi: string | null;
    destinoCorto: string | null;
    numeroLicencia: string | null;
    marcaUnidad1: string | null;
    folioCartaPorte: string | null;
    folioFiscalCartaPorte: string | null;
    status: StatusType;
    createdAt: Date;
    updatedAt: Date;
}

export class Traza implements Omit<TrazaType, 'id' | 'createdAt' | 'updatedAt'> {
    constructor(partial: Partial<TrazaType>) {
        Object.assign(this, partial);
    }

    status!: StatusType;
    tadDireccionId!: string;
    claveConcentradoraId!: string;
    razonSocialComercialId!: string;
    productoId!: string;
    capAutotanque1!: number | null;
    capAutotanque2!: number | null;
    capAutotanque3!: number | null;
    litrosTotales!: number | null;
    precioLitro!: number | null;
    destino!: string | null;
    sello1Autotanque1!: string | null;
    sello2Autotanque1!: string | null;
    sello1Autotanque2!: string | null;
    sello2Autotanque2!: string | null;
    nombreTransportista!: string | null;
    nombreOperador!: string | null;
    fechaHoraPemex!: Date | null;
    fechaHoraTrasvase!: Date | null;
    folioPemex1!: string | null;
    folioPemex2!: string | null;
    folioPemex3!: string | null;
    folioFiscalPemex1!: string | null;
    folioFiscalPemex2!: string | null;
    folioFiscalPemex3!: string | null;
    folioRemisionNacional!: string | null;
    folioFiscalRemisionNacional!: string | null;
    folioTrasvase!: string | null;
    numeroTractor!: string | null;
    placasTractor!: string | null;
    autotanque1!: string | null;
    placasAutotanque1!: string | null;
    autotanque2!: string | null;
    placasAutotanque2!: string | null;
    autotanque3!: string | null;
    folio!: string | null;
    cfi!: string | null;
    destinoCorto!: string | null;
    numeroLicencia!: string | null;
    marcaUnidad1!: string | null;
    folioCartaPorte!: string | null;
    folioFiscalCartaPorte!: string | null;
}

export type CreateTrazaType = Omit<TrazaType, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateTrazaType = Omit<TrazaType, 'id' | 'createdAt' | 'updatedAt'>;

export const TrazaSchema: ZodType = z.object({
    tadDireccionId: z.string().min(1, "TAD Dirección es requerida"),
    claveConcentradoraId: z.string().min(1, "Clave Concentradora es requerida"),
    razonSocialComercialId: z.string().min(1, "Razón Social es requerida"),
    productoId: z.string().min(1, 'Producto es requerido'),
    capAutotanque1: z.coerce.number().nullable().optional(),
    capAutotanque2: z.coerce.number().nullable().optional(),
    capAutotanque3: z.coerce.number().nullable().optional(),
    litrosTotales: z.coerce.number().nullable().optional(),
    precioLitro: z.coerce.number().nullable().optional(),
    destino: z.string().nullable().optional(),
    sello1Autotanque1: z.string().nullable().optional(),
    sello2Autotanque1: z.string().nullable().optional(),
    sello1Autotanque2: z.string().nullable().optional(),
    sello2Autotanque2: z.string().nullable().optional(),
    nombreTransportista: z.string().nullable().optional(),
    nombreOperador: z.string().nullable().optional(),
    fechaHoraPemex: z.string().nullable().optional(),
    fechaHoraTrasvase: z.string().nullable().optional(),
    folioPemex1: z.string().nullable().optional(),
    folioPemex2: z.string().nullable().optional(),
    folioPemex3: z.string().nullable().optional(),
    folioFiscalPemex1: z.string().nullable().optional(),
    folioFiscalPemex2: z.string().nullable().optional(),
    folioFiscalPemex3: z.string().nullable().optional(),
    folioRemisionNacional: z.string().nullable().optional(),
    folioFiscalRemisionNacional: z.string().nullable().optional(),
    folioTrasvase: z.string().nullable().optional(),
    numeroTractor: z.string().nullable().optional(),
    placasTractor: z.string().nullable().optional(),
    autotanque1: z.string().nullable().optional(),
    placasAutotanque1: z.string().nullable().optional(),
    autotanque2: z.string().nullable().optional(),
    placasAutotanque2: z.string().nullable().optional(),
    autotanque3: z.string().nullable().optional(),
    placasAutotanque3: z.string().nullable().optional(),
    folio: z.string().nullable().optional(),
    cfi: z.string().nullable().optional(),
    destinoCorto: z.string().nullable().optional(),
    numeroLicencia: z.string().nullable().optional(),
    marcaUnidad1: z.string().nullable().optional(),
    folioCartaPorte: z.string().nullable().optional(),
    folioFiscalCartaPorte: z.string().nullable().optional(),
    status: z.nativeEnum(StatusType).optional(),
});
