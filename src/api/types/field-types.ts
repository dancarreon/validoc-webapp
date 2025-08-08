import { TrazaType } from './traza-types';
import { ClientType } from './client-types';

export type Field = {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	name: keyof TrazaType | keyof ClientType;
	fontFamily?: string; //'Helvetica' | 'Courier' | undefined;
	fontSize?: number;
	align?: string; //'left' | 'center' | 'right';
	saved?: boolean;
	backgroundColor?: string;
};
