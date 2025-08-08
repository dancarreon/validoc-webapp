import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
	text?: string;
	size?: number;
	color?: string;
	backgroundColor?: string;
	errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
	className?: string;
	onError?: (error: Error) => void;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
	text = 'https://example.com',
	size = 200,
	color = '#000000',
	backgroundColor = '#ffffff',
	errorCorrectionLevel = 'M',
	className = '',
	onError,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const generateQRCode = async () => {
		if (!canvasRef.current || !text.trim()) return;

		setIsGenerating(true);
		setError(null);

		try {
			await QRCode.toCanvas(canvasRef.current, text, {
				width: size,
				margin: 2,
				color: {
					dark: color,
					light: backgroundColor,
				},
				errorCorrectionLevel,
			});
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Error generating QR code';
			setError(errorMessage);
			onError?.(err instanceof Error ? err : new Error(errorMessage));
		} finally {
			setIsGenerating(false);
		}
	};

	useEffect(() => {
		generateQRCode();
	}, [text, size, color, backgroundColor, errorCorrectionLevel, generateQRCode]);

	const downloadQRCode = () => {
		if (!canvasRef.current) return;

		const link = document.createElement('a');
		link.download = `qrcode-${Date.now()}.png`;
		link.href = canvasRef.current.toDataURL();
		link.click();
	};

	const copyToClipboard = async () => {
		if (!canvasRef.current) return;

		try {
			const blob = await new Promise<Blob>((resolve) => {
				canvasRef.current!.toBlob((blob) => {
					if (blob) resolve(blob);
				});
			});

			await navigator.clipboard.write([
				new ClipboardItem({
					'image/png': blob,
				}),
			]);

			// Show success message (you can integrate with your toast system)
			console.log('QR code copied to clipboard!');
		} catch (err) {
			console.error('Failed to copy QR code:', err);
		}
	};

	return (
		<div className={`qr-code-generator ${className}`}>
			<div className="qr-code-container">
				{isGenerating && (
					<div className="qr-loading">
						<div className="spinner"></div>
						<span>Generating QR Code...</span>
					</div>
				)}

				{error && (
					<div className="qr-error">
						<span>Error: {error}</span>
					</div>
				)}

				<canvas
					ref={canvasRef}
					className="qr-canvas"
					style={{
						display: isGenerating || error ? 'none' : 'block',
						maxWidth: '100%',
						height: 'auto',
					}}
				/>

				{!isGenerating && !error && (
					<div className="qr-actions">
						<button
							onClick={downloadQRCode}
							className="qr-btn qr-btn-download"
							title="Download QR Code"
						>
							📥 Download
						</button>
						<button
							onClick={copyToClipboard}
							className="qr-btn qr-btn-copy"
							title="Copy to Clipboard"
						>
							📋 Copy
						</button>
					</div>
				)}
			</div>

			<style>{`
				.qr-code-generator {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 1rem;
				}

				.qr-code-container {
					position: relative;
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 1rem;
					padding: 1rem;
					border: 1px solid #e5e7eb;
					border-radius: 0.5rem;
					background: white;
				}

				.qr-loading {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 0.5rem;
					color: #6b7280;
				}

				.spinner {
					width: 2rem;
					height: 2rem;
					border: 2px solid #e5e7eb;
					border-top: 2px solid #3b82f6;
					border-radius: 50%;
					animation: spin 1s linear infinite;
				}

				@keyframes spin {
					0% { transform: rotate(0deg); }
					100% { transform: rotate(360deg); }
				}

				.qr-error {
					color: #dc2626;
					text-align: center;
					padding: 1rem;
				}

				.qr-canvas {
					border: 1px solid #e5e7eb;
					border-radius: 0.25rem;
				}

				.qr-actions {
					display: flex;
					gap: 0.5rem;
				}

				.qr-btn {
					padding: 0.5rem 1rem;
					border: none;
					border-radius: 0.25rem;
					font-size: 0.875rem;
					cursor: pointer;
					transition: all 0.2s;
				}

				.qr-btn-download {
					background: #3b82f6;
					color: white;
				}

				.qr-btn-download:hover {
					background: #2563eb;
				}

				.qr-btn-copy {
					background: #10b981;
					color: white;
				}

				.qr-btn-copy:hover {
					background: #059669;
				}
			`}</style>
		</div>
	);
};

