import React, {useEffect, useRef, useState} from 'react';
import {Document, Page} from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

type Field = {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
    saved?: boolean;
};

type PDFViewerProps = {
    file: File | string | null;
    onSaveFields?: (fields: Field[]) => void;
};

export const PDFViewer: React.FC<PDFViewerProps> = ({file, onSaveFields}) => {
    const [fields, setFields] = useState<Field[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(600);
    const [drawing, setDrawing] = useState<{ x: number; y: number } | null>(null);
    const [rect, setRect] = useState<Partial<Field> | null>(null);
    const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
    const dragOffset = useRef<{ x: number; y: number }>({x: 0, y: 0});
    const [resizingFieldId, setResizingFieldId] = useState<string | null>(null);
    const [scale, setScale] = useState<number>(1.0);

    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }
    }, []);

    function handleMouseDown(e: React.MouseEvent) {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setDrawing({x: e.clientX - rect.left, y: e.clientY - rect.top});
    }

    function handleMouseMove(e: React.MouseEvent) {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        if (drawing) {
            const x2 = e.clientX - rect.left;
            const y2 = e.clientY - rect.top;
            const x = Math.min(drawing.x, x2);
            const y = Math.min(drawing.y, y2);
            const width = Math.abs(x2 - drawing.x);
            const height = Math.abs(y2 - drawing.y);
            setRect({x, y, width, height});
        } else if (activeFieldId) {
            const x = e.clientX - rect.left - dragOffset.current.x;
            const y = e.clientY - rect.top - dragOffset.current.y;
            setFields((prev) =>
                prev.map((f) => (f.id === activeFieldId ? {...f, x, y} : f))
            );
        } else if (resizingFieldId) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setFields((prev) =>
                prev.map((f) =>
                    f.id === resizingFieldId
                        ? {...f, width: Math.max(20, x - f.x), height: Math.max(20, y - f.y)}
                        : f
                )
            );
        }
    }

    function handleMouseUp() {
        if (rect) {
            const name = prompt("Especifique el nombre del dato a mostrar:") || "";
            setFields([...fields, {id: crypto.randomUUID(), ...rect, name} as Field]);
        }
        setDrawing(null);
        setRect(null);
        setActiveFieldId(null);
        setResizingFieldId(null);
    }

    function startDraggingField(e: React.MouseEvent, id: string, field: Field) {
        e.stopPropagation();
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left - field.x,
            y: e.clientY - rect.top - field.y,
        };
        setActiveFieldId(id);
    }

    function startResizingField(e: React.MouseEvent, id: string) {
        e.stopPropagation();
        setResizingFieldId(id);
    }

    function handleSaveAll() {
        if (onSaveFields) {
            onSaveFields(fields);
        } else {
            // fallback: log to console
            console.log('Areas de texto guardadas:', fields);
        }
    }

    async function createPdfWithFields(file: File | string, fields: Field[]) {
        const arrayBuffer = typeof file === 'string'
            ? await fetch(file).then(res => res.arrayBuffer())
            : await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const page = pdfDoc.getPage(0);

        // Get actual PDF page size
        const pdfWidth = page.getWidth();
        const pdfHeight = page.getHeight();

        // Get the DOM container width (where PDF is rendered)
        // You may need to pass containerWidth and scale as arguments or get them from state
        // For this example, assume containerWidth and scale are available
        const renderedWidth = containerWidth * scale;
        const renderedHeight = renderedWidth * (pdfHeight / pdfWidth);

        // Calculate scale factors
        const scaleX = pdfWidth / renderedWidth;
        const scaleY = pdfHeight / renderedHeight;

        fields.forEach(field => {
            // Convert DOM (top-left) to PDF (bottom-left) and scale
            const pdfX = field.x * scaleX;
            const pdfY = pdfHeight - (field.y * scaleY) - (field.height * scaleY);
            const pdfW = field.width * scaleX;
            const pdfH = field.height * scaleY;

            // Draw white rectangle as background
            page.drawRectangle({
                x: pdfX,
                y: pdfY,
                width: pdfW,
                height: pdfH,
                color: rgb(1, 1, 1),
            });

            // Draw the field text
            page.drawText(field.name, {
                x: pdfX,
                y: pdfY,
                size: 14,
                font,
                color: rgb(0, 0, 0),
                maxWidth: pdfW,
            });
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url);
    }

    if (!file) return <div className="text-gray-500">No PDF selected.</div>;

    return (
        <div className="inline-block items-center justify-center w-full p-4 pt-2">
            <h2 className="text-xl font-bold mb-6 text-black">Administración de Plantillas PDF</h2>
            <div className="mb-2 flex gap-2">
                <button className="px-2 py-1 bg-gray-500 rounded text-white"
                        onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
                    Zoom Out
                </button>
                <button className="px-2 py-1 bg-gray-500 rounded text-white"
                        onClick={() => setScale(s => Math.min(3, s + 0.1))}>
                    Zoom In
                </button>
                <span className="ml-2 text-black">Zoom: {(scale * 100).toFixed(0)}%</span>
                <button className="ml-4 px-2 py-1 bg-blue-500 text-white rounded"
                        onClick={handleSaveAll}>
                    Guardar Etiquetas
                </button>
                <button className="ml-2 px-2 py-1 bg-green-600 text-white rounded"
                        onClick={() => createPdfWithFields(file!, fields)}>
                    Generar PDF con Etiquetas
                </button>
            </div>
            <div ref={containerRef}
                 className="relative border rounded shadow overflow-auto"
                 style={{
                     width: '100%', maxWidth: 900, height: 1100, background: '#f8f8f8',
                 }}
                 onMouseDown={handleMouseDown}
                 onMouseMove={handleMouseMove}
                 onMouseUp={handleMouseUp}>
                <Document file={file}>
                    <Page pageNumber={1} width={containerWidth * scale}/>
                </Document>
                {fields.map((f) => (
                    <div key={f.id}
                         className="pdf-overlay absolute border-1 border-blue-500 bg-blue-200/75 cursor-move group"
                         style={{
                             left: f.x * scale,
                             top: f.y * scale,
                             width: f.width * scale,
                             height: f.height * scale
                         }}
                         onMouseDown={(e) => startDraggingField(e, f.id, f)}
                         title={f.name}>
                        <button className="absolute top-0 right-0 text-xs bg-red-500 text-white rounded px-1 z-10"
                                style={{transform: 'translate(50%,-50%)'}}
                                onClick={e => {
                                    e.stopPropagation();
                                    setFields(fields => fields.filter(field => field.id !== f.id));
                                }} aria-label="Remover campo">
                            ×
                        </button>
                        <span
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none whitespace-nowrap bg-white/70 rounded-sm text-xs text-black px-1">
                            {f.name}
                        </span>
                        <div
                            className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize group-hover:block"
                            onMouseDown={(e) => startResizingField(e, f.id)}/>
                    </div>
                ))}
                {rect && (
                    <div className="absolute border-2 border-red-500"
                         style={{
                             left: rect.x! * scale,
                             top: rect.y! * scale,
                             width: rect.width! * scale,
                             height: rect.height! * scale
                         }}/>
                )}
            </div>
        </div>
    );
};
