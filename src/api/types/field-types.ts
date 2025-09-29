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
	text?: string; // The actual text value to display
	// Multi-line text support
	textLines?: string[]; // Array of text lines for multi-line fields
	isMultiLine?: boolean; // Flag to indicate if field has multiple lines
	// QR-specific properties
	qrData?: string;
	qrSize?: number;
	qrColor?: string;
	qrBackgroundColor?: string;
	qrErrorCorrectionLevel?: string;
};