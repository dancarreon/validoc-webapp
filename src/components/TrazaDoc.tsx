import React from 'react';
import {PDFDocument, rgb, StandardFonts} from 'pdf-lib';
import {TemplateType} from '../api/types/template-type';
import {TrazaType} from '../api/types/traza-types';

type PdfFillerProps = {
	template: TemplateType;
	traza: TrazaType;
};

export const TrazaDoc: React.FC<PdfFillerProps> = ({template, traza}) => {
	const fillPdf = async () => {
		// Fetch the PDF file using the template's pdfFile attribute
		const arrayBuffer = await fetch(template.pdfFile).then(res => res.arrayBuffer());
		const pdfDoc = await PDFDocument.load(arrayBuffer);
		const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
		const page = pdfDoc.getPage(0);

		//const pdfWidth = page.getWidth();
		const pdfHeight = page.getHeight();

		for (const field of template.fields) {
			const value = traza[field.name as keyof TrazaType] ?? '';
			const size = field.fontSize || 12;
			const x = field.x;
			const y = pdfHeight - field.y - (field.height || 0);

			// Draw background if needed
			if (field.color) {
				page.drawRectangle({
					x,
					y,
					width: field.width,
					height: field.height,
					color: rgb(
						parseInt(field.color.slice(1, 3), 16) / 255,
						parseInt(field.color.slice(3, 5), 16) / 255,
						parseInt(field.color.slice(5, 7), 16) / 255
					),
				});
			}

			// Draw text
			page.drawText(String(value), {
				x: x + 2,
				y: y + (field.height || 0) - size - 2,
				size,
				font,
				color: rgb(0, 0, 0),
				maxWidth: field.width,
			});
		}

		const pdfBytes = await pdfDoc.save();
		const blob = new Blob([pdfBytes], {type: 'application/pdf'});
		const url = URL.createObjectURL(blob);
		window.open(url);
	};

	return (
		<button onClick={fillPdf} className="px-2 py-1 bg-blue-600 text-white rounded">
			Fill PDF with Traza Data
		</button>
	);
};
