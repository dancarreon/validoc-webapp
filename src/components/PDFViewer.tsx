import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {ContextMenu} from './ContextMenu.tsx';
import {QRContextMenu} from './QRContextMenu.tsx';
import {Traza, TrazaType} from '../api/types/traza-types.ts';
import {Client, ClientType} from '../api/types/client-types.ts';
import {FieldOverlay} from './FieldOverlay.tsx';
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {CreateTemplateSchema, Template, TemplateType} from "../api/types/template-type.ts";
import {QrField} from "../api/types/qr-types.ts";
import {createTemplate, updateTemplate, uploadPdfFile} from "../api/templates-api.ts";
import {Toast} from "./Toast.tsx";
import {Alert} from "./Alert.tsx";
import {Spinner} from "./Spinner.tsx";
import {useNavigate} from "react-router";
import {Document, Page, pdfjs} from "react-pdf"
import 'pdfjs-dist/web/pdf_viewer.css';
import {createPdfWithFields} from '../utils/pdfUtils';
import {ReactPDFGenerator} from './ReactPDFGenerator.tsx';
import {Field} from '../api/types/field-types';
import {DropdownElement, DropdownSearch} from './DropdownSearch.tsx';
// import {PDFLibViewer} from './PDFLibViewer.tsx'; // Available as experimental option

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

