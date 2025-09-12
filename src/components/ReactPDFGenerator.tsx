import {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
import {pdfjs} from 'react-pdf';
import {Field} from '../api/types/field-types';
import {TrazaType} from '../api/types/traza-types';
import {ClientType} from '../api/types/client-types';
import QRCode from 'qrcode';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type ReactPDFGeneratorProps = {
	file: File | string | null;
	fields: Field[];
	traza?: TrazaType;
	client?: ClientType;
	containerWidth?: number | null;
	scale?: number;
	onGenerated?: (pdfBlob: Blob) => void;
};

export const ReactPDFGenerator = forwardRef<any, ReactPDFGeneratorProps>(({
																			  file: initialFile,
																			  fields: initialFields,
																			  traza: initialTraza,
																			  client: initialClient,
																			  containerWidth = 800,
																			  onGenerated
																		  }, ref) => {
	// Internal state for dynamic updates
	const [file, setFile] = useState<File | string | null>(initialFile);
	const [fields, setFields] = useState<Field[]>(initialFields);
	const [traza, setTraza] = useState<TrazaType | undefined>(initialTraza);
	const [client, setClient] = useState<ClientType | undefined>(initialClient);
	const [pdfPage, setPdfPage] = useState<any>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Sync internal state with props
	useEffect(() => {
		setFile(initialFile);
	}, [initialFile]);

	useEffect(() => {
		setFields(initialFields);
	}, [initialFields]);

	useEffect(() => {
		setTraza(initialTraza);
	}, [initialTraza]);

	useEffect(() => {
		setClient(initialClient);
	}, [initialClient]);

	// Expose functions to parent component
	useImperativeHandle(ref, () => ({
		generatePDF: (overrideFile?: File | string | null, overrideFields?: Field[], overrideTraza?: TrazaType, overrideClient?: ClientType, overrideContainerWidth?: number | null) => {
			// Use override parameters if provided, otherwise use current state
			const fileToUse = overrideFile !== undefined ? overrideFile : file;
			const fieldsToUse = overrideFields !== undefined ? overrideFields : fields;
			const trazaToUse = overrideTraza !== undefined ? overrideTraza : traza;
			const clientToUse = overrideClient !== undefined ? overrideClient : client;
			const containerWidthToUse = overrideContainerWidth !== undefined ? overrideContainerWidth : containerWidth;

			return generatePDFWithParams(fileToUse, fieldsToUse, trazaToUse, clientToUse, containerWidthToUse);
		},
		setFile: (newFile: File | string | null) => {
			setFile(newFile);
		},
		setFields: (newFields: Field[]) => {
			setFields(newFields);
		},
		setTraza: (newTraza: TrazaType | undefined) => {
			setTraza(newTraza);
		},
		setClient: (newClient: ClientType | undefined) => {
			setClient(newClient);
		}
	}));

	// Generate PDF with fields using current state
	const generatePDF = async () => {
		return generatePDFWithParams(file, fields, traza, client, containerWidth);
	};

	// Generate PDF with fields using provided parameters
	const generatePDFWithParams = async (
		fileToUse: File | string | null,
		fieldsToUse: Field[],
		trazaToUse?: TrazaType,
		clientToUse?: ClientType,
		containerWidthToUse?: number | null
	) => {
		if (!fileToUse) {
			const errorMsg = `Missing required data: file=${!!fileToUse}`;
			setError(errorMsg);
			return;
		}

		setIsGenerating(true);
		setError(null);

		try {
			// Get the original PDF as ArrayBuffer
			const originalArrayBuffer = fileToUse instanceof File
				? await fileToUse.arrayBuffer()
				: await fetch(fileToUse).then(res => res.arrayBuffer());

			// Load the original PDF with pdf-lib for high quality
			const {PDFDocument, rgb} = await import('pdf-lib');
			const fontkit = await import('@pdf-lib/fontkit');

			const originalPdf = await PDFDocument.load(originalArrayBuffer);
			originalPdf.registerFontkit(fontkit.default);

			const pages = originalPdf.getPages();
			const page = pages[0];
			const {width: pdfWidth, height: pdfHeight} = page.getSize();

			// Add fields directly to the original PDF using pdf-lib
			await addFieldsToPDF(page, fieldsToUse, pdfWidth, pdfHeight, rgb, containerWidthToUse, trazaToUse, clientToUse);

			// Generate the PDF blob
			const pdfBytes = await originalPdf.save();
			const pdfBlob = new Blob([pdfBytes], {type: 'application/pdf'});

			// Create URL for the PDF blob
			const url = URL.createObjectURL(pdfBlob);

			// Open PDF directly in the browser
			window.open(url, '_blank');

			// Call the onGenerated callback if provided
			if (onGenerated) {
				onGenerated(pdfBlob);
			}

			// Clean up URL after a delay to allow the PDF to load
			setTimeout(() => {
				URL.revokeObjectURL(url);
			}, 10000);

		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error occurred');
		} finally {
			setIsGenerating(false);
		}
	};

	// Add fields directly to PDF using pdf-lib
	const addFieldsToPDF = async (
		page: any,
		fields: Field[],
		pdfWidth: number,
		pdfHeight: number,
		rgb: any,
		containerWidth?: number | null,
		traza?: TrazaType,
		client?: ClientType
	) => {

		// Load custom font
		const fontBytes = await fetch('/fonts/NotoSans-Regular.ttf').then(res => res.arrayBuffer());
		const customFont = await page.doc.embedFont(fontBytes);

		for (const field of fields) {
			// Calculate field position and size
			// Apply scaling factor to convert from viewport coordinates to PDF coordinates
			const scaleFactor = containerWidth ? pdfWidth / containerWidth : 1.0;

			const fieldX = field.x * scaleFactor;
			const fieldY = field.y * scaleFactor;
			const fieldWidth = field.width * scaleFactor;
			const fieldHeight = field.height * scaleFactor;

			// PDF coordinates start from bottom-left, so we need to flip the Y coordinate
			const fieldBottomY = pdfHeight - fieldY - fieldHeight;

			// Draw background rectangle
			if (field.backgroundColor) {
				const bgColor = parseColor(field.backgroundColor);
				page.drawRectangle({
					x: fieldX,
					y: fieldBottomY,
					width: fieldWidth,
					height: fieldHeight,
					color: rgb(bgColor.r, bgColor.g, bgColor.b),
				});
			}

			// Handle QR code fields differently
			if (field.type === 'qr') {
				await drawQRCodeField(page, field, fieldX, fieldBottomY, fieldWidth, fieldHeight, rgb);
			} else {
				// Handle regular text fields
				const text = getFieldText(field, traza, client);
				const fontSize = (field.fontSize || 12) * scaleFactor;
				const textY = fieldBottomY + fontSize * 0.2;

				// Draw text
				const textColor = parseColor(field.color || '#000000');
				const textWidth = customFont.widthOfTextAtSize(text, fontSize);

				// Calculate text position based on alignment
				let textX = fieldX;
				if (field.align === 'center') {
					textX = fieldX + (fieldWidth - textWidth) / 2;
				} else if (field.align === 'right') {
					textX = fieldX + fieldWidth - textWidth;
				}

				// Draw text
				page.drawText(text, {
					x: textX,
					y: textY,
					size: fontSize,
					font: customFont,
					color: rgb(textColor.r, textColor.g, textColor.b),
					maxWidth: fieldWidth,
				});
			}

			// Field border removed - now borderless
		}
	};

	// Draw QR code field
	const drawQRCodeField = async (
		page: any,
		field: Field,
		fieldX: number,
		fieldBottomY: number,
		fieldWidth: number,
		fieldHeight: number,
		rgb: any
	) => {
		try {
			// Get QR data from field properties or fallback to field name
			const qrData = field.qrData || field.name || 'Sample QR Data';
			const qrColor = field.qrColor || '#000000';
			const qrBackgroundColor = field.qrBackgroundColor || '#ffffff';
			const qrErrorCorrectionLevel = field.qrErrorCorrectionLevel || 'M';

			// Create a temporary canvas to generate the QR code
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				throw new Error('Could not create canvas context for QR code');
			}

			// Set canvas size to match the field size
			canvas.width = fieldWidth;
			canvas.height = fieldHeight;

			// Generate QR code
			await QRCode.toCanvas(canvas, qrData, {
				width: Math.min(fieldWidth, fieldHeight),
				margin: 2,
				color: {
					dark: qrColor,
					light: qrBackgroundColor,
				},
				errorCorrectionLevel: qrErrorCorrectionLevel as 'L' | 'M' | 'Q' | 'H',
			});

			// Convert canvas to image data
			const imageData = canvas.toDataURL('image/png');

			// Convert data URL to Uint8Array
			const base64Data = imageData.split(',')[1];
			const binaryString = atob(base64Data);
			const bytes = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}

			// Embed the QR code image in the PDF
			const qrImage = await page.doc.embedPng(bytes);

			// Draw the QR code image
			page.drawImage(qrImage, {
				x: fieldX,
				y: fieldBottomY,
				width: fieldWidth,
				height: fieldHeight,
			});

		} catch (error) {
			console.error('Error generating QR code:', error);

			// Fallback: draw a placeholder rectangle with text
			const textColor = parseColor(field.color || '#000000');
			const fontSize = Math.min(fieldWidth, fieldHeight) * 0.1;

			page.drawText(`QR: ${field.qrData || field.name}`, {
				x: fieldX + fieldWidth * 0.1,
				y: fieldBottomY + fieldHeight * 0.5,
				size: fontSize,
				color: rgb(textColor.r, textColor.g, textColor.b),
			});
		}
	};

	// Parse color from hex string to rgb
	const parseColor = (hex: string) => {
		const cleanHex = hex.replace('#', '');
		const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
		const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
		const b = parseInt(cleanHex.slice(4, 6), 16) / 255;
		return {r, g, b};
	};


	// Get text content for a field
	const getFieldText = (field: Field, traza?: TrazaType, client?: ClientType): string => {
		// Handle QR code fields
		if (field.type === 'qr') {
			return `QR: ${field.qrData || 'Sample Data'}`;
		}

		// Try to get data from traza
		if (traza && field.name in traza) {
			const value = traza[field.name as keyof TrazaType];
			return String(value || field.name);
		}

		// Try to get data from client
		if (client && field.name in client) {
			const value = client[field.name as keyof ClientType];
			return String(value || field.name);
		}

		// Fallback to field name
		return `[${field.name}]`;
	};

	// Load PDF page when file changes
	useEffect(() => {
		if (!file) return;

		const loadPDF = async () => {
			try {
				const arrayBuffer = file instanceof File
					? await file.arrayBuffer()
					: await fetch(file).then(res => res.arrayBuffer());

				const pdf = await pdfjs.getDocument(arrayBuffer).promise;
				const page = await pdf.getPage(1);
				setPdfPage(page);
			} catch (err) {
				console.error('Error loading PDF:', err);
				setError('Failed to load PDF');
			}
		};

		loadPDF();
	}, [file]);

	return (
		<div className="p-4">
			<h3 className="text-lg font-bold mb-4">PDF Generator (React-PDF)</h3>

			{error && (
				<div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
					Error: {error}
				</div>
			)}

			<div className="mb-4">
				<button
					onClick={generatePDF}
					disabled={!file || !pdfPage || isGenerating}
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
				>
					{isGenerating ? 'Generating PDF...' : 'Open PDF with Fields'}
				</button>
			</div>


		</div>
	);
});

ReactPDFGenerator.displayName = 'ReactPDFGenerator';
