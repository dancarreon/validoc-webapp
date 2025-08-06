import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {ContextMenu} from './ContextMenu.tsx';
import {Traza, TrazaType} from '../api/types/traza-types.ts';
import {FieldOverlay} from './FieldOverlay.tsx';
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {CreateTemplateSchema, Template, TemplateType} from "../api/types/template-type.ts";
import {createTemplate, updateTemplate, uploadPdfFile} from "../api/templates-api.ts";
import {Toast} from "./Toast.tsx";
import {Alert} from "./Alert.tsx";
import {Spinner} from "./Spinner.tsx";
import {useNavigate} from "react-router";
import {pdfjs} from "react-pdf"
import 'pdfjs-dist/web/pdf_viewer.css';
import {createPdfWithFields} from '../utils/pdfUtils';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export type Field = {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	name: keyof TrazaType;
	fontFamily?: string; //'Helvetica' | 'Courier' | undefined;
	fontSize?: number;
	align?: string; //'left' | 'center' | 'right';
	saved?: boolean;
	backgroundColor?: string;
};

type PDFViewerProps = {
	file: File | string | null;
	onSaveFields?: (fields: Field[]) => void;
	template?: TemplateType | null,
};

export const PDFViewer: React.FC<PDFViewerProps> = ({file, onSaveFields, template = null}) => {

	const [fields, setFields] = useState<Field[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);
	const [drawing, setDrawing] = useState<{ x: number; y: number } | null>(null);
	const [rect, setRect] = useState<Partial<Field> | null>(null);
	const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
	const dragOffset = useRef<{ x: number; y: number }>({x: 0, y: 0});
	const [resizingFieldId, setResizingFieldId] = useState<string | null>(null);
	const [scale, setScale] = useState<number>(1);
	const [contextMenu, setContextMenu] = useState<{ x: number, y: number, fieldId: string } | null>(null);
	const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null);
	const [pendingField, setPendingField] = useState<Partial<Field> | null>(null);
	const [pendingFieldRect, setPendingFieldRect] = useState<Partial<Field> | null>(null);
	const [pendingFieldName, setPendingFieldName] = useState<keyof TrazaType | ''>('');
	const [isSelecting, setIsSelecting] = useState(true);
	const [, setColor] = useState<string | null>(null);
	const [pickingColorForField, setPickingColorForField] = useState<string | null>(null);

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [, setPdfPage] = useState<unknown>(null);

	const [isLoading, setIsLoading] = useState(false);
	const [show, setShow] = useState(false)
	const [showErrors, setShowErrors] = useState(false)
	const [message, setMessage] = useState('')

	const navigate = useNavigate();

	const contextMenuField = contextMenu
		? fields.find(f => f.id === contextMenu.fieldId)
		: null;

	const trazaKeys = useMemo(() => (
		Object.keys(new Traza({})) as (keyof TrazaType)[])
		.sort((a, b) => a.localeCompare(b)), []
	);

	let isAdmin = false;

	if (window.location.pathname.includes("admin")) {
		isAdmin = true;
	}

	const path: string = isAdmin ? "/admin" : "/user";

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
			fontFamily: f.fontFamily || 'Helvetica',
			fontSize: f.fontSize || 6,
			align: f.align || 'left',
			color: f.backgroundColor || '#ffffff',
		}));

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
			}

			setIsLoading(false);
		}
	};

	// Set container width on mount
	useEffect(() => {
		if (containerRef.current) {
			setContainerWidth(containerRef.current.offsetWidth);
		}
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
		if (!contextMenu) return;

		function handleClickOutside(e: MouseEvent) {
			const menu = document.getElementById('pdf-context-menu');
			if (menu && !menu.contains(e.target as Node)) {
				setContextMenu(null);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [contextMenu]);

	// Load template fields if provided
	useEffect(() => {
		if (template && Array.isArray(template.fields)) {
			setFields(template.fields.map(f => ({
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
			}) as Field));
			setValue('name', template.name || '');
		}
	}, [setValue, template]);

	// Load and render PDF to canvas
	useEffect(() => {

		async function renderPdf() {
			if (!file || !canvasRef.current || !containerWidth) return;
			let data: ArrayBuffer;
			if (typeof file === 'string') {
				const res = await fetch(file);
				data = await res.arrayBuffer();
			} else {
				data = await file.arrayBuffer();
			}
			const pdfDoc = await pdfjs.getDocument({data}).promise;
			const page = await pdfDoc.getPage(1);
			setPdfPage(page);

			const viewport = page.getViewport({scale: 1});
			const devicePixelRatio = window.devicePixelRatio || 1;
			const displayWidth = containerWidth * scale;
			const displayHeight = displayWidth * (viewport.height / viewport.width);

			const canvas = canvasRef.current;
			const context = canvas.getContext('2d');
			if (!context) return;
			canvas.width = displayWidth * devicePixelRatio;
			canvas.height = displayHeight * devicePixelRatio;
			canvas.style.width = `${displayWidth}px`;
			canvas.style.height = `${displayHeight}px`;

			// Only scale for high-DPI, do NOT flip
			context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

			// Render PDF (no context.save/translate/scale)
			const renderViewport = page.getViewport({scale: displayWidth / viewport.width});
			const renderTask = page.render({canvasContext: context, viewport: renderViewport});

			await renderTask?.promise;

			// Wait 300ms after rendering is complete
			setTimeout(() => {
				// waiting for the PDF to render completely
			}, 500);
		}

		renderPdf();
	}, [file, scale, containerWidth]);

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
				// Convert to PDF coordinates
				const x = (rect.left - containerRect.left + containerRef.current.scrollLeft) / scale;
				const y = (rect.top - containerRect.top + containerRef.current.scrollTop) / scale;
				const width = rect.width / scale;
				const height = rect.height / scale;

				setPendingFieldRect({x, y, width, height});
				setPendingField({x, y, width, height});
				// Optionally, clear the selection
				selection.removeAllRanges();
			}
		}

		document.addEventListener('mouseup', handleTextSelection);
		return () => document.removeEventListener('mouseup', handleTextSelection);
	}, [scale]);

	const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const ctx = canvas.getContext('2d');
		const pixel = ctx?.getImageData(x, y, 1, 1).data;
		if (pixel) {
			const hex = `#${[pixel[0], pixel[1], pixel[2]]
				.map((c) => c.toString(16).padStart(2, '0'))
				.join('')}`;
			if (pickingColorForField) {
				// Set the color for the field and exit color picking mode
				updateFieldProperty(pickingColorForField, 'backgroundColor', hex);
				setPickingColorForField(null);
			} else {
				setColor(hex); // If you want to keep the generic color picker
			}
		}
	};


	function handleMouseDown(e: React.MouseEvent) {
		if (!containerRef.current) return;
		const rect = containerRef.current.getBoundingClientRect();
		const scrollLeft = containerRef.current.scrollLeft;
		const scrollTop = containerRef.current.scrollTop;
		setDrawing({
			x: (e.clientX - rect.left + scrollLeft) / scale,
			y: (e.clientY - rect.top + scrollTop) / scale
		});
	}

	function handleMouseMove(e: React.MouseEvent) {
		if (!containerRef.current) return;
		const rect = containerRef.current.getBoundingClientRect();
		const scrollLeft = containerRef.current.scrollLeft;
		const scrollTop = containerRef.current.scrollTop;

		if (drawing) {
			const x2 = (e.clientX - rect.left + scrollLeft) / scale;
			const y2 = (e.clientY - rect.top + scrollTop) / scale;
			const x = Math.min(drawing.x, x2);
			const y = Math.min(drawing.y, y2);
			const width = Math.abs(x2 - drawing.x);
			const height = Math.abs(y2 - drawing.y);
			setRect({x, y, width, height});
		} else if (draggingFieldId) {
			const field = fields.find(f => f.id === draggingFieldId);
			if (!field) return;
			const x = (e.clientX - rect.left + scrollLeft - dragOffset.current.x) / scale;
			const y = (e.clientY - rect.top + scrollTop - dragOffset.current.y) / scale;
			setFields((prev) =>
				prev.map((f) => (f.id === draggingFieldId ? {...f, x, y} : f))
			);
		} else if (resizingFieldId) {
			const field = fields.find(f => f.id === resizingFieldId);
			if (!field) return;
			const x = (e.clientX - rect.left + scrollLeft) / scale;
			const y = (e.clientY - rect.top + scrollTop) / scale;
			setFields((prev) =>
				prev.map((f) =>
					f.id === resizingFieldId
						? {
							...f,
							width: Math.max(7.5, x - field.x),
							height: Math.max(7.5, y - field.y),
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
	}

	function handleAddField() {
		if (!pendingFieldRect || !pendingFieldName) return;
		let backgroundColor = '#ffffff';
		if (canvasRef.current) {
			const ctx = canvasRef.current.getContext('2d');
			if (ctx) {
				// Sample at the bottom-left of the field
				const leftX = Math.round((pendingFieldRect.x ?? 0) * scale);
				const bottomY = Math.round(((pendingFieldRect.y ?? 0) + (pendingFieldRect.height ?? 0)) * scale);
				const bottomLeftPixel = ctx.getImageData(leftX, bottomY, 1, 1).data;
				backgroundColor = `#${[bottomLeftPixel[0], bottomLeftPixel[1], bottomLeftPixel[2]].map(c => c.toString(16).padStart(2, '0')).join('')}`;
			}
		}
		if (pendingField && 'id' in pendingField) {
			setFields(fields =>
				fields.map(f =>
					f.id === pendingField.id
						? {...f, name: pendingFieldName, backgroundColor}
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

	const startResizingField = useCallback((e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		setResizingFieldId(id);
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
		setContextMenu({x: e.clientX, y: e.clientY, fieldId});
	}, []);

	function updateFieldProperty(fieldId: string, prop: keyof Field, value: unknown) {
		setFields(fields => fields.map(f => f.id === fieldId ? {...f, [prop]: value} : f));
	}

	const startDraggingField = useCallback((e: React.MouseEvent, id: string, field: Field) => {
		if (contextMenu) return;
		e.stopPropagation();
		if (!containerRef.current) return;
		const rect = containerRef.current.getBoundingClientRect();
		const scrollLeft = containerRef.current.scrollLeft;
		const scrollTop = containerRef.current.scrollTop;
		dragOffset.current = {
			x: (e.clientX - rect.left + scrollLeft) / scale - field.x,
			y: (e.clientY - rect.top + scrollTop) / scale - field.y,
		};
		setActiveFieldId(id);
		setDraggingFieldId(id);
	}, [contextMenu, scale]);

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
											onClick={() => createPdfWithFields(file!, fields, containerWidth)}>
										Generar PDF con Etiquetas
									</button>
								</>
						}
					</div>
				</div>
				<div ref={containerRef}
					 className={`relative border rounded shadow overflow-auto w-full h-[100%] bg-[#f8f8f8]${!isSelecting ? ' noselect' : ''}`}
					 onClick={handleContainerClick}
					 onMouseDown={handleMouseDown}
					 onMouseMove={handleMouseMove}
					 onMouseUp={handleMouseUp}>
					{containerWidth && (
						<canvas className='w-full' ref={canvasRef} onClick={handleClick}/>
					)}
					{/*<Document file={file}>
						<Page pageNumber={1} width={containerWidth * scale}/>
					</Document>*/}
					{fields.map((f) => (
						<FieldOverlay
							key={f.id}
							field={f}
							scale={scale}
							isActive={activeFieldId === f.id}
							onEdit={handleEditField}
							onRemove={handleRemoveField}
							onContextMenu={handleFieldContextMenu}
							onMouseDown={startDraggingField}
							onResize={startResizingField}
							setActive={handleSetActiveFieldId}
						/>
					))}
					{rect && !pendingField && (
						<div className="absolute border-2 border-red-500"
							 style={{
								 left: rect.x! * scale,
								 top: rect.y! * scale,
								 width: rect.width! * scale,
								 height: rect.height! * scale
							 }}/>
					)}
					{/* Field creation select */}
					{pendingField && pendingFieldRect && (
						<div className="absolute bg-black border rounded-md shadow p-2"
							 style={{
								 left: (pendingFieldRect.x ?? 0) * scale,
								 top: ((pendingFieldRect.y ?? 0) * scale) - 40,
								 zIndex: 1001,
							 }}>
							<label className="block text-xs mb-1">Seleccione la propiedad de la Traza a mostrar:</label>
							<select value={pendingFieldName}
									onChange={e => setPendingFieldName(e.target.value as keyof TrazaType)}
									className="border rounded px-1 py-0.5 bg-black">
								<option value=''>-- Seleccionar --</option>
								{trazaKeys.map(key => (
									<option key={key} value={key}>{key}</option>
								))}
							</select>
							<button className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
									disabled={!pendingFieldName}
									onClick={handleAddField}>
								+
							</button>
							<button className="ml-2 px-2 py-1 bg-gray-400 text-white rounded"
									onClick={() => {
										setPendingField(null);
										setPendingFieldRect(null);
										setPendingFieldName('');
									}}>
								Cancelar
							</button>
						</div>
					)}
				</div>
				{contextMenu && contextMenuField && (
					<ContextMenu
						contextMenu={contextMenu}
						field={contextMenuField}
						updateFieldProperty={updateFieldProperty}
						onPickColor={() => setPickingColorForField(contextMenuField.id)}
					/>
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
					<div className="bg-black text-white px-4 py-2 rounded shadow-lg pointer-events-auto">
						Haz click en algún punto del PDF para seleccionar un color para el fondo del campo.
					</div>
				</div>
			)}
		</form>

	);
};