// Advanced QR Code Generator with Form Controls
interface QRCodeGeneratorFormProps {
	initialText?: string;
	onQRCodeGenerated?: (dataUrl: string) => void;
}

export const QRCodeGeneratorForm: React.FC<QRCodeGeneratorFormProps> = ({
	initialText = 'https://example.com',
	onQRCodeGenerated,
}) => {
	const [text, setText] = useState(initialText);
	const [size, setSize] = useState(200);
	const [color, setColor] = useState('#000000');
	const [backgroundColor, setBackgroundColor] = useState('#ffffff');
	const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const generateQRCode = async () => {
		if (!canvasRef.current || !text.trim()) return;

		try {
			await QRCode.toCanvas(canvasRef.current, text, {
				width: size,
				margin: 2,
				color: {
					dark: color,
					light: backgroundColor,
				},
				errorCorrectionLevel,
			});

			// Call the callback with the generated QR code data URL
			onQRCodeGenerated?.(canvasRef.current.toDataURL());
		} catch (err) {
			console.error('Error generating QR code:', err);
		}
	};

	useEffect(() => {
		generateQRCode();
	}, [text, size, color, backgroundColor, errorCorrectionLevel, generateQRCode]);

	return (
		<div className="qr-generator-form">
			<div className="form-controls">
				<div className="form-group">
					<label htmlFor="qr-text">Text/URL:</label>
					<input
						id="qr-text"
						type="text"
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="Enter text or URL"
						className="form-input"
					/>
				</div>

				<div className="form-group">
					<label htmlFor="qr-size">Size:</label>
					<input
						id="qr-size"
						type="range"
						min="100"
						max="400"
						value={size}
						onChange={(e) => setSize(Number(e.target.value))}
						className="form-range"
					/>
					<span>{size}px</span>
				</div>

				<div className="form-group">
					<label htmlFor="qr-color">QR Color:</label>
					<input
						id="qr-color"
						type="color"
						value={color}
						onChange={(e) => setColor(e.target.value)}
						className="form-color"
					/>
				</div>

				<div className="form-group">
					<label htmlFor="qr-bg-color">Background Color:</label>
					<input
						id="qr-bg-color"
						type="color"
						value={backgroundColor}
						onChange={(e) => setBackgroundColor(e.target.value)}
						className="form-color"
					/>
				</div>

				<div className="form-group">
					<label htmlFor="qr-error-level">Error Correction:</label>
					<select
						id="qr-error-level"
						value={errorCorrectionLevel}
						onChange={(e) => setErrorCorrectionLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
						className="form-select"
					>
						<option value="L">Low (7%)</option>
						<option value="M">Medium (15%)</option>
						<option value="Q">Quartile (25%)</option>
						<option value="H">High (30%)</option>
					</select>
				</div>
			</div>

			<QRCodeGenerator
				text={text}
				size={size}
				color={color}
				backgroundColor={backgroundColor}
				errorCorrectionLevel={errorCorrectionLevel}
			/>

			<style>{`
				.qr-generator-form {
					display: flex;
					flex-direction: column;
					gap: 2rem;
					max-width: 600px;
					margin: 0 auto;
					padding: 2rem;
				}

				.form-controls {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
					gap: 1rem;
				}

				.form-group {
					display: flex;
					flex-direction: column;
					gap: 0.5rem;
				}

				.form-group label {
					font-weight: 500;
					color: #374151;
				}

				.form-input,
				.form-select {
					padding: 0.5rem;
					border: 1px solid #d1d5db;
					border-radius: 0.25rem;
					font-size: 0.875rem;
				}

				.form-input:focus,
				.form-select:focus {
					outline: none;
					border-color: #3b82f6;
					box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
				}

				.form-range {
					width: 100%;
				}

				.form-color {
					width: 3rem;
					height: 2rem;
					border: 1px solid #d1d5db;
					border-radius: 0.25rem;
					cursor: pointer;
				}

				.form-select {
					padding: 0.5rem;
					border: 1px solid #d1d5db;
					border-radius: 0.25rem;
					font-size: 0.875rem;
					background: #fff;
					color: #1f2937;
					transition: border-color 0.2s, box-shadow 0.2s;
				}

				.form-select:focus, .form-select:hover {
					border-color: #3b82f6;
					box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
					outline: none;
				}
			`}</style>
		</div>
	);
};
