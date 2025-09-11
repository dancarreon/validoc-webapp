export interface QrType {
	id: string;
	qrData: string | null;
	qrSize: string | null;
	qrColor: string | null;
	qrBackgroundColor: string | null;
	qrErrorCorrectionLevel: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export class QrField implements Omit<QrType, 'createdAt' | 'updatedAt'> {
	constructor(partial: Partial<QrField>) {
		Object.assign(this, partial);
	}

	id!: string;
	qrData!: string | null;
	qrSize!: string | null;
	qrColor!: string | null;
	qrBackgroundColor!: string | null;
	qrErrorCorrectionLevel!: string | null;
}
