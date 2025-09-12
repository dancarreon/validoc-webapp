import React, { useEffect, useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Import text layer CSS
import 'pdfjs-dist/web/pdf_viewer.css';

type PDFLibViewerProps = {
	file: File | string | null;
	onSaveFields?: (fields: any[]) => void;
	template?: any | null;
};

export const PDFLibViewer: React.FC<PDFLibViewerProps> = ({ file }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const textLayerRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(1);
	const [containerWidth, setContainerWidth] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [pdfPage, setPdfPage] = useState<any>(null);
	const [isSelecting, setIsSelecting] = useState(false);
	const [selectedText, setSelectedText] = useState<string>('');
	const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
	const [debugMode, setDebugMode] = useState(false);

	// Create text layer for text selection
	const createTextLayer = async (page: any, displayWidth: number, scale: number) => {
		if (!textLayerRef.current) return;

		// Clear existing text layer
		textLayerRef.current.innerHTML = '';

		// Get text content from PDF page
		const textContent = await page.getTextContent();
		const viewport = page.getViewport({ scale: 1 });
		const textLayerScale = (displayWidth * scale) / viewport.width;

		console.log('Creating text layer:', {
			textItemsCount: textContent.items.length,
			viewport: { width: viewport.width, height: viewport.height },
			textLayerScale,
			displayWidth,
			scale
		});

		// Create text layer div
		const textLayerDiv = document.createElement('div');
		textLayerDiv.className = 'textLayer';
		textLayerDiv.style.position = 'absolute';
		textLayerDiv.style.left = '0';
		textLayerDiv.style.top = '0';
		textLayerDiv.style.right = '0';
		textLayerDiv.style.bottom = '0';
		textLayerDiv.style.overflow = 'hidden';
		textLayerDiv.style.opacity = debugMode ? '0.3' : '0.01';
		textLayerDiv.style.lineHeight = '1.0';
		textLayerDiv.style.userSelect = 'text';
		textLayerDiv.style.cursor = 'text';
		textLayerDiv.style.pointerEvents = 'auto';
		textLayerDiv.style.zIndex = '10';

		// Group text items by lines for better positioning
		const lines: any[] = [];
		let currentLine: any[] = [];
		let lastY = -1;

		textContent.items.forEach((item: any) => {
			if (!item.str || item.str.trim() === '') return;
			
			const y = item.transform[5];
			if (lastY === -1 || Math.abs(y - lastY) < 5) {
				currentLine.push(item);
			} else {
				if (currentLine.length > 0) {
					lines.push(currentLine);
				}
				currentLine = [item];
			}
			lastY = y;
		});
		
		if (currentLine.length > 0) {
			lines.push(currentLine);
		}

		// Create text spans for each line
		lines.forEach((line, lineIndex) => {
			const lineDiv = document.createElement('div');
			lineDiv.style.position = 'absolute';
			lineDiv.style.userSelect = 'text';
			lineDiv.style.cursor = 'text';
			lineDiv.style.pointerEvents = 'auto';
			lineDiv.style.zIndex = '10';
			
			// Calculate line position
			const firstItem = line[0];
			const x = firstItem.transform[4] * textLayerScale;
			const y = (viewport.height - firstItem.transform[5] - firstItem.height) * textLayerScale;
			
			lineDiv.style.left = `${x}px`;
			lineDiv.style.top = `${y}px`;
			lineDiv.style.fontSize = `${firstItem.height * textLayerScale}px`;
			lineDiv.style.fontFamily = firstItem.fontName || 'sans-serif';
			lineDiv.style.color = debugMode ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.01)';
			lineDiv.style.whiteSpace = 'pre';
			
			// Add all text items in the line
			line.forEach((item: any, itemIndex: number) => {
				const span = document.createElement('span');
				span.textContent = item.str;
				span.style.userSelect = 'text';
				span.style.cursor = 'text';
				span.style.pointerEvents = 'auto';
				lineDiv.appendChild(span);
				
				// Add debugging for first few items
				if (lineIndex < 3 && itemIndex < 3) {
					console.log(`Line ${lineIndex}, Item ${itemIndex}:`, {
						str: item.str,
						position: { x, y },
						fontSize: firstItem.height * textLayerScale
					});
				}
			});
			
			textLayerDiv.appendChild(lineDiv);
		});

		textLayerRef.current.appendChild(textLayerDiv);
		console.log('Text layer created with', lines.length, 'lines and', textLayerDiv.children.length, 'elements');
	};

	// Handle text selection
	const handleTextSelection = () => {
		const selection = window.getSelection();
		if (!selection || selection.isCollapsed) {
			setSelectedText('');
			setSelectionRect(null);
			return;
		}

		const range = selection.getRangeAt(0);
		const rect = range.getBoundingClientRect();
		
		if (!containerRef.current) return;

		const containerRect = containerRef.current.getBoundingClientRect();
		
		// Check if selection is within the PDF container
		if (
			rect.left >= containerRect.left &&
			rect.right <= containerRect.right &&
			rect.top >= containerRect.top &&
			rect.bottom <= containerRect.bottom
		) {
			const selectedText = selection.toString().trim();
			if (selectedText) {
				setSelectedText(selectedText);
				
				// Calculate selection rectangle relative to container
				const selectionRect = {
					x: rect.left - containerRect.left,
					y: rect.top - containerRect.top,
					width: rect.width,
					height: rect.height
				};
				setSelectionRect(selectionRect);
				
				console.log('Text selected:', selectedText, 'Rect:', selectionRect);
			}
		}
	};

	// Load PDF and render to canvas
	useEffect(() => {
		if (!file || !canvasRef.current || !containerWidth) return;

		const loadAndRenderPDF = async () => {
			setIsLoading(true);
			try {
				const arrayBuffer = file instanceof File
					? await file.arrayBuffer()
					: await fetch(file).then(res => res.arrayBuffer());

				// Load with PDF-lib to get exact dimensions
				const pdfLibDoc = await PDFDocument.load(arrayBuffer);
				const pdfLibPage = pdfLibDoc.getPage(0);
				const { width, height } = pdfLibPage.getSize();

				// Load with PDF.js for rendering
				const pdfJsDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
				const pdfJsPage = await pdfJsDoc.getPage(1);
				const viewport = pdfJsPage.getViewport({ scale: 1 });

				// Store the page for text layer
				setPdfPage(pdfJsPage);

				// Render PDF to canvas using PDF.js
				const canvas = canvasRef.current!;
				const ctx = canvas.getContext('2d')!;
				
				// Set canvas size based on container width and scale
				const displayWidth = containerWidth;
				const displayHeight = (viewport.height / viewport.width) * displayWidth;
				
				// Set canvas dimensions
				canvas.width = displayWidth * scale;
				canvas.height = displayHeight * scale;
				canvas.style.width = `${displayWidth}px`;
				canvas.style.height = `${displayHeight}px`;

				// Clear canvas first
				ctx.clearRect(0, 0, canvas.width, canvas.height);

				// Calculate the correct scale for rendering
				const renderScale = (displayWidth * scale) / viewport.width;

				// Render PDF using PDF.js
				const renderContext = {
					canvasContext: ctx,
					canvas: canvas,
					viewport: pdfJsPage.getViewport({ scale: renderScale })
				};

				await pdfJsPage.render(renderContext).promise;

				// Create text layer for text selection
				await createTextLayer(pdfJsPage, displayWidth, scale);

				console.log('PDF loaded successfully:', {
					pdfLibDimensions: { width, height },
					pdfJsViewport: { width: viewport.width, height: viewport.height },
					displayDimensions: { width: displayWidth, height: displayHeight },
					canvasDimensions: { width: canvas.width, height: canvas.height },
					renderScale,
					scale
				});

			} catch (error) {
				console.error('Error loading PDF:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadAndRenderPDF();
	}, [file, containerWidth, scale]);

	// Update text layer when scale or debug mode changes
	useEffect(() => {
		if (pdfPage && containerWidth) {
			const displayWidth = containerWidth;
			createTextLayer(pdfPage, displayWidth, scale);
		}
	}, [scale, pdfPage, containerWidth, debugMode]);

	// Add text selection event listeners
	useEffect(() => {
		document.addEventListener('mouseup', handleTextSelection);
		document.addEventListener('selectionchange', handleTextSelection);

		return () => {
			document.removeEventListener('mouseup', handleTextSelection);
			document.removeEventListener('selectionchange', handleTextSelection);
		};
	}, []);

	// Set container width on mount and handle resize
	useEffect(() => {
		const updateContainerWidth = () => {
			if (containerRef.current) {
				const width = containerRef.current.offsetWidth;
				setContainerWidth(width);
				console.log('Container width updated:', width);
			}
		};

		// Set initial width immediately
		updateContainerWidth();
		
		// Use a small delay to ensure the container is fully rendered
		const timeoutId = setTimeout(updateContainerWidth, 100);
		
		window.addEventListener('resize', updateContainerWidth);
		window.addEventListener('orientationchange', updateContainerWidth);

		return () => {
			clearTimeout(timeoutId);
			window.removeEventListener('resize', updateContainerWidth);
			window.removeEventListener('orientationchange', updateContainerWidth);
		};
	}, []);

	if (!file) return <div className="text-gray-500">No PDF selected.</div>;

	return (
		<div className="inline-block items-center justify-center w-full p-4 pt-2">
			<h2 className="text-xl font-bold mb-6 text-black">PDF Viewer (PDF-lib)</h2>
			
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
				
				{/* Text selection mode toggle */}
				<button type='button'
					className={`px-3 py-1 rounded text-white ${isSelecting ? 'bg-blue-600' : 'bg-green-600'}`}
					onClick={() => setIsSelecting(!isSelecting)}>
					{isSelecting ? 'Disable Text Selection' : 'Enable Text Selection'}
				</button>
				
				{/* Debug mode toggle */}
				<button type='button'
					className={`px-3 py-1 rounded text-white ${debugMode ? 'bg-red-600' : 'bg-gray-600'}`}
					onClick={() => setDebugMode(!debugMode)}>
					{debugMode ? 'Hide Text Layer' : 'Show Text Layer'}
				</button>
				
				{/* Selected text display */}
				{selectedText && (
					<div className="ml-4 px-3 py-1 bg-blue-100 border border-blue-300 rounded text-black">
						<strong>Selected:</strong> "{selectedText}"
						<button 
							type="button"
							className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-sm"
							onClick={() => {
								console.log('Creating field from selected text:', selectedText);
								// TODO: Implement field creation from selected text
								alert(`Field creation from text "${selectedText}" - Feature coming soon!`);
							}}
						>
							Create Field
						</button>
						<button 
							type="button"
							className="ml-1 px-2 py-1 bg-gray-500 text-white rounded text-sm"
							onClick={() => {
								setSelectedText('');
								setSelectionRect(null);
								window.getSelection()?.removeAllRanges();
							}}
						>
							Clear
						</button>
					</div>
				)}
			</div>

			<div ref={containerRef}
				className={`relative border rounded shadow overflow-auto w-full min-h-[600px] bg-[#f8f8f8] ${isSelecting ? 'cursor-text' : 'cursor-default'}`}
				style={{ userSelect: isSelecting ? 'text' : 'none' }}>
				
				{isLoading && (
					<div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
						<div className="text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
							<div className="text-gray-600">Cargando PDF...</div>
						</div>
					</div>
				)}
				
				<canvas
					ref={canvasRef}
					style={{ display: 'block' }}
				/>
				
				{/* Text layer for text selection */}
				{isSelecting && (
					<div 
						ref={textLayerRef}
						className="absolute inset-0 pointer-events-auto"
						style={{ zIndex: 1 }}
					/>
				)}
				
				{/* Selection rectangle overlay */}
				{selectionRect && isSelecting && (
					<div 
						className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-30 pointer-events-none"
						style={{
							left: selectionRect.x,
							top: selectionRect.y,
							width: selectionRect.width,
							height: selectionRect.height,
							zIndex: 2
						}}
					/>
				)}
				
				{/* Text selection mode indicator */}
				{isSelecting && (
					<div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded shadow-lg z-10">
						📝 Text Selection Mode: Select text in the PDF
					</div>
				)}
			</div>
		</div>
	);
};