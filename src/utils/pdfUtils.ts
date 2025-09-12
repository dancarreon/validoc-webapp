import {PDFDocument, rgb} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {Field} from '../api/types/field-types';
import {TrazaType} from '../api/types/traza-types.ts';
import {ClientType} from '../api/types/client-types.ts';
import {UserType} from '../api/types/user-types.ts';
import {StateType} from '../api/types/state-types.ts';
import {TadType} from '../api/types/tad-types.ts';
import {ProductType} from '../api/types/product-types.ts';
import {ClaveType} from '../api/types/clave-types.ts';
import {TransportistaType} from '../api/types/transportista-types.ts';
import {TemplateType} from '../api/types/template-type.ts';

export async function createPdfWithFields(
	file: File | string,
	fields: Field[],
	_traza?: TrazaType | undefined,
	_client?: ClientType | undefined,
	containerWidth?: number | null
) {

	const arrayBuffer = typeof file === 'string'
		? await fetch(file).then((res) => res.arrayBuffer())
		: await file.arrayBuffer();
	const pdfDoc = await PDFDocument.load(arrayBuffer);

	pdfDoc.registerFontkit(fontkit);

	const fontBytes = await fetch('/fonts/NotoSans-Regular.ttf').then((res) => res.arrayBuffer());
	const customFont = await pdfDoc.embedFont(fontBytes);

	const page = pdfDoc.getPage(0);
	const pdfWidth = page.getWidth();
	const pdfHeight = page.getHeight();


	// Apply coordinate scaling like ReactPDFGenerator for consistency
	const scaleFactor = containerWidth ? pdfWidth / containerWidth : 1.0;

	for (const field of fields) {

		// Apply scaling factor to convert from viewport coordinates to PDF coordinates
		const fieldX = field.x * scaleFactor;
		const fieldY = field.y * scaleFactor;
		const fieldWidth = field.width * scaleFactor;
		const fieldHeight = field.height * scaleFactor;
		const scaledFontSize = (field.fontSize || 6) * scaleFactor;

		// Clamp coordinates to PDF boundaries to prevent fields from going outside
		const pdfX = Math.max(0, Math.min(fieldX, pdfWidth - fieldWidth));
		const clampedY = Math.max(0, Math.min(fieldY, pdfHeight - fieldHeight));
		

		// PDF coordinates start from bottom-left, so we need to flip the Y coordinate
		// field.y is the top of the field in PDFViewer (top-left origin)
		// We need to convert to PDF-lib coordinates (bottom-left origin)
		const fieldBottomY = pdfHeight - clampedY - fieldHeight;
		const pdfY = fieldBottomY + scaledFontSize * 0.2;



		// Handle QR code fields differently
		if (field.type === 'qr') {
			// For QR code fields, we'll draw a placeholder rectangle and add a label
			// In a full implementation, you would generate and embed an actual QR code image
			page.drawRectangle({
				x: pdfX,
				y: fieldBottomY,
				width: fieldWidth,
				height: fieldHeight,
				color: field.qrBackgroundColor
					? rgb(
						parseInt(field.qrBackgroundColor.slice(1, 3), 16) / 255,
						parseInt(field.qrBackgroundColor.slice(3, 5), 16) / 255,
						parseInt(field.qrBackgroundColor.slice(5, 7), 16) / 255
					)
					: rgb(1, 1, 1),
			});

			// Draw a border for the QR code field
			page.drawRectangle({
				x: pdfX,
				y: fieldBottomY,
				width: fieldWidth,
				height: fieldHeight,
				color: rgb(0, 0, 0),
				borderWidth: 1,
			});

			// Add a label indicating this is a QR code field
			const qrLabel = `QR: ${field.qrData || 'Sample Data'}`;
			const labelSize = Math.min(scaledFontSize, 8);
			const labelWidth = customFont.widthOfTextAtSize(qrLabel, labelSize);
			
			// Center the label in the QR code field
			const labelX = pdfX + (fieldWidth - labelWidth) / 2;
			const labelY = fieldBottomY + fieldHeight / 2;

			page.drawText(qrLabel, {
				x: labelX,
				y: labelY,
				size: labelSize,
				font: customFont,
				color: rgb(0, 0, 0),
				maxWidth: fieldWidth,
			});

			continue; // Skip the regular text drawing for QR fields
		}

		let text = String(field.name);

		// Try to populate with actual data if traza or client data is provided
		if (_traza && field.name in _traza && _traza[field.name as keyof TrazaType]) {
			const value = _traza[field.name as keyof TrazaType];
			if (isObject(value)) {
				// Handle complex objects if needed
				text = String(value);
			} else {
				text = String(value);
			}
		} else if (_client && field.name in _client && _client[field.name as keyof ClientType]) {
			const value = _client[field.name as keyof ClientType];
			if (isObject(value)) {
				// Handle complex client objects if needed
				text = String(value);
			} else {
				text = String(value);
			}
		} else {
			// If no data is provided, show a placeholder with the field name
			text = `[${field.name}]`;
		}

		const textWidth = customFont.widthOfTextAtSize(text, scaledFontSize);
		let textX = pdfX;
		if (field.align === 'center') {
			textX += (fieldWidth - textWidth) / 2;
		} else if (field.align === 'right') {
			textX += fieldWidth - textWidth;
		}

		// Draw background rectangle to cover original PDF text
		// Parse background color
		let bgColor = rgb(1, 1, 1); // White by default
		if (field.backgroundColor) {
			try {
				const hex = field.backgroundColor.replace('#', '');
				const r = parseInt(hex.slice(0, 2), 16) / 255;
				const g = parseInt(hex.slice(2, 4), 16) / 255;
				const b = parseInt(hex.slice(4, 6), 16) / 255;
				bgColor = rgb(r, g, b);
			} catch (error) {
				// Error parsing background color, use default
			}
		}
		
		// Draw the background rectangle (borderless)
		page.drawRectangle({
			x: pdfX,
			y: fieldBottomY,
			width: fieldWidth,
			height: fieldHeight,
			color: bgColor,
		});

		const lines = text.split('\n');
		let currentLineY = pdfY;
		
		// Parse text color (default to black)
		let textColor = rgb(0, 0, 0);
		if (field.color) {
			try {
				const hex = field.color.replace('#', '');
				const r = parseInt(hex.slice(0, 2), 16) / 255;
				const g = parseInt(hex.slice(2, 4), 16) / 255;
				const b = parseInt(hex.slice(4, 6), 16) / 255;
				textColor = rgb(r, g, b);
			} catch (error) {
				// Error parsing text color, use default
			}
		}
		
		for (const line of lines) {
			page.drawText(line, {
				x: textX,
				y: currentLineY,
				size: scaledFontSize,
				font: customFont,
				color: textColor,
				maxWidth: fieldWidth,
			});
			currentLineY -= scaledFontSize + 2;
		}
	}

	
	const pdfBytes = await pdfDoc.save();
	const blob = new Blob([pdfBytes], {type: 'application/pdf'});
	const url = URL.createObjectURL(blob);
	window.open(url);
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isUserType(obj: unknown): obj is UserType {
	return !!obj;
}

export function isTrazaType(obj: unknown): obj is TrazaType {
	return !!obj && typeof (obj as TrazaType).folio === 'string';
}

export function isStateType(obj: unknown): obj is StateType {
	return !!obj;
}

export function isTadType(obj: unknown): obj is TadType {
	return !!obj;
}

export function isProductType(obj: unknown): obj is ProductType {
	return !!obj;
}

export function isClaveType(obj: unknown): obj is ClaveType {
	return !!obj && !('descripcion' in (obj as unknown as object));
}

export function isTransportistaType(obj: unknown): obj is TransportistaType {
	return !!obj;
}

export function isTemplateType(obj: unknown): obj is TemplateType {
	return !!obj && typeof (obj as TemplateType).fields === 'object';
}

export function getCustomType(obj: unknown): string | null {
	if (isUserType(obj)) return 'UserType';
	if (isTrazaType(obj)) return 'TrazaType';
	if (isStateType(obj)) return 'StateType';
	if (isTadType(obj)) return 'TadType';
	if (isProductType(obj)) return 'ProductType';
	if (isClaveType(obj)) return 'ClaveType';
	if (isTransportistaType(obj)) return 'TransportistaType';
	if (isTemplateType(obj)) return 'TemplateType';
	return null;
}