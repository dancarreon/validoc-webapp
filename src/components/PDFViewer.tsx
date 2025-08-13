import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ContextMenu } from './ContextMenu.tsx';
import { Traza, TrazaType } from '../api/types/traza-types.ts';
import { Client, ClientType } from '../api/types/client-types.ts';
import { FieldOverlay } from './FieldOverlay.tsx';
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTemplateSchema, Template, TemplateType } from "../api/types/template-type.ts";
import { createTemplate, updateTemplate, uploadPdfFile } from "../api/templates-api.ts";
import { Toast } from "./Toast.tsx";
import { Alert } from "./Alert.tsx";
import { Spinner } from "./Spinner.tsx";
import { useNavigate } from "react-router";
import { Document, Page, pdfjs } from "react-pdf"
import 'pdfjs-dist/web/pdf_viewer.css';
import { createPdfWithFields } from '../utils/pdfUtils';
import { Field } from '../api/types/field-types';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type PDFViewerProps = {
	file: File | string | null;
	onSaveFields?: (fields: Field[]) => void;
	template?: TemplateType | null,
};

export const PDFViewer: React.FC<PDFViewerProps> = ({ file, onSaveFields, template = null }) => {

	const [fields, setFields] = useState<Field[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);
	const [drawing, setDrawing] = useState<{ x: number; y: number } | null>(null);
	const [rect, setRect] = useState<Partial<Field> | null>(null);
	const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
	const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
	const [resizingFieldId, setResizingFieldId] = useState<string | null>(null);
	const [resizeMode, setResizeMode] = useState<'horizontal' | 'vertical' | 'both' | null>(null);
	const [scale, setScale] = useState<number>(1);
	const [contextMenu, setContextMenu] = useState<{ x: number, y: number, fieldId: string } | null>(null);
	const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null);
	const [pendingField, setPendingField] = useState<Partial<Field> | null>(null);
	const [pendingFieldRect, setPendingFieldRect] = useState<Partial<Field> | null>(null);
	const [pendingFieldName, setPendingFieldName] = useState<keyof TrazaType | keyof ClientType | ''>('');
	const [isSelecting, setIsSelecting] = useState(false); // Changed to false to disable manual drawing by default
	const [pickingColorForField, setPickingColorForField] = useState<string | null>(null);
	const [isPickingColor, setIsPickingColor] = useState(false);

	// Canvas ref for color picking
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [, setPdfPage] = useState<unknown>(null);

	// PDF dimensions state
	const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number } | null>(null);

	const [isLoading, setIsLoading] = useState(false);
	const [show, setShow] = useState(false)
	const [showErrors, setShowErrors] = useState(false)
	const [message, setMessage] = useState('')
	const loadedTemplatesRef = useRef<Set<string>>(new Set());

	const navigate = useNavigate();

	const contextMenuField = contextMenu
		? fields.find(f => f.id === contextMenu.fieldId)
		: null;

	const trazaKeys = useMemo(() => (
		Object.keys(new Traza({})) as (keyof TrazaType)[])
		.sort((a, b) => a.localeCompare(b)), []
	);

	const clientKeys = useMemo(() => (
		Object.keys(new Client({})) as (keyof ClientType)[]
	).sort((a, b) => a.localeCompare(b)), []);

	let isAdmin = false;

	if (window.location.pathname.includes("admin")) {
		isAdmin = true;
	}

	const path: string = isAdmin ? "/admin" : "/user";

	// Helper functions to convert between viewport and PDF coordinates
	const viewportToPdfCoordinates = useCallback((viewportX: number, viewportY: number, viewportWidth: number, viewportHeight: number) => {
		if (!pdfDimensions) return { x: viewportX, y: viewportY };

		const scaleX = pdfDimensions.width / viewportWidth;
		const scaleY = pdfDimensions.height / viewportHeight;

		return {
			x: viewportX * scaleX,
			y: viewportY * scaleY
		};
	}, [pdfDimensions]);

	const pdfToViewportCoordinates = useCallback((pdfX: number, pdfY: number, viewportWidth: number, viewportHeight: number) => {
		if (!pdfDimensions) return { x: pdfX, y: pdfY };

		const scaleX = viewportWidth / pdfDimensions.width;
		const scaleY = viewportHeight / pdfDimensions.height;

		return {
			x: pdfX * scaleX,
			y: pdfY * scaleY
		};
	}, [pdfDimensions]);

	const {
		register,
		handleSubmit,
		formState: { errors },
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
			fontFamily: f.fontFamily || 'Helvetica',
			fontSize: f.fontSize || 6,
			align: f.align || 'left',
			color: f.backgroundColor || '#ffffff',
		}));

		if (!template) {

			setIsLoading(true);

			if (file) {
				const uploadFileName = await uploadPdfFile(file instanceof File ? file : new File([file], templateData.name, { type: 'application/pdf' }))

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

			console.log('Saving template with fields:', templateData.fields);
			const savedTemplate = await updateTemplate(template.id, templateData);

			if (savedTemplate) {
				console.log('Template saved successfully:', savedTemplate);
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
							? { ...f, x: f.x + dx, y: f.y + dy }
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
		if (!contextMenu) return;

		function handleClickOutside(e: MouseEvent) {
			const menu = document.getElementById('pdf-context-menu');
			const fieldCreationDialog = document.querySelector('[style*="zIndex: 1001"]'); // Field creation dialog

			// Don't close if clicking inside the context menu or field creation dialog
			if (menu && !menu.contains(e.target as Node) &&
				(!fieldCreationDialog || !fieldCreationDialog.contains(e.target as Node))) {
				// Add a small delay to allow select dropdowns to open
				setTimeout(() => {
					setContextMenu(null);
				}, 50);
			}
		}

		// Use click instead of mousedown to allow input interactions
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	}, [contextMenu]);

	// Load template fields if provided (only if we haven't loaded this template yet)
	useEffect(() => {
		if (template && Array.isArray(template.fields)) {
			const templateId = template.id;

			console.log('Template loading effect triggered:', {
				templateId,
				hasLoaded: loadedTemplatesRef.current.has(templateId),
				fieldsCount: template.fields.length,
				currentFieldsCount: fields.length
			});

			// Only load template fields if we haven't loaded this specific template yet
			if (!loadedTemplatesRef.current.has(templateId)) {
				console.log('Loading template fields for template:', templateId);
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
				}) as Field);

				setFields(templateFields);
				setValue('name', template.name || '');
				loadedTemplatesRef.current.add(templateId);
				console.log('Template fields loaded:', templateFields.length, 'fields');
			} else {
				console.log('Template already loaded, skipping:', templateId);
			}
		}
	}, [fields.length, setValue, template, template?.id]); // Only depend on template ID, not the entire template object

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
				const viewport = page.getViewport({ scale: 1 });

				setPdfDimensions({
					width: viewport.width,
					height: viewport.height
				});

				console.log('PDF dimensions loaded:', { width: viewport.width, height: viewport.height });
			} catch (error) {
				console.error('Error loading PDF dimensions:', error);
			}
		};

		loadPdfDimensions();
	}, [file]);

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
				// Convert File to ArrayBuffer for pdfjs
				let pdfData: string | ArrayBuffer;
				if (file instanceof File) {
					pdfData = await file.arrayBuffer();
				} else {
					pdfData = file;
				}

				const pdf = await pdfjs.getDocument(pdfData).promise;
				const page = await pdf.getPage(1);
				const viewport = page.getViewport({ scale: 1 });

				canvas.width = viewport.width;
				canvas.height = viewport.height;

				const renderContext = {
					canvasContext: ctx,
					viewport: viewport
				};

				await page.render(renderContext).promise;
				setPdfPage(page);
			} catch (error) {
				console.error('Error loading PDF to canvas:', error);
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

				// Calculate viewport coordinates relative to the PDF element
				const viewportX = (rect.left - pdfRect.left) / scale;
				const viewportY = (rect.top - pdfRect.top) / scale;
				const viewportWidth = rect.width / scale;
				const viewportHeight = rect.height / scale;

				// Convert to PDF coordinates
				const pdfCoords = viewportToPdfCoordinates(viewportX, viewportY, pdfRect.width / scale, pdfRect.height / scale);
				const pdfWidth = viewportToPdfCoordinates(viewportWidth, 0, pdfRect.width / scale, pdfRect.height / scale).x;
				const pdfHeight = viewportToPdfCoordinates(0, viewportHeight, pdfRect.width / scale, pdfRect.height / scale).y;

				// Only create field if we have a valid selection with minimum size
				if (pdfWidth > 5 && pdfHeight > 5) {
					setPendingFieldRect({ x: pdfCoords.x, y: pdfCoords.y, width: pdfWidth, height: pdfHeight });
					setPendingField({ x: pdfCoords.x, y: pdfCoords.y, width: pdfWidth, height: pdfHeight });
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
			// Use hidden canvas for color picking (most accurate)
			const canvas = canvasRef.current;
			if (canvas) {
				const ctx = canvas.getContext('2d');
				if (ctx) {
					// Get click coordinates relative to the container
					const container = containerRef.current;
					if (!container) return;

					const rect = container.getBoundingClientRect();
					const x = e.clientX - rect.left;
					const y = e.clientY - rect.top;

					// Find the actual PDF element to get its real dimensions
					const pdfElement = container.querySelector('.react-pdf__Page');
					if (!pdfElement) return;

					const pdfRect = pdfElement.getBoundingClientRect();
					const containerRect = container.getBoundingClientRect();

					// Calculate PDF coordinates relative to the container
					const pdfX = x - (pdfRect.left - containerRect.left);
					const pdfY = y - (pdfRect.top - containerRect.top);

					// Ensure coordinates are within PDF bounds
					if (pdfX >= 0 && pdfX <= pdfRect.width && pdfY >= 0 && pdfY <= pdfRect.height) {
						// Convert PDF coordinates to canvas coordinates
						const canvasX = (pdfX / pdfRect.width) * canvas.width;
						const canvasY = (pdfY / pdfRect.height) * canvas.height;

						console.log('Coordinate conversion:', {
							clickX: x,
							clickY: y,
							pdfX,
							pdfY,
							pdfRect: { width: pdfRect.width, height: pdfRect.height },
							canvasX,
							canvasY,
							canvasSize: { width: canvas.width, height: canvas.height }
						});

						// Ensure coordinates are within canvas bounds
						if (canvasX >= 0 && canvasX < canvas.width && canvasY >= 0 && canvasY < canvas.height) {
							const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
							if (pixel && pixel.length >= 3) {
								const hex = `#${[pixel[0], pixel[1], pixel[2]]
									.map((c) => c.toString(16).padStart(2, '0'))
									.join('')}`;

								console.log('Color picked:', hex, 'RGB:', [pixel[0], pixel[1], pixel[2]]);

								updateFieldProperty(pickingColorForField, 'backgroundColor', hex);
								setPickingColorForField(null);

								setShow(true);
								setMessage(`Color seleccionado: ${hex}`);
								setTimeout(() => setShow(false), 2000);
								return;
							}
						}
					}
				}
			}

			// Fallback to native color picker if canvas fails
			const colorInput = document.createElement('input');
			colorInput.type = 'color';
			colorInput.value = '#ffffff';
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

			// Final fallback to default color
			updateFieldProperty(pickingColorForField, 'backgroundColor', '#ffffff');
			setPickingColorForField(null);

			setShow(true);
			setMessage('Error al seleccionar color. Usando color por defecto.');
			setTimeout(() => setShow(false), 3000);
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

		// Calculate viewport coordinates
		const viewportX = (e.clientX - pdfRect.left) / scale;
		const viewportY = (e.clientY - pdfRect.top) / scale;

		// Convert to PDF coordinates
		const pdfCoords = viewportToPdfCoordinates(viewportX, viewportY, pdfRect.width / scale, pdfRect.height / scale);

		setDrawing({
			x: pdfCoords.x,
			y: pdfCoords.y
		});
	}

	function handleMouseMove(e: React.MouseEvent) {
		if (!containerRef.current) return;

		// Get the PDF element for accurate coordinate calculation
		const pdfElement = containerRef.current.querySelector('.react-pdf__Page');
		if (!pdfElement) return;

		const pdfRect = pdfElement.getBoundingClientRect();

		if (drawing) {
			// Calculate viewport coordinates
			const viewportX2 = (e.clientX - pdfRect.left) / scale;
			const viewportY2 = (e.clientY - pdfRect.top) / scale;

			// Convert to PDF coordinates
			const pdfCoords2 = viewportToPdfCoordinates(viewportX2, viewportY2, pdfRect.width / scale, pdfRect.height / scale);

			const x = Math.min(drawing.x, pdfCoords2.x);
			const y = Math.min(drawing.y, pdfCoords2.y);
			const width = Math.abs(pdfCoords2.x - drawing.x);
			const height = Math.abs(pdfCoords2.y - drawing.y);
			setRect({ x, y, width, height });
		} else if (draggingFieldId) {
			const field = fields.find(f => f.id === draggingFieldId);
			if (!field) return;

			// Calculate viewport coordinates
			const viewportX = (e.clientX - pdfRect.left - dragOffset.current.x) / scale;
			const viewportY = (e.clientY - pdfRect.top - dragOffset.current.y) / scale;

			// Convert to PDF coordinates
			const pdfCoords = viewportToPdfCoordinates(viewportX, viewportY, pdfRect.width / scale, pdfRect.height / scale);

			setFields((prev) =>
				prev.map((f) => (f.id === draggingFieldId ? { ...f, x: pdfCoords.x, y: pdfCoords.y } : f))
			);
		} else if (resizingFieldId && resizeMode) {
			const field = fields.find(f => f.id === resizingFieldId);
			if (!field) return;

			// Calculate viewport coordinates
			const viewportX = (e.clientX - pdfRect.left) / scale;
			const viewportY = (e.clientY - pdfRect.top) / scale;

			// Convert to PDF coordinates
			const pdfCoords = viewportToPdfCoordinates(viewportX, viewportY, pdfRect.width / scale, pdfRect.height / scale);

			setFields((prev) =>
				prev.map((f) =>
					f.id === resizingFieldId
						? {
							...f,
							width: resizeMode === 'horizontal' || resizeMode === 'both'
								? Math.max(7.5, pdfCoords.x - field.x)
								: field.width,
							height: resizeMode === 'vertical' || resizeMode === 'both'
								? Math.max(7.5, pdfCoords.y - field.y)
								: field.height,
						}
						: f
				)
			);
		}
	}

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

		// Since we're using Document component instead of canvas, use a default background color
		// or implement a more sophisticated color sampling method if needed

		if (pendingField && 'id' in pendingField) {
			setFields(fields =>
				fields.map(f =>
					f.id === pendingField.id
						? { ...f, name: pendingFieldName, backgroundColor }
						: f
				)
			);
		} else {
			setFields([
				...fields,
				{
					id: crypto.randomUUID(),
					x: pendingFieldRect.x ?? 0,
					y: pendingFieldRect.y ?? 0,
					width: pendingFieldRect.width ?? 0,
					height: pendingFieldRect.height ?? 0,
					name: pendingFieldName,
					backgroundColor,
				} as Field
			]);
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
		} else {
			console.log('Etiquetas guardadas:', fields);
		}

	}

	const handleRemoveField = useCallback((id: string) => {
		setFields(fields => fields.filter(f => f.id !== id));
	}, []);

	const handleFieldContextMenu = useCallback((e: React.MouseEvent, fieldId: string) => {
		e.preventDefault();
		setContextMenu({ x: e.clientX, y: e.clientY, fieldId });
	}, []);

	function updateFieldProperty(fieldId: string, prop: keyof Field, value: unknown) {
		setFields(fields => fields.map(f => f.id === fieldId ? { ...f, [prop]: value } : f));
	}

	const startDraggingField = useCallback((e: React.MouseEvent, id: string, field: Field) => {
		if (contextMenu) return;
		e.stopPropagation();
		if (!containerRef.current) return;

		// Get the PDF element for accurate coordinate calculation
		const pdfElement = containerRef.current.querySelector('.react-pdf__Page');
		if (!pdfElement) return;

		const pdfRect = pdfElement.getBoundingClientRect();

		// Calculate viewport coordinates
		const viewportX = (e.clientX - pdfRect.left) / scale - field.x;
		const viewportY = (e.clientY - pdfRect.top) / scale - field.y;

		// Convert to PDF coordinates for offset calculation
		const pdfOffset = viewportToPdfCoordinates(viewportX, viewportY, pdfRect.width / scale, pdfRect.height / scale);

		dragOffset.current = {
			x: pdfOffset.x,
			y: pdfOffset.y,
		};
		setActiveFieldId(id);
		setDraggingFieldId(id);
	}, [contextMenu, scale, viewportToPdfCoordinates]);



	const handleEditField = useCallback((field: Field) => {
		setPendingField(field);
		setPendingFieldRect(field);
		setPendingFieldName(field.name);
	}, []);

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
								? (<Spinner styles='m-auto pb-10.5 grid' />)
								: <>
									<button type='submit'
										className="ml-4 px-2 py-1 bg-blue-500 text-white rounded"
										onClick={handleSaveAll}>
										Guardar Plantilla
									</button>
									<button type='button'
										className="ml-2 px-2 py-1 bg-green-600 text-white rounded"
										onClick={() => createPdfWithFields(file!, fields)}>
										Generar PDF con Etiquetas
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
						<div className="absolute bottom-2 right-2 bg-gray-800 text-white px-3 py-2 rounded shadow-lg z-10 text-sm">
							💡 <strong>Consejo:</strong> Haz clic y arrastra sobre el texto que quieres convertir en campo
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
						// Convert PDF coordinates to viewport coordinates for display
						const pdfElement = containerRef.current?.querySelector('.react-pdf__Page');
						const pdfRect = pdfElement?.getBoundingClientRect();
						const viewportCoords = pdfRect ? pdfToViewportCoordinates(f.x, f.y, pdfRect.width / scale, pdfRect.height / scale) : { x: f.x, y: f.y };
						const viewportWidth = pdfRect ? pdfToViewportCoordinates(f.width, 0, pdfRect.width / scale, pdfRect.height / scale).x : f.width;
						const viewportHeight = pdfRect ? pdfToViewportCoordinates(0, f.height, pdfRect.width / scale, pdfRect.height / scale).y : f.height;

						return (
							<FieldOverlay
								key={f.id}
								field={{
									...f,
									x: viewportCoords.x,
									y: viewportCoords.y,
									width: viewportWidth,
									height: viewportHeight
								}}
								scale={scale}
								isActive={activeFieldId === f.id}
								onEdit={handleEditField}
								onRemove={handleRemoveField}
								onContextMenu={handleFieldContextMenu}
								onMouseDown={startDraggingField}
								onResize={startResizingField}
								setActive={handleSetActiveFieldId}
							/>
						);
					})}
					{rect && !pendingField && (() => {
						// Convert PDF coordinates to viewport coordinates for display
						const pdfElement = containerRef.current?.querySelector('.react-pdf__Page');
						const pdfRect = pdfElement?.getBoundingClientRect();
						const viewportCoords = pdfRect ? pdfToViewportCoordinates(rect.x!, rect.y!, pdfRect.width / scale, pdfRect.height / scale) : { x: rect.x!, y: rect.y! };
						const viewportWidth = pdfRect ? pdfToViewportCoordinates(rect.width!, 0, pdfRect.width / scale, pdfRect.height / scale).x : rect.width!;
						const viewportHeight = pdfRect ? pdfToViewportCoordinates(0, rect.height!, pdfRect.width / scale, pdfRect.height / scale).y : rect.height!;

						return (
							<div className="absolute border-2 border-red-500"
								style={{
									left: viewportCoords.x * scale,
									top: viewportCoords.y * scale,
									width: viewportWidth * scale,
									height: viewportHeight * scale
								}} />
						);
					})()}

					{/* Highlight selected text area */}
					{pendingField && pendingFieldRect && !isSelecting && (() => {
						// Convert PDF coordinates to viewport coordinates for display
						const pdfElement = containerRef.current?.querySelector('.react-pdf__Page');
						const pdfRect = pdfElement?.getBoundingClientRect();
						const viewportCoords = pdfRect ? pdfToViewportCoordinates(pendingFieldRect.x ?? 0, pendingFieldRect.y ?? 0, pdfRect.width / scale, pdfRect.height / scale) : { x: pendingFieldRect.x ?? 0, y: pendingFieldRect.y ?? 0 };
						const viewportWidth = pdfRect ? pdfToViewportCoordinates(pendingFieldRect.width ?? 0, 0, pdfRect.width / scale, pdfRect.height / scale).x : pendingFieldRect.width ?? 0;
						const viewportHeight = pdfRect ? pdfToViewportCoordinates(0, pendingFieldRect.height ?? 0, pdfRect.width / scale, pdfRect.height / scale).y : pendingFieldRect.height ?? 0;

						return (
							<div className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-20"
								style={{
									left: viewportCoords.x * scale,
									top: viewportCoords.y * scale,
									width: viewportWidth * scale,
									height: viewportHeight * scale
								}} />
						);
					})()}
					{/* Field creation select */}
					{pendingField && pendingFieldRect && (() => {
						// Convert PDF coordinates to viewport coordinates for display
						const pdfElement = containerRef.current?.querySelector('.react-pdf__Page');
						const pdfRect = pdfElement?.getBoundingClientRect();
						const viewportCoords = pdfRect ? pdfToViewportCoordinates(pendingFieldRect.x ?? 0, pendingFieldRect.y ?? 0, pdfRect.width / scale, pdfRect.height / scale) : { x: pendingFieldRect.x ?? 0, y: pendingFieldRect.y ?? 0 };

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
								<select value={pendingFieldName}
									onChange={e => setPendingFieldName(e.target.value as keyof TrazaType | keyof ClientType)}
									onClick={(e) => e.stopPropagation()}
									onMouseDown={(e) => e.stopPropagation()}
									className="border rounded px-2 py-1 bg-white text-black border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-w-[200px]">
									<option value=''>-- Seleccione una propiedad --</option>

									{/* Traza Properties */}
									<optgroup label="📊 Propiedades de Traza">
										{trazaKeys.map(key => (
											<option key={`traza-${key}`} value={key}>
												📊 {key}
											</option>
										))}
									</optgroup>

									{/* Client Properties */}
									<optgroup label="👤 Propiedades de Cliente">
										{clientKeys.map(key => (
											<option key={`client-${key}`} value={key}>
												👤 {key}
											</option>
										))}
									</optgroup>
								</select>
								<button type="button"
									className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
									disabled={!pendingFieldName}
									onClick={(e) => {
										e.stopPropagation();
										handleAddField();
									}}>
									{pendingField && 'id' in pendingField ? 'Editar' : 'Crear Campo'}
								</button>
								<button type="button"
									className="ml-2 px-2 py-1 bg-gray-400 text-white rounded"
									onClick={(e) => {
										e.stopPropagation();
										setPendingField(null);
										setPendingFieldRect(null);
										setPendingFieldName('');
									}}>
									Cancelar
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
			</div>
			<Toast>
				{show && <Alert message={message} />}
			</Toast>
			{showErrors && (
				<Toast>
					{errorMap.length > 0 && errorMap.map((error, index) => (
						<Alert message={error!} key={index} />
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
