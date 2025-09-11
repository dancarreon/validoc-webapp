import React, {useEffect, useRef, useState} from 'react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {CreateTemplateSchema, Template, TemplateType} from "../api/types/template-type.ts";
import {QrField} from "../api/types/qr-types.ts";
import {createTemplate, updateTemplate, uploadPdfFile} from "../api/templates-api.ts";
import {useNavigate} from "react-router";
import {pdfjs} from "react-pdf";
import 'pdfjs-dist/web/pdf_viewer.css';
import {Field} from '../api/types/field-types';

// Extended Field type for internal use with QR properties
type FieldWithQR = Field & {
	qrData?: string;
	qrSize?: number;
	qrColor?: string;
	qrBackgroundColor?: string;
	qrErrorCorrectionLevel?: string;
};

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type PDFViewerProps = {
	file: File | string | null;
	onSaveFields?: (fields: FieldWithQR[]) => void;
	template?: TemplateType | null,
};

export const PDFViewer: React.FC<PDFViewerProps> = ({file, template = null}) => {
	const [fields] = useState<FieldWithQR[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerWidth, setContainerWidth] = useState<number | null>(null);
	const loadedTemplatesRef = useRef<Set<string>>(new Set());

	const navigate = useNavigate();

	let isAdmin = false;

	if (window.location.pathname.includes("admin")) {
		isAdmin = true;
	}

	const path: string = isAdmin ? "/admin" : "/user";

	const {
		handleSubmit,
	} = useForm<TemplateType>({
		resolver: zodResolver(CreateTemplateSchema),
	});

	const onSubmit: SubmitHandler<TemplateType> = async (templateData: Template) => {
		templateData.fields = fields.map(f => ({
			id: f.id,
			x: f.x,
			y: f.y,
			width: f.width,
			height: f.height,
			name: f.name,
			type: f.type || 'data',
			fontFamily: f.fontFamily || 'Helvetica',
			fontSize: f.fontSize || 6,
			align: f.align || 'left',
			color: f.backgroundColor || '#ffffff'
		}));

		// Find all QR fields and populate qrField attribute as array
		const qrFields = fields.filter(f => f.type === 'qr');
		if (qrFields.length > 0) {
			templateData.qrField = qrFields.map(qrField => ({
				qrSize: qrField.qrSize?.toString() || '100',
				qrData: qrField.qrData || 'Sample QR Data',
				qrColor: qrField.qrColor || '#000000',
				qrBackgroundColor: qrField.qrBackgroundColor || '#ffffff',
				qrErrorCorrectionLevel: qrField.qrErrorCorrectionLevel || 'M',
			} as QrField));
		} else {
			templateData.qrField = null;
		}

		if (!template) {
			if (file) {
				const uploadFileName = await uploadPdfFile(file instanceof File ? file : new File([file], templateData.name, {type: 'application/pdf'}));

				if (uploadFileName) {
					templateData.pdfFile = uploadFileName;
					templateData.containerWidth = containerWidth ?? undefined;

					const newTemplate: TemplateType = await createTemplate(templateData);
					if (newTemplate) {
						navigate(path + `/pdfs/${newTemplate.id}`);
					}
				}
			}
		} else {
			const savedTemplate = await updateTemplate(template.id, templateData);

			if (savedTemplate) {
				loadedTemplatesRef.current.clear();
			}
		}
	};

	// Set container width on mount and handle resize
	useEffect(() => {
		const updateContainerWidth = () => {
			if (containerRef.current) {
				setContainerWidth(containerRef.current.offsetWidth);
			}
		};

		updateContainerWidth();

		window.addEventListener('resize', updateContainerWidth);
		window.addEventListener('orientationchange', updateContainerWidth);

		return () => {
			window.removeEventListener('resize', updateContainerWidth);
			window.removeEventListener('orientationchange', updateContainerWidth);
		};
	}, []);

	// Load PDF dimensions when file changes
	useEffect(() => {
		if (!file) return;

		const loadPdfDimensions = async () => {
			try {
				let pdfData: string | ArrayBuffer;
				if (file instanceof File) {
					pdfData = await file.arrayBuffer();
				} else {
					pdfData = file;
				}

				const pdf = await pdfjs.getDocument(pdfData).promise;
				const page = await pdf.getPage(1);
				page.getViewport({scale: 1});
			} catch (error) {
				console.error('Error loading PDF dimensions:', error);
			}
		};

		loadPdfDimensions();
	}, [file]);

	// Other hooks and event handlers remain unchanged...

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			{/* Form content remains unchanged */}
		</form>
	);
};
