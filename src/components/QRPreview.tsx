import React, {useEffect, useRef} from 'react';
import QRCode from 'qrcode';

interface QRPreviewProps {
	data: string;
	size: number;
	color: string;
	backgroundColor: string;
	errorCorrectionLevel: 'low' | 'medium' | 'quartile' | 'high';
	className?: string;
}

export const QRPreview: React.FC<QRPreviewProps> = ({
														data,
														size,
														color,
														backgroundColor,
														errorCorrectionLevel,
														className = ''
													}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !data.trim()) return;

		// Clear the canvas first
		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}

		// Generate QR code
		QRCode.toCanvas(canvas, data, {
			width: size,
			margin: 1,
			color: {
				dark: color,
				light: backgroundColor
			},
			errorCorrectionLevel
		}).catch((error) => {
			console.error('Error generating QR code:', error);
			// Draw error message on canvas
			if (ctx) {
				ctx.fillStyle = '#ff0000';
				ctx.font = '12px Arial';
				ctx.textAlign = 'center';
				ctx.fillText('Error generating QR', canvas.width / 2, canvas.height / 2);
			}
		});
	}, [data, size, color, backgroundColor, errorCorrectionLevel]);

	return (
		<div className={`flex flex-col items-center ${className}`}>
			<canvas
				ref={canvasRef}
				width={size}
				height={size}
				className="border border-gray-300 rounded"
				style={{
					maxWidth: '100%',
					height: 'auto'
				}}
			/>
			{!data.trim() && (
				<div className="mt-2 text-xs text-gray-500 text-center">
					Ingresa datos para ver la vista previa
				</div>
			)}
		</div>
	);
};
