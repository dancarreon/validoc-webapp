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
			const size = field.fontSize || 12;
			const x = field.x;
			const y = pdfHeight - field.y - (field.height || 0);

			// Handle QR code fields differently
			if (field.type === 'qr') {
				// For QR code fields, we'll draw a placeholder rectangle and add a label
				// In a full implementation, you would generate and embed an actual QR code image
				if (field.qrBackgroundColor) {
					page.drawRectangle({
						x,
						y,
						width: field.width,
						height: field.height,
						color: rgb(
							parseInt(field.qrBackgroundColor.slice(1, 3), 16) / 255,
							parseInt(field.qrBackgroundColor.slice(3, 5), 16) / 255,
							parseInt(field.qrBackgroundColor.slice(5, 7), 16) / 255
						),
					});
				}

				// Draw a border for the QR code field
				page.drawRectangle({
					x,
					y,
					width: field.width,
					height: field.height,
					color: rgb(0, 0, 0),
					borderWidth: 1,
				});

				// Add a label indicating this is a QR code field
				const qrLabel = `QR: ${field.qrData || 'Sample Data'}`;
				const labelSize = Math.min(size, 10);
				const labelWidth = font.widthOfTextAtSize(qrLabel, labelSize);
				
				// Center the label in the QR code field
				const labelX = x + (field.width - labelWidth) / 2;
				const labelY = y + field.height / 2;

				page.drawText(qrLabel, {
					x: labelX,
					y: labelY,
					size: labelSize,
					font,
					color: rgb(0, 0, 0),
					maxWidth: field.width,
				});

				continue; // Skip the regular text drawing for QR fields
			}

			// Handle regular text fields
			const value = traza[field.name as keyof TrazaType] ?? '';

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
