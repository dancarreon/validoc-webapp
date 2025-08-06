import {PDFDocument, rgb} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {Field} from '../components/PDFViewer';
import {TrazaType} from '../api/types/traza-types.ts';
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
	containerWidth: number | undefined,
	traza?: TrazaType | undefined
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
	const renderedWidth = containerWidth ?? 0;
	const renderedHeight = renderedWidth ? renderedWidth * (pdfHeight / pdfWidth) : 0;
	const scaleX = pdfWidth / renderedWidth;
	const scaleY = pdfHeight / renderedHeight;

	for (const field of fields) {
		const size = field.fontSize || 6;

		let pdfX = field.x * scaleX;
		const pdfW = field.width * scaleX;
		const pdfH = field.height * scaleY;

		const fieldTopY = pdfHeight - field.y * scaleY;
		const pdfY = fieldTopY - size + size * 0.2;

		let text = String(field.name);

		if (traza && traza[field.name]) {
			if (isObject(traza[field.name])) {
				/*
				switch (getCustomType(traza[field.name])) {
					case 'TadType': {
						if (isTadType(traza[field.name])) {
							if (traza[field.name] !== null && traza[field.name] !== undefined) {
								const ciudad = traza[field.name];
								text = ciudad?.ciudad?.toUpperCase()
							}
							//text = `TAD ${traza[field.name].ciudad?.toUpperCase() || ''}, ${traza[field.name].estado?.name?.toUpperCase() || ''}.\n${traza[field.name].direccion?.toUpperCase() || ''}`;
						}
						break;
					}
				}
				*/
			} else {
				text = String(traza[field.name]);
			}
		}

		const textWidth = customFont.widthOfTextAtSize(text, size);
		if (field.align === 'center') {
			pdfX += (pdfW - textWidth) / 2;
		} else if (field.align === 'right') {
			pdfX += pdfW - textWidth;
		}

		page.drawRectangle({
			x: field.x * scaleX,
			y: fieldTopY - pdfH,
			width: pdfW,
			height: pdfH,
			color: field.backgroundColor
				? rgb(
					parseInt(field.backgroundColor.slice(1, 3), 16) / 255,
					parseInt(field.backgroundColor.slice(3, 5), 16) / 255,
					parseInt(field.backgroundColor.slice(5, 7), 16) / 255
				)
				: rgb(1, 1, 1),
		});

		const lines = text.split('\n');
		let currentLineY = pdfY;
		for (const line of lines) {
			page.drawText(line, {
				x: pdfX,
				y: currentLineY,
				size,
				font: customFont,
				color: rgb(0, 0, 0),
				maxWidth: pdfW,
			});
			currentLineY -= size + 2;
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
