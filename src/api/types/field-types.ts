import { TrazaType } from './traza-types';
import { ClientType } from './client-types';

export type FieldType = 'data' | 'qr';

export type Field = {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	name: keyof TrazaType | keyof ClientType | 'qr_code';
	type?: FieldType;
	fontFamily?: string; //'Helvetica' | 'Courier' | undefined;
	fontSize?: number;
	align?: string; //'left' | 'center' | 'right';
	saved?: boolean;
	backgroundColor?: string;
	color?: string; // For template compatibility
	// QR-specific properties
	qrData?: string;
	qrSize?: number;
	qrColor?: string;
	qrBackgroundColor?: string;
	qrErrorCorrectionLevel?: string;
};