export const PDFViewer: React.FC<PDFViewerProps> = ({file, onSaveFields, template = null}) => {

	const [fields, setFields] = useState<FieldWithQR[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(1);
	const [containerWidth, setContainerWidth] = useState<number | null>(null);
	const [drawing, setDrawing] = useState<{ x: number; y: number } | null>(null);
	const [rect, setRect] = useState<Partial<Field> | null>(null);
	const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
	const dragOffset = useRef<{ x: number; y: number }>({x: 0, y: 0});
	const [resizingFieldId, setResizingFieldId] = useState<string | null>(null);
	const [resizeMode, setResizeMode] = useState<'horizontal' | 'vertical' | 'both' | null>(null);
	const [contextMenu, setContextMenu] = useState<{ x: number, y: number, fieldId: string } | null>(null);
	const [qrContextMenu, setQrContextMenu] = useState<{ x: number, y: number, fieldId: string } | null>(null);
	const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null);
	const [pendingField, setPendingField] = useState<Partial<Field> | null>(null);
	const [pendingFieldRect, setPendingFieldRect] = useState<Partial<Field> | null>(null);
	const [pendingFieldName, setPendingFieldName] = useState<keyof TrazaType | keyof ClientType | 'qr_code' | ''>('');
	const [isSelecting, setIsSelecting] = useState(false); // Changed to false to disable manual drawing by default
	const [pickingColorForField, setPickingColorForField] = useState<string | null>(null);
	const [isPickingColor, setIsPickingColor] = useState(false);
	const [usePdfLib] = useState(false); // Use react-pdf by default
	const [useReactPDFGenerator] = useState(true); // Use new React PDF generator
	const reactPDFGeneratorRef = useRef<any>(null);

	// Ref for focusing the dropdown when creating a new field
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Canvas ref for color picking
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [, setPdfPage] = useState<unknown>(null);

	const [isLoading, setIsLoading] = useState(false);
	const [show, setShow] = useState(false)
	const [showErrors, setShowErrors] = useState(false)
	const [message, setMessage] = useState('')
	const loadedTemplatesRef = useRef<Set<string>>(new Set());

	const navigate = useNavigate();

	const contextMenuField = contextMenu
		? fields.find(f => f.id === contextMenu.fieldId)
		: null;

	const qrContextMenuField = qrContextMenu
		? fields.find(f => f.id === qrContextMenu.fieldId)
		: null;

	const trazaKeys = useMemo(() => {
		const keys = Object.keys(new Traza({})) as (keyof TrazaType)[];
		return keys
			.sort((a, b) => a.localeCompare(b))
			.map(key => ({
				id: `traza_${key}`,
				name: `📊 ${key}`
			} as DropdownElement));
	}, []);

	const clientKeys = useMemo(() => {
		const keys = Object.keys(new Client({})) as (keyof ClientType)[];
		return keys
			.sort((a, b) => a.localeCompare(b))
			.map(key => ({
				id: `client_${key}`,
				name: `👤 ${key}`
			} as DropdownElement));
	}, []);

	const qrCodeKeys = useMemo(() => [{
		id: 'qr_code',
		name: '🔲 Código QR'
	} as DropdownElement], []);

	let isAdmin = false;

	if (window.location.pathname.includes("admin")) {
		isAdmin = true;
	}

	const path: string = isAdmin ? "/admin" : "/user";

	// Helper functions to convert between viewport and PDF coordinates
	const viewportToPdfCoordinates = useCallback((viewportX: number, viewportY: number) => {
		// Simple conversion using current scale
		return {
			x: viewportX / scale,
			y: viewportY / scale
		};
	}, [scale]);

	const pdfToViewportCoordinates = useCallback((pdfX: number, pdfY: number) => {
		// Simple conversion using current scale
		return {
			x: pdfX * scale,
			y: pdfY * scale
		};
	}, [scale]);

	const {
		register,
		handleSubmit,
		formState: {errors},
		watch,
		setValue,
	} = useForm<TemplateType>({
		resolver: zodResolver(CreateTemplateSchema),
	});

	const errorMap: (string | undefined)[] = [];

	if (errors) {
		for (const key in errors) {
			errorMap.push((errors[key as keyof TemplateType] as { message?: string })?.message);
		}
	}

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

			setIsLoading(true);

			if (file) {
				const uploadFileName = await uploadPdfFile(file instanceof File ? file : new File([file], templateData.name, {type: 'application/pdf'}))

				if (uploadFileName) {

					templateData.pdfFile = uploadFileName;
					templateData.containerWidth = containerWidth ?? undefined;


					const newTemplate: TemplateType = await createTemplate(templateData);
					if (newTemplate) {
						setShow(true);
						setMessage('Nuevo Registro creado exitosamente')
						setTimeout(function () {
							setShow(false);
						}, 5000);
					}

					navigate(path + `/pdfs/${newTemplate.id}`);
				}
			}

			setIsLoading(false);

		} else {
			// Update existing template
			setIsLoading(true);


			const savedTemplate = await updateTemplate(template.id, templateData);

			if (savedTemplate) {
				setShow(true);
				setMessage('Plantilla actualizada exitosamente')
				setTimeout(function () {
					setShow(false);
				}, 5000);

				// Clear the loaded templates ref to prevent re-loading after save
				loadedTemplatesRef.current.clear();
			}

			setIsLoading(false);
		}
	};

	// Set container width on mount and handle resize
	useEffect(() => {
		const updateContainerWidth = () => {
			if (containerRef.current) {
				setContainerWidth(containerRef.current.offsetWidth);
			}
		};

		// Initial width
		updateContainerWidth();

		// Handle window resize (including developer tools opening/closing)
		window.addEventListener('resize', updateContainerWidth);

		// Handle orientation change
		window.addEventListener('orientationchange', updateContainerWidth);

		return () => {
			window.removeEventListener('resize', updateContainerWidth);
			window.removeEventListener('orientationchange', updateContainerWidth);
		};
	}, []);

	// Keyboard arrow move
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (!activeFieldId) return;
			let dx = 0, dy = 0;
			if (e.key === "ArrowLeft") dx = -1;
			if (e.key === "ArrowRight") dx = 1;
			if (e.key === "ArrowUp") dy = -1;
			if (e.key === "ArrowDown") dy = 1;
			if (dx !== 0 || dy !== 0) {
				setFields(fields =>
					fields.map(f =>
						f.id === activeFieldId
							? {...f, x: f.x + dx, y: f.y + dy}
							: f
					)
				);
				e.preventDefault();
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [activeFieldId]);

	// Context menu outside click
	useEffect(() => {
		if (!contextMenu && !qrContextMenu) return;

		function handleClickOutside(e: MouseEvent) {
			const menu = document.getElementById('pdf-context-menu');
			const qrMenu = document.getElementById('qr-context-menu');
			const fieldCreationDialog = document.querySelector('[style*="zIndex: 1001"]'); // Field creation dialog

			// Check if clicking inside any of the menus or field creation dialog
			const clickingInsideMenu = (menu && menu.contains(e.target as Node)) ||
									  (qrMenu && qrMenu.contains(e.target as Node)) ||
									  (fieldCreationDialog && fieldCreationDialog.contains(e.target as Node));


			// Close menus if clicking outside all of them
			if (!clickingInsideMenu) {
				// Add a small delay to allow select dropdowns to open
				setTimeout(() => {
					setContextMenu(null);
					setQrContextMenu(null);
				}, 50);
			}
		}

		// Use click instead of mousedown to allow input interactions
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	}, [contextMenu, qrContextMenu]);

	// Load template fields if provided (only if we haven't loaded this template yet)
	useEffect(() => {
		if (template && Array.isArray(template.fields)) {
			const templateId = template.id;


			// Only load template fields if we haven't loaded this specific template yet
			if (!loadedTemplatesRef.current.has(templateId)) {
				const templateFields = template.fields.map(f => ({
					id: f.id || crypto.randomUUID(),
					name: f.name || '',
					x: f.x || 0,
					y: f.y || 0,
					width: f.width || 50,
					height: f.height || 20,
					fontFamily: f.fontFamily || 'Helvetica',
					fontSize: f.fontSize || 6,
					align: f.align || 'left',
					backgroundColor: f.color || '#ffffff',
					type: f.type || 'data',
					// QR-specific properties
					qrData: (f as any).qrData || 'Sample QR Data',
					qrSize: (f as any).qrSize || 100,
					qrColor: (f as any).qrColor || '#000000',
					qrBackgroundColor: (f as any).qrBackgroundColor || '#ffffff',
					qrErrorCorrectionLevel: (f as any).qrErrorCorrectionLevel || 'M',
				}) as FieldWithQR);

				// If template has qrField array but no QR fields in fields array, create them
				if (template.qrField && template.qrField.length > 0 && !templateFields.some(f => f.type === 'qr')) {
					template.qrField.forEach((qrFieldData, index) => {
						const qrField: FieldWithQR = {
							id: crypto.randomUUID(),
							name: 'qr_code', // Use the standard qr_code name
							x: 100 + (index * 120), // Offset multiple QR fields
							y: 100,
							width: 100,
							height: 100,
							fontFamily: 'Helvetica',
							fontSize: 6,
							align: 'left',
							backgroundColor: '#ffffff',
							type: 'qr',
							qrData: qrFieldData.qrData || 'Sample QR Data',
							qrSize: parseInt(qrFieldData.qrSize || '100'),
							qrColor: qrFieldData.qrColor || '#000000',
							qrBackgroundColor: qrFieldData.qrBackgroundColor || '#ffffff',
							qrErrorCorrectionLevel: qrFieldData.qrErrorCorrectionLevel || 'M',
						};
						templateFields.push(qrField);
					});
				}

				setFields(templateFields);
				setValue('name', template.name || '');
				loadedTemplatesRef.current.add(templateId);
			}
		}
	}, [fields.length, setValue, template, template?.id]); // Only depend on template ID, not the entire template object

	// Load PDF dimensions when file changes
	// useEffect(() => {
	// 	if (!file) return;

	// 	const loadPdfDimensions = async () => {
	// 		try {
	// 			let pdfData: string | ArrayBuffer;
	// 			if (file instanceof File) {
	// 				pdfData = await file.arrayBuffer();
	// 			} else {
	// 				pdfData = file;
	// 			}

	// 			// const pdf = await pdfjs.getDocument(pdfData).promise;
	// 			// const page = await pdf.getPage(1);
	// 			// const viewport = page.getViewport({scale: 1});

	// 			// setPdfDimensions({
	// 			// 	width: viewport.width,
	// 			// 	height: viewport.height
	// 			// });
	// 		} catch (error) {
	// 			console.error('Error loading PDF dimensions:', error);
	// 		}
	// 	};

	// 	loadPdfDimensions();
	// }, [file]);

	// PDF rendering is now handled by react-pdf Document component
	// But we still need canvas for color picking
	useEffect(() => {
		if (!file || !canvasRef.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Load PDF to canvas for color picking
		const loadPdfToCanvas = async () => {
			try {
				// Clear the canvas first to avoid conflicts
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				
				// Convert File to ArrayBuffer for pdfjs
				let pdfData: string | ArrayBuffer;
				if (file instanceof File) {
					pdfData = await file.arrayBuffer();
				} else {
					pdfData = file;
				}

				const pdf = await pdfjs.getDocument(pdfData).promise;
				const page = await pdf.getPage(1);
				const viewport = page.getViewport({scale: 1});

				// Set canvas dimensions
				canvas.width = viewport.width;
				canvas.height = viewport.height;

				const renderContext = {
					canvasContext: ctx,
					viewport: viewport
				};

				// Cancel any previous render operations
				page.cleanup();
				
				await page.render(renderContext).promise;
				setPdfPage(page);
				
			} catch (error) {
				// Silently handle canvas errors
			}
		};

		loadPdfToCanvas();
	}, [file]);

	// Reset picking color after 3 seconds
	useEffect(() => {
		if (pickingColorForField) {
			const timeout = setTimeout(() => setPickingColorForField(null), 3000);
			return () => clearTimeout(timeout);
		}
	}, [pickingColorForField]);

	// Focus the dropdown when a new field is being created
	useEffect(() => {
		if (pendingField && pendingFieldRect && dropdownRef.current) {
			// Small delay to ensure the element is rendered
			const timeout = setTimeout(() => {
				// Find the dropdown button inside the DropdownSearch component
				const dropdownButton = dropdownRef.current?.querySelector('button');
				if (dropdownButton) {
					dropdownButton.focus();
					dropdownButton.click(); // Open the dropdown automatically
				}
			}, 100);
			return () => clearTimeout(timeout);
		}
	}, [pendingField, pendingFieldRect]);

	// Handle keyboard events for field creation dialog
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			// Only handle keys when field creation dialog is open
			if (!pendingField || !pendingFieldRect) return;

			switch (e.key) {
				case 'Enter':
					// Create the field if a property is selected
					if (pendingFieldName) {
						e.preventDefault();
						handleAddField();
					}
					break;
				case 'Escape':
					// Cancel field creation
					e.preventDefault();
					setPendingField(null);
					setPendingFieldRect(null);
					setPendingFieldName('');
					break;
			}
		}

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [pendingField, pendingFieldRect, pendingFieldName]);

	// text selection to field
	useEffect(() => {
		function handleTextSelection() {
			// Only process text selection when not in manual drawing mode
			if (isSelecting) return;

			const selection = window.getSelection();
			if (!selection || selection.isCollapsed) return;

			const range = selection.getRangeAt(0);
			const rect = range.getBoundingClientRect();
			if (!rect || !containerRef.current) return;

			const containerRect = containerRef.current.getBoundingClientRect();
			// Only proceed if selection is inside the PDF container
			if (
				rect.left >= containerRect.left &&
				rect.right <= containerRect.right &&
				rect.top >= containerRect.top &&
				rect.bottom <= containerRect.bottom
			) {
				// Get the PDF element to calculate relative coordinates
				const pdfElement = containerRef.current.querySelector('.react-pdf__Page');
				if (!pdfElement) return;

				const pdfRect = pdfElement.getBoundingClientRect();

				// Calculate coordinates relative to the PDF element (PDF coordinate space with top-left origin)
				const pdfX = (rect.left - pdfRect.left) / scale;
				const pdfY = (rect.top - pdfRect.top) / scale;
				const pdfWidth = rect.width / scale;
				const pdfHeight = rect.height / scale;


				// Only create field if we have a valid selection with minimum size
				if (pdfWidth > 5 && pdfHeight > 5) {
					setPendingFieldRect({x: pdfX, y: pdfY, width: pdfWidth, height: pdfHeight});
					setPendingField({x: pdfX, y: pdfY, width: pdfWidth, height: pdfHeight});
					// Clear the selection after creating the field
					selection.removeAllRanges();
				}
			}
		}

		// Prevent text selection in manual mode
		function preventTextSelection(e: Event) {
			if (isSelecting) {
				e.preventDefault();
				// Clear any existing selection
				const selection = window.getSelection();
				if (selection) {
					selection.removeAllRanges();
				}
			}
		}

		document.addEventListener('mouseup', handleTextSelection);
		document.addEventListener('mousedown', preventTextSelection);
		document.addEventListener('selectstart', preventTextSelection);

		return () => {
			document.removeEventListener('mouseup', handleTextSelection);
			document.removeEventListener('mousedown', preventTextSelection);
			document.removeEventListener('selectstart', preventTextSelection);
		};
	}, [scale, isSelecting, viewportToPdfCoordinates]);

	const handleClick = async (e: React.MouseEvent) => {
		// Only handle color picking when in color picking mode
		if (!pickingColorForField) return;

		e.preventDefault();
		e.stopPropagation();

		// Prevent multiple simultaneous color picking operations
		if (isPickingColor) return;

		setIsPickingColor(true);

		try {
			// Create a temporary canvas overlay for better color picking
			const container = containerRef.current;
			if (!container) {
				throw new Error('No container found');
			}

			const pdfElement = container.querySelector('.react-pdf__Page');
			if (!pdfElement) {
				throw new Error('No PDF element found');
			}

			const pdfRect = pdfElement.getBoundingClientRect();

			// Create temporary canvas for color picking
			const tempCanvas = document.createElement('canvas');
			const tempCtx = tempCanvas.getContext('2d');
			if (!tempCtx) {
				throw new Error('Could not create canvas context');
			}

			// Set canvas size to match PDF display size
			tempCanvas.width = pdfRect.width;
			tempCanvas.height = pdfRect.height;

			// Render PDF to temporary canvas
			const arrayBuffer = file instanceof File
				? await file.arrayBuffer()
				: await fetch(file as string).then(res => res.arrayBuffer());

			const pdf = await pdfjs.getDocument(arrayBuffer).promise;
			const page = await pdf.getPage(1);
			const viewport = page.getViewport({ scale: pdfRect.width / page.getViewport({ scale: 1 }).width });

			const renderContext = {
				canvasContext: tempCtx,
				viewport: viewport
			};

			await page.render(renderContext).promise;

			// Get click coordinates relative to the PDF element
			const x = e.clientX - pdfRect.left;
			const y = e.clientY - pdfRect.top;


			// Ensure coordinates are within PDF bounds
			if (x >= 0 && x <= pdfRect.width && y >= 0 && y <= pdfRect.height) {
				const pixel = tempCtx.getImageData(x, y, 1, 1).data;
				if (pixel && pixel.length >= 3) {
					const hex = `#${[pixel[0], pixel[1], pixel[2]]
						.map((c) => c.toString(16).padStart(2, '0'))
						.join('')}`;


					updateFieldProperty(pickingColorForField, 'backgroundColor', hex);
					setPickingColorForField(null);

					setShow(true);
					setMessage(`Color seleccionado: ${hex}`);
					setTimeout(() => setShow(false), 2000);
					return;
				}
			}

			// Fallback to native color picker if canvas fails
			const field = fields.find(f => f.id === pickingColorForField);
			const currentColor = field?.backgroundColor || field?.color || '#ffffff';
			
			const colorInput = document.createElement('input');
			colorInput.type = 'color';
			colorInput.value = currentColor;
			colorInput.style.position = 'absolute';
			colorInput.style.left = '-9999px';
			document.body.appendChild(colorInput);

			colorInput.addEventListener('change', (e) => {
				const selectedColor = (e.target as HTMLInputElement).value;
				
				updateFieldProperty(pickingColorForField, 'backgroundColor', selectedColor);
				setPickingColorForField(null);

				setShow(true);
				setMessage(`Color seleccionado: ${selectedColor}`);
				setTimeout(() => setShow(false), 2000);

				document.body.removeChild(colorInput);
			});

			colorInput.click();
		} catch (error) {
			console.error('Error picking color:', error);

			// Final fallback to native color picker
			const field = fields.find(f => f.id === pickingColorForField);
			const currentColor = field?.backgroundColor || field?.color || '#ffffff';
			
			const colorInput = document.createElement('input');
			colorInput.type = 'color';
			colorInput.value = currentColor;
			colorInput.style.position = 'absolute';
			colorInput.style.left = '-9999px';
			document.body.appendChild(colorInput);

			colorInput.addEventListener('change', (e) => {
				const selectedColor = (e.target as HTMLInputElement).value;
				updateFieldProperty(pickingColorForField, 'backgroundColor', selectedColor);
				setPickingColorForField(null);

				setShow(true);
				setMessage(`Color seleccionado: ${selectedColor}`);
				setTimeout(() => setShow(false), 2000);

				document.body.removeChild(colorInput);
			});

			colorInput.click();
		} finally {
			setIsPickingColor(false);
		}
	};


	function handleMouseDown(e: React.MouseEvent) {
		// Only allow drawing if isSelecting is true (manual mode)
		if (!isSelecting || !containerRef.current) return;

		// Get the PDF element for accurate coordinate calculation
		const pdfElement = containerRef.current.querySelector('.react-pdf__Page');
		if (!pdfElement) return;

		const pdfRect = pdfElement.getBoundingClientRect();

		// Calculate coordinates relative to the PDF element (PDF coordinate space with top-left origin)
		const pdfX = (e.clientX - pdfRect.left) / scale;
		const pdfY = (e.clientY - pdfRect.top) / scale;


		setDrawing({
			x: pdfX,
			y: pdfY
		});
	}

	const handleMouseMove = useCallback((e: React.MouseEvent) => {
		if (!containerRef.current) return;

		// Get the PDF element for accurate coordinate calculation
		const pdfElement = containerRef.current.querySelector('.react-pdf__Page');
		if (!pdfElement) return;

		const pdfRect = pdfElement.getBoundingClientRect();

		if (drawing) {
			// Calculate coordinates relative to the PDF element (PDF coordinate space with top-left origin)
			const pdfX2 = (e.clientX - pdfRect.left) / scale;
			const pdfY2 = (e.clientY - pdfRect.top) / scale;

			const x = Math.min(drawing.x, pdfX2);
			const y = Math.min(drawing.y, pdfY2);
			const width = Math.abs(pdfX2 - drawing.x);
			const height = Math.abs(pdfY2 - drawing.y);
			setRect({x, y, width, height});
		} else if (draggingFieldId) {
			const field = fields.find(f => f.id === draggingFieldId);
			if (!field) return;

			// Calculate coordinates relative to the PDF element (PDF coordinate space with top-left origin)
			const pdfX = (e.clientX - pdfRect.left) / scale;
			const pdfY = (e.clientY - pdfRect.top) / scale;

			// Apply the drag offset to maintain the relative position where the user clicked
			const newX = pdfX - dragOffset.current.x;
			const newY = pdfY - dragOffset.current.y;

			setFields((prev) =>
				prev.map((f) => (f.id === draggingFieldId ? {...f, x: newX, y: newY} : f))
			);
		} else if (resizingFieldId && resizeMode) {
			const field = fields.find(f => f.id === resizingFieldId);
			if (!field) return;

			// Calculate coordinates relative to the PDF element (PDF coordinate space with top-left origin)
			const pdfX = (e.clientX - pdfRect.left) / scale;
			const pdfY = (e.clientY - pdfRect.top) / scale;

			setFields((prev) =>
				prev.map((f) =>
					f.id === resizingFieldId
						? {
							...f,
							width: resizeMode === 'horizontal' || resizeMode === 'both'
								? Math.max(7.5, pdfX - field.x)
								: field.width,
							height: resizeMode === 'vertical' || resizeMode === 'both'
								? Math.max(7.5, pdfY - field.y)
								: field.height,
						}
						: f
				)
			);
		}
	}, [drawing, draggingFieldId, resizingFieldId, resizeMode, fields, scale, viewportToPdfCoordinates]);

	function handleMouseUp() {
		if (rect) {
			setPendingFieldRect(rect);
			setPendingField(rect);
		}
		setDrawing(null);
		setRect(null);
		setDraggingFieldId(null);
		setResizingFieldId(null);
		setResizeMode(null);

	}

	function handleAddField() {
		if (!pendingFieldRect || !pendingFieldName) return;
		const backgroundColor = '#ffffff';

		// Extract the actual field name from the prefixed key
		let actualFieldName = pendingFieldName;
		if (pendingFieldName.startsWith('traza_')) {
			actualFieldName = pendingFieldName.replace('traza_', '') as keyof TrazaType;
		} else if (pendingFieldName.startsWith('client_')) {
			actualFieldName = pendingFieldName.replace('client_', '') as keyof ClientType;
		}

		// Since we're using Document component instead of canvas, use a default background color
		// or implement a more sophisticated color sampling method if needed

		if (pendingField && 'id' in pendingField) {
			setFields(fields =>
				fields.map(f =>
					f.id === pendingField.id
						? {
							...f,
							name: actualFieldName,
							backgroundColor,
							type: actualFieldName === 'qr_code' ? 'qr' : 'data',
							...(actualFieldName === 'qr_code' && {
								qrData: 'Sample QR Data',
								qrSize: 100,
								qrColor: '#000000',
								qrBackgroundColor: '#ffffff',
								qrErrorCorrectionLevel: 'M'
							})
						}
						: f
				)
			);
		} else {
			const newField: FieldWithQR = {
				id: crypto.randomUUID(),
				x: pendingFieldRect.x ?? 0,
				y: pendingFieldRect.y ?? 0,
				width: pendingFieldRect.width ?? 0,
				height: pendingFieldRect.height ?? 0,
				name: actualFieldName,
				backgroundColor,
				type: actualFieldName === 'qr_code' ? 'qr' : 'data',
			};

			// Add QR-specific properties if it's a QR code field
			if (actualFieldName === 'qr_code') {
				newField.qrData = 'Sample QR Data';
				newField.qrSize = 100;
				newField.qrColor = '#000000';
				newField.qrBackgroundColor = '#ffffff';
				newField.qrErrorCorrectionLevel = 'M';
			}

			setFields([...fields, newField]);
		}
		setPendingField(null);
		setPendingFieldRect(null);
		setPendingFieldName('');
	}

	const startResizingField = useCallback((e: React.MouseEvent, id: string, mode: 'horizontal' | 'vertical' | 'both') => {
		e.stopPropagation();
		setResizingFieldId(id);
		setResizeMode(mode);
	}, []);

	function handleSaveAll() {
		if (fields.length === 0) {
			setShowErrors(true);
			setTimeout(() => setShowErrors(false), 5000);
			return;
		}
		if (onSaveFields) {
			onSaveFields(fields);
		}

	}

	const handleRemoveField = useCallback((id: string) => {
		setFields(fields => fields.filter(f => f.id !== id));
	}, []);

	const handleFieldContextMenu = useCallback((e: React.MouseEvent, fieldId: string) => {
		e.preventDefault();
		const field = fields.find(f => f.id === fieldId);

		// Show QR context menu for QR fields, regular context menu for others
		if (field && field.type === 'qr') {
			setQrContextMenu({x: e.clientX, y: e.clientY, fieldId});
		} else {
			setContextMenu({x: e.clientX, y: e.clientY, fieldId});
		}
	}, [fields]);

	const handleFieldDoubleClick = useCallback((e: React.MouseEvent, fieldId: string) => {
		e.preventDefault();
		const field = fields.find(f => f.id === fieldId);

		// Show QR context menu for QR fields on double-click
		if (field && field.type === 'qr') {
			setQrContextMenu({x: e.clientX, y: e.clientY, fieldId});
		}
	}, [fields]);

	function updateFieldProperty(fieldId: string, prop: keyof FieldWithQR, value: unknown) {
		setFields(fields => fields.map(f => f.id === fieldId ? {...f, [prop]: value} : f));
	}

	const startDraggingField = useCallback((e: React.MouseEvent, id: string) => {
		if (contextMenu) return;
		e.stopPropagation();
		if (!containerRef.current) return;

		// Get the PDF element for accurate coordinate calculation
		const pdfElement = containerRef.current.querySelector('.react-pdf__Page');
		if (!pdfElement) return;

		const pdfRect = pdfElement.getBoundingClientRect();

		// Calculate coordinates relative to the PDF element (PDF coordinate space with top-left origin)
		const pdfX = (e.clientX - pdfRect.left) / scale;
		const pdfY = (e.clientY - pdfRect.top) / scale;

		// Find the field being dragged
		const field = fields.find(f => f.id === id);
		if (!field) return;

		// Calculate the offset between the mouse position and the field's top-left corner
		dragOffset.current = {
			x: pdfX - field.x,
			y: pdfY - field.y,
		};
		setActiveFieldId(id);
		setDraggingFieldId(id);
	}, [contextMenu, scale, viewportToPdfCoordinates, fields]);


	const handleEditField = useCallback((field: FieldWithQR) => {
		// When editing, we need to convert PDF coordinates to viewport coordinates for display
		// but keep the original PDF coordinates for the field data
		setPendingField(field);

		// Convert PDF coordinates to viewport coordinates for the edit overlay
		if (containerRef.current) {
			const pdfElement = containerRef.current.querySelector('.react-pdf__Page');
			const pdfRect = pdfElement?.getBoundingClientRect();
			if (pdfRect) {
				const viewportCoords = pdfToViewportCoordinates(field.x, field.y);
				setPendingFieldRect({
					x: viewportCoords.x,
					y: viewportCoords.y,
					width: field.width,
					height: field.height
				});
			} else {
				// Fallback to original coordinates if PDF element not found
				setPendingFieldRect({
					x: field.x,
					y: field.y,
					width: field.width,
					height: field.height
				});
			}
		}

		setPendingFieldName(field.name);
	}, [scale]);

	const handleSetActiveFieldId = useCallback((id: string | null) => {
		setActiveFieldId(id);
		setIsSelecting(!!id);
	}, []);

	function handleContainerClick() {
		// Only deactivate if not drawing or creating a field
		if (!drawing && !pendingField) {
			handleSetActiveFieldId(null);
		}
	}

	if (!file) return <div className="text-gray-500">No PDF selected.</div>;

	// Use PDF-lib viewer for coordinate consistency (experimental)
	if (usePdfLib) {
		// Dynamic import for experimental PDF-lib viewer
		const PDFLibViewer = React.lazy(() => import('./PDFLibViewer.tsx').then(module => ({ default: module.PDFLibViewer })));
		return (
			<React.Suspense fallback={<div className="text-gray-500">Loading PDF viewer...</div>}>
				<PDFLibViewer file={file} onSaveFields={onSaveFields} template={template} />
			</React.Suspense>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className="inline-block items-center justify-center w-full p-4 pt-2">
				<h2 className="text-xl font-bold mb-6 text-black">Administración de Plantillas PDF</h2>
				<div className="mb-4">
					<label className="text-black mr-2" htmlFor="templateName">Nombre de la Plantilla:</label>
					<input
						id="templateName"
						type="text"
						className="rounded px-2 py-1 text-black"
						value={watch('name') || ''}
						{...register('name')}
						placeholder="Nombre de la plantilla"
					/>
				</div>
				<div className="mb-2 flex gap-2">
					<button type='button'
							className="px-2 py-1 bg-gray-500 rounded text-white"
							onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
						Zoom Out
					</button>
					<button type='button'
							className="px-2 py-1 bg-gray-500 rounded text-white"
							onClick={() => setScale(s => Math.min(3, s + 0.1))}>
						Zoom In
					</button>
					<span className="ml-2 text-black">Zoom: {(scale * 100).toFixed(0)}%</span>

					{/* Mode toggle button */}
					<button type='button'
							className={`px-3 py-1 rounded text-white ${isSelecting ? 'bg-blue-600' : 'bg-green-600'}`}
							onClick={() => setIsSelecting(!isSelecting)}>
						{isSelecting ? 'Modo Manual' : 'Modo Selección de Texto'}
					</button>

					{/* Mode indicator */}
					<span className="ml-2 text-black">
						{isSelecting ? '💡 Dibuja rectángulos para crear campos' : '📝 Selecciona texto para crear campos'}
					</span>


					<div className='float-right ml-auto'>
						{
							isLoading
								? (<Spinner styles='m-auto pb-10.5 grid'/>)
								: <>
									<button type='submit'
											className="ml-4 px-2 py-1 bg-blue-500 text-white rounded"
											onClick={handleSaveAll}>
										Guardar Plantilla
									</button>
									<button type='button'
											className="ml-2 px-2 py-1 bg-green-600 text-white rounded"
											onClick={() => {
												// Create comprehensive sample traza data for testing field population
												const sampleTraza: TrazaType = {
													id: 'test-id',
													folio: 'TEST-001',
													placasTractor: 'ABC-123',
													placasAutotanque1: 'XYZ-789',
													sello1Autotanque1: 'SELLO-456',
													sello2Autotanque1: 'SELLO-789',
													nombreTransportista: 'Transportista Ejemplo S.A.',
													nombreOperador: 'Juan Pérez',
													destino: 'Ciudad de México',
													destinoCorto: 'CDMX',
													litrosTotales: 50000,
													precioLitro: 25.50,
													folioPemex1: 'PEMEX-001',
													folioTrasvase: 'TRASVASE-001',
													numeroTractor: 'TRACTOR-001',
													autotanque1: 'AUTOTANQUE-001',
													cfi: 'CFI-001',
													numeroLicencia: 'LIC-001',
													marcaUnidad1: 'Marca Ejemplo',
													folioCartaPorte: 'CARTA-PORTE-001',
													// Add more sample data as needed
												};

												// Create sample client data for testing field population
												const sampleClient: ClientType = {
													id: 'client-test-id',
													noCliente: 'CLI-001',
													name: 'Cliente Ejemplo S.A.',
													razonSocial: 'Cliente Ejemplo Sociedad Anónima',
													rfc: 'CEX123456789',
													unbMx: 'UNB-MX-001',
													direccion: 'Av. Principal 123, Col. Centro, Ciudad de México',
													direccionCorta: 'Av. Principal 123, CDMX',
													id2: 'CLI-001-ALT',
													status: 'ACTIVE' as any,
													createdAt: new Date(),
													updatedAt: new Date(),
												};

												// Use the appropriate PDF generator
												if (useReactPDFGenerator) {
													// Trigger the ReactPDFGenerator
													if (reactPDFGeneratorRef.current) {
														reactPDFGeneratorRef.current.generatePDF();
													}
												} else {
													createPdfWithFields(file!, fields, sampleTraza, sampleClient, containerWidth);
												}
											}}>
										{useReactPDFGenerator ? 'Abrir PDF con Campos' : 'Generar PDF (PDF-lib)'}
									</button>
								</>
						}
					</div>
				</div>
				<div ref={containerRef}
					 className={`relative border rounded shadow overflow-auto w-full min-h-[600px] bg-[#f8f8f8]${!isSelecting ? ' noselect' : ''} ${!isSelecting ? 'cursor-text' : 'cursor-crosshair'}`}
					 style={{
						 userSelect: isSelecting ? 'none' : 'text',
						 cursor: pickingColorForField ? 'crosshair' : (!isSelecting ? 'text' : 'crosshair')
					 }}
					 onClick={(e) => {
						 handleContainerClick();
						 handleClick(e);
					 }}
					 onMouseDown={handleMouseDown}
					 onMouseMove={handleMouseMove}
					 onMouseUp={handleMouseUp}>

					{/* Text selection mode indicator */}
					{!isSelecting && (
						<div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded shadow-lg z-10">
							📝 Modo Selección de Texto: Selecciona texto en el PDF para crear campos
						</div>
					)}

					{/* Help tooltip for text selection */}
					{!isSelecting && (
						<div
							className="absolute bottom-2 right-2 bg-gray-800 text-white px-3 py-2 rounded shadow-lg z-10 text-sm">
							💡 <strong>Consejo:</strong> Haz clic y arrastra sobre el texto que quieres convertir en
							campo
						</div>
					)}

					{containerWidth && (
						<Document file={file}>
							<Page
								pageNumber={1}
								width={containerWidth * scale}

							/>
						</Document>
					)}

					{/* Hidden canvas for color picking */}
					<canvas
						ref={canvasRef}
						style={{
							position: 'absolute',
							left: '-9999px',
							top: '-9999px',
							visibility: 'hidden'
						}}
					/>
					{fields.map((f) => {
						// Pass the raw PDF coordinates to FieldOverlay
						// FieldOverlay will handle the scaling internally
						return (
							<FieldOverlay
								key={f.id}
								field={f}
								scale={scale}
								isActive={activeFieldId === f.id}
								onEdit={handleEditField}
								onRemove={handleRemoveField}
								onContextMenu={handleFieldContextMenu}
								onDoubleClick={handleFieldDoubleClick}
								onMouseDown={(e) => startDraggingField(e, f.id)}
								onResize={startResizingField}
								setActive={handleSetActiveFieldId}
							/>
						);
					})}
					{rect && !pendingField && (() => {
						// Convert PDF coordinates to viewport coordinates for display
						const viewportCoords = pdfToViewportCoordinates(rect.x!, rect.y!);
						const viewportWidth = rect.width! * scale;
						const viewportHeight = rect.height! * scale;

						return (
							<div className="absolute border-2 border-red-500"
								 style={{
									 left: viewportCoords.x,
									 top: viewportCoords.y,
									 width: viewportWidth,
									 height: viewportHeight
								 }}/>
						);
					})()}

					{/* Highlight selected text area */}
					{pendingField && pendingFieldRect && !isSelecting && (() => {
						// For editing existing fields, pendingFieldRect already contains viewport coordinates
						// For new fields, we need to convert PDF coordinates to viewport coordinates
						let viewportCoords, viewportWidth, viewportHeight;

						if (pendingField && 'id' in pendingField) {
							// Editing existing field - coordinates are already in viewport space
							viewportCoords = {x: pendingFieldRect.x ?? 0, y: pendingFieldRect.y ?? 0};
							viewportWidth = pendingFieldRect.width ?? 0;
							viewportHeight = pendingFieldRect.height ?? 0;
						} else {
							// Creating new field - convert PDF coordinates to viewport coordinates
							const pdfElement = containerRef.current?.querySelector('.react-pdf__Page');
							const pdfRect = pdfElement?.getBoundingClientRect();
							if (pdfRect) {
								viewportCoords = pdfToViewportCoordinates(pendingFieldRect.x ?? 0, pendingFieldRect.y ?? 0);
								viewportWidth = (pendingFieldRect.width ?? 0) * scale;
								viewportHeight = (pendingFieldRect.height ?? 0) * scale;
							} else {
								viewportCoords = {x: pendingFieldRect.x ?? 0, y: pendingFieldRect.y ?? 0};
								viewportWidth = pendingFieldRect.width ?? 0;
								viewportHeight = pendingFieldRect.height ?? 0;
							}
						}

						return (
							<div className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-20"
								 style={{
									 left: viewportCoords.x,
									 top: viewportCoords.y,
									 width: viewportWidth,
									 height: viewportHeight
								 }}/>
						);
					})()}
					{/* Field creation select */}
					{pendingField && pendingFieldRect && (() => {
						// For editing existing fields, pendingFieldRect already contains viewport coordinates
						// For new fields, we need to convert PDF coordinates to viewport coordinates
						let viewportCoords;

						if (pendingField && 'id' in pendingField) {
							// Editing existing field - coordinates are already in viewport space
							viewportCoords = {x: pendingFieldRect.x ?? 0, y: pendingFieldRect.y ?? 0};
						} else {
							// Creating new field - convert PDF coordinates to viewport coordinates
							const pdfElement = containerRef.current?.querySelector('.react-pdf__Page');
							const pdfRect = pdfElement?.getBoundingClientRect();
							if (pdfRect) {
								viewportCoords = pdfToViewportCoordinates(pendingFieldRect.x ?? 0, pendingFieldRect.y ?? 0);
							} else {
								viewportCoords = {x: pendingFieldRect.x ?? 0, y: pendingFieldRect.y ?? 0};
							}
						}

						return (
							<div className="absolute bg-black border rounded-md shadow p-2"
								 style={{
									 left: viewportCoords.x * scale,
									 top: (viewportCoords.y * scale) - 40,
									 zIndex: 1001,
								 }}
								 onClick={(e) => e.stopPropagation()}
								 onMouseDown={(e) => e.stopPropagation()}>
								<label className="block text-xs mb-1 text-white">
									{!isSelecting ? '📝 Texto seleccionado - ' : ''}Seleccione la propiedad a mostrar:
								</label>
								<div className="text-xs text-gray-300 mb-2">
									💡 <strong>Atajos:</strong> Enter para crear • Escape para cancelar
								</div>

								{/* Combined dropdown for both Traza and Client properties */}
								<div className="mb-3" ref={dropdownRef}>
									<DropdownSearch
										options={[...trazaKeys, ...clientKeys, ...qrCodeKeys]}
										value={pendingFieldName}
										onChange={(value) => setPendingFieldName(value as keyof TrazaType | keyof ClientType | 'qr_code' | '')}
										placeholder="Seleccione una propiedad"
										className="w-full"
									/>
								</div>
								<button type="button"
										className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
										disabled={!pendingFieldName}
										onClick={(e) => {
											e.stopPropagation();
											handleAddField();
										}}>
									{pendingField && 'id' in pendingField ? 'Editar' : 'Crear Campo'} <span
									className="text-xs opacity-75">(Enter)</span>
								</button>
								<button type="button"
										className="ml-2 px-2 py-1 bg-gray-400 text-white rounded"
										onClick={(e) => {
											e.stopPropagation();
											setPendingField(null);
											setPendingFieldRect(null);
											setPendingFieldName('');
										}}>
									Cancelar <span className="text-xs opacity-75">(Esc)</span>
								</button>
							</div>
						);
					})()}
				</div>
				{contextMenu && contextMenuField && (
					<ContextMenu
						contextMenu={contextMenu}
						field={contextMenuField}
						updateFieldProperty={updateFieldProperty}
						onDelete={handleRemoveField}
						onPickColor={() => setPickingColorForField(contextMenuField.id)}
					/>
				)}
				{qrContextMenu && qrContextMenuField && (
					<QRContextMenu
						contextMenu={qrContextMenu}
						field={qrContextMenuField}
						updateFieldProperty={updateFieldProperty}
						onDelete={handleRemoveField}
						onClose={() => setQrContextMenu(null)}
					/>
				)}

				{/* React PDF Generator */}
				{useReactPDFGenerator && (
					<div className="mt-8 border-t pt-6">
						<ReactPDFGenerator
							ref={reactPDFGeneratorRef}
							file={file}
							fields={fields}
							traza={{
								id: 'test-id',
								folio: 'TEST-001',
								placasTractor: 'ABC-123',
								placasAutotanque1: 'XYZ-789',
								sello1Autotanque1: 'SELLO-456',
								sello2Autotanque1: 'SELLO-789',
								nombreTransportista: 'Transportista Ejemplo S.A.',
								nombreOperador: 'Juan Pérez',
								destino: 'Ciudad de México',
								destinoCorto: 'CDMX',
								litrosTotales: 50000,
								precioLitro: 25.50,
								folioPemex1: 'PEMEX-001',
								folioTrasvase: 'TRASVASE-001',
								numeroTractor: 'TRACTOR-001',
								autotanque1: 'AUTOTANQUE-001',
								cfi: 'CFI-001',
								numeroLicencia: 'LIC-001',
								marcaUnidad1: 'Marca Ejemplo',
								folioCartaPorte: 'CARTA-PORTE-001',
							} as TrazaType}
							client={{
								id: 'client-test-id',
								noCliente: 'CLI-001',
								name: 'Cliente Ejemplo S.A.',
								razonSocial: 'Cliente Ejemplo Sociedad Anónima',
								rfc: 'CEX123456789',
								unbMx: 'UNB-MX-001',
								direccion: 'Av. Principal 123, Col. Centro, Ciudad de México',
								direccionCorta: 'Av. Principal 123, CDMX',
								id2: 'CLI-001-ALT',
								status: 'ACTIVE' as any,
								createdAt: new Date(),
								updatedAt: new Date(),
							} as ClientType}
							containerWidth={containerWidth}
							scale={scale}
							onGenerated={() => {
								// PDF is already opened by ReactPDFGenerator, no need to open again
							}}
						/>
					</div>
				)}
			</div>
			<Toast>
				{show && <Alert message={message}/>}
			</Toast>
			{showErrors && (
				<Toast>
					{errorMap.length > 0 && errorMap.map((error, index) => (
						<Alert message={error!} key={index}/>
					))}
				</Toast>
			)}
			{pickingColorForField && (
				<div
					className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-[2000] pointer-events-none">
					<div className="bg-black text-white px-6 py-4 rounded shadow-lg pointer-events-auto text-center">
						<div className="mb-2">
							{isPickingColor ? '⏳' : '🎨'} <strong>Selector de Color</strong>
						</div>
						<div className="text-sm mb-3">
							{isPickingColor
								? 'Procesando color...'
								: 'Haz click en cualquier punto del PDF para seleccionar el color de fondo del campo.'
							}
						</div>
						{!isPickingColor && (
							<div className="text-xs text-gray-300">
								💡 Consejo: El color se extraerá directamente del PDF usando canvas oculto
							</div>
						)}
						{!isPickingColor && (
							<button
								className="mt-3 px-3 py-1 bg-red-600 text-white rounded text-sm"
								onClick={() => setPickingColorForField(null)}
							>
								Cancelar
							</button>
						)}
					</div>
				</div>
			)}
		</form>

	);
};
