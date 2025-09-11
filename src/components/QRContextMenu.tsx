import React, { useState } from 'react';
import { Field } from '../api/types/field-types';
import { ConfirmDialog } from './ConfirmDialog';
import { QRPreview } from './QRPreview';

// Extended Field type for internal use with QR properties
type FieldWithQR = Field & {
	qrData?: string;
	qrSize?: number;
	qrColor?: string;
	qrBackgroundColor?: string;
	qrErrorCorrectionLevel?: string;
};

type Props = {
	contextMenu: { x: number, y: number, fieldId: string };
	field: FieldWithQR;
	updateFieldProperty: (fieldId: string, prop: keyof FieldWithQR, value: unknown) => void;
	onDelete: (fieldId: string) => void;
	onClose: () => void;
};

export const QRContextMenu: React.FC<Props> = ({
	contextMenu,
	field,
	updateFieldProperty,
	onDelete,
	onClose,
}) => {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	// QR Error Correction Level options
	const errorCorrectionLevels = [
		{ value: 'L', label: 'L - Low (~7%)' },
		{ value: 'M', label: 'M - Medium (~15%)' },
		{ value: 'Q', label: 'Q - Quartile (~25%)' },
		{ value: 'H', label: 'H - High (~30%)' }
	];

	return (
		<div
			id="qr-context-menu"
			className="fixed bg-black z-50 p-3 rounded-md min-w-[600px] max-w-[700px]"
			style={{
				top: contextMenu.y,
				left: contextMenu.x,
			}}
			onClick={(e) => e.stopPropagation()}
			onMouseDown={(e) => e.stopPropagation()}
		>
			{/* Header */}
			<div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-600">
				<h3 className="text-sm font-semibold text-white">🔲 Configuración QR</h3>
				<button
					type="button"
					onClick={onClose}
					className="text-gray-400 hover:text-white text-lg leading-none"
				>
					×
				</button>
			</div>

			{/* Main Content - Two Columns */}
			<div className="flex gap-4">
				{/* Left Column - Controls */}
				<div className="flex-1">
					{/* QR Data */}
					<div className="mb-3">
						<label className="block text-xs text-white mb-1">Datos QR:</label>
						<textarea
							value={field.qrData || ''}
							onChange={(e) => updateFieldProperty(field.id, 'qrData', e.target.value)}
							onClick={(e) => e.stopPropagation()}
							onMouseDown={(e) => e.stopPropagation()}
							className="w-full text-left bg-white text-black border border-gray-300 rounded px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
							rows={3}
							placeholder="Ingresa los datos para el código QR..."
						/>
					</div>

					{/* QR Size */}
					<div className="flex justify-between items-center mb-3">
						<label className="block text-xs text-white">Tamaño QR:</label>
						<input
							type="number"
							min={50}
							max={500}
							value={field.qrSize || 100}
							onChange={(e) => updateFieldProperty(field.id, 'qrSize', parseInt(e.target.value, 10))}
							onClick={(e) => e.stopPropagation()}
							onMouseDown={(e) => e.stopPropagation()}
							className="w-[120px] text-left bg-white text-black border border-gray-300 rounded px-1 py-0.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:h-6 [&::-webkit-inner-spin-button]:h-6 [&::-webkit-outer-spin-button]:w-8 [&::-webkit-inner-spin-button]:w-8 [&::-moz-number-spin-box]:appearance-none [&::-moz-number-spin-up]:appearance-none [&::-moz-number-spin-down]:appearance-none"
						/>
					</div>

					{/* QR Color */}
					<div className="flex justify-between items-center mb-3">
						<label className="block text-xs text-white">Color QR:</label>
						<div className="flex items-center gap-2">
							<input
								type="color"
								value={field.qrColor || '#000000'}
								onChange={(e) => updateFieldProperty(field.id, 'qrColor', e.target.value)}
								onClick={(e) => e.stopPropagation()}
								onMouseDown={(e) => e.stopPropagation()}
								className="w-8 h-6 border border-gray-300 rounded cursor-pointer"
							/>
							<span className="text-xs text-gray-300 w-16">
								{field.qrColor || '#000000'}
							</span>
						</div>
					</div>

					{/* QR Background Color */}
					<div className="flex justify-between items-center mb-3">
						<label className="block text-xs text-white">Fondo QR:</label>
						<div className="flex items-center gap-2">
							<input
								type="color"
								value={field.qrBackgroundColor || '#ffffff'}
								onChange={(e) => updateFieldProperty(field.id, 'qrBackgroundColor', e.target.value)}
								onClick={(e) => e.stopPropagation()}
								onMouseDown={(e) => e.stopPropagation()}
								className="w-8 h-6 border border-gray-300 rounded cursor-pointer"
							/>
							<span className="text-xs text-gray-300 w-16">
								{field.qrBackgroundColor || '#ffffff'}
							</span>
						</div>
					</div>

					{/* Error Correction Level */}
					<div className="mb-3">
						<label className="block text-xs text-white mb-1">Nivel de Corrección:</label>
						<select
							value={field.qrErrorCorrectionLevel || 'M'}
							onChange={(e) => updateFieldProperty(field.id, 'qrErrorCorrectionLevel', e.target.value)}
							onClick={(e) => e.stopPropagation()}
							onMouseDown={(e) => e.stopPropagation()}
							className="w-full text-left bg-white text-black border border-gray-300 rounded px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
						>
							{errorCorrectionLevels.map(level => (
								<option key={level.value} value={level.value}>
									{level.label}
								</option>
							))}
						</select>
					</div>

					{/* Field Properties */}
					<div className="mb-3 pt-2 border-t border-gray-600">
						<h4 className="text-xs text-gray-300 mb-2">Propiedades del Campo:</h4>
						
						{/* Width */}
						<div className="flex justify-between items-center mb-2">
							<label className="block text-xs text-white">Ancho:</label>
							<input
								type="number"
								value={field.width}
								onChange={(e) => updateFieldProperty(field.id, 'width', Number(e.target.value))}
								onClick={(e) => e.stopPropagation()}
								onMouseDown={(e) => e.stopPropagation()}
								className="w-[80px] text-left bg-white text-black border border-gray-300 rounded px-1 py-0.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:h-6 [&::-webkit-inner-spin-button]:h-6 [&::-webkit-outer-spin-button]:w-8 [&::-webkit-inner-spin-button]:w-8 [&::-moz-number-spin-box]:appearance-none [&::-moz-number-spin-up]:appearance-none [&::-moz-number-spin-down]:appearance-none"
							/>
						</div>

						{/* Height */}
						<div className="flex justify-between items-center mb-2">
							<label className="block text-xs text-white">Alto:</label>
							<input
								type="number"
								value={field.height}
								onChange={(e) => updateFieldProperty(field.id, 'height', Number(e.target.value))}
								onClick={(e) => e.stopPropagation()}
								onMouseDown={(e) => e.stopPropagation()}
								className="w-[80px] text-left bg-white text-black border border-gray-300 rounded px-1 py-0.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:h-6 [&::-webkit-inner-spin-button]:h-6 [&::-webkit-outer-spin-button]:w-8 [&::-webkit-inner-spin-button]:w-8 [&::-moz-number-spin-box]:appearance-none [&::-moz-number-spin-up]:appearance-none [&::-moz-number-spin-down]:appearance-none"
							/>
						</div>

						{/* Position X */}
						<div className="flex justify-between items-center mb-2">
							<label className="block text-xs text-white">Pos X:</label>
							<input
								type="number"
								value={field.x}
								onChange={(e) => updateFieldProperty(field.id, 'x', Number(e.target.value))}
								onClick={(e) => e.stopPropagation()}
								onMouseDown={(e) => e.stopPropagation()}
								className="w-[80px] text-left bg-white text-black border border-gray-300 rounded px-1 py-0.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:h-6 [&::-webkit-inner-spin-button]:h-6 [&::-webkit-outer-spin-button]:w-8 [&::-webkit-inner-spin-button]:w-8 [&::-moz-number-spin-box]:appearance-none [&::-moz-number-spin-up]:appearance-none [&::-moz-number-spin-down]:appearance-none"
							/>
						</div>

						{/* Position Y */}
						<div className="flex justify-between items-center mb-3">
							<label className="block text-xs text-white">Pos Y:</label>
							<input
								type="number"
								value={field.y}
								onChange={(e) => updateFieldProperty(field.id, 'y', Number(e.target.value))}
								onClick={(e) => e.stopPropagation()}
								onMouseDown={(e) => e.stopPropagation()}
								className="w-[80px] text-left bg-white text-black border border-gray-300 rounded px-1 py-0.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:h-6 [&::-webkit-inner-spin-button]:h-6 [&::-webkit-outer-spin-button]:w-8 [&::-webkit-inner-spin-button]:w-8 [&::-moz-number-spin-box]:appearance-none [&::-moz-number-spin-up]:appearance-none [&::-moz-number-spin-down]:appearance-none"
							/>
						</div>
					</div>
				</div>

				{/* Right Column - Preview */}
				<div className="flex-1">
					<div className="mb-3">
						<h4 className="text-xs text-gray-300 mb-2">Vista Previa:</h4>
						<div className="bg-white p-3 rounded border border-gray-600">
							<QRPreview
								data={field.qrData || ''}
								size={Math.min(field.qrSize || 100, 200)} // Limit preview size
								color={field.qrColor || '#000000'}
								backgroundColor={field.qrBackgroundColor || '#ffffff'}
								errorCorrectionLevel={field.qrErrorCorrectionLevel === 'L' ? 'low' : 
									field.qrErrorCorrectionLevel === 'M' ? 'medium' : 
									field.qrErrorCorrectionLevel === 'Q' ? 'quartile' : 
									field.qrErrorCorrectionLevel === 'H' ? 'high' : 'medium'}
								className="justify-center"
							/>
						</div>
						
						{/* Preview Info */}
						<div className="mt-2 text-xs text-gray-400">
							<div className="mb-1">
								<strong>Tamaño:</strong> {field.qrSize || 100}px
							</div>
							<div className="mb-1">
								<strong>Corrección:</strong> {errorCorrectionLevels.find(l => l.value === (field.qrErrorCorrectionLevel || 'M'))?.label || 'M - Medium (~15%)'}
							</div>
							<div className="mb-1">
								<strong>Colores:</strong> {field.qrColor || '#000000'} / {field.qrBackgroundColor || '#ffffff'}
							</div>
							{field.qrData && (
								<div className="mt-2 p-2 bg-gray-800 rounded text-xs">
									<strong>Datos:</strong> {field.qrData.length > 50 ? `${field.qrData.substring(0, 50)}...` : field.qrData}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Actions */}
			<div className="flex justify-between items-center pt-2 border-t border-gray-600">
				<button
					type="button"
					onClick={() => setShowDeleteConfirm(true)}
					className="px-3 py-1 text-xs text-white bg-red-600 rounded shadow-sm opacity-90 hover:opacity-100 hover:bg-red-700 transition-all duration-150 font-bold flex items-center gap-1"
				>
					🗑️ Eliminar
				</button>
				<button
					type="button"
					onClick={onClose}
					className="px-3 py-1 text-xs text-white bg-gray-600 rounded shadow-sm opacity-90 hover:opacity-100 hover:bg-gray-700 transition-all duration-150"
				>
					Cerrar
				</button>
			</div>

			<ConfirmDialog
				isOpen={showDeleteConfirm}
				title="Eliminar Campo QR"
				message={`¿Estás seguro de que quieres eliminar el campo QR "${field.name}"?`}
				confirmText="Eliminar"
				cancelText="Cancelar"
				onConfirm={() => {
					onDelete(field.id);
					setShowDeleteConfirm(false);
					onClose();
				}}
				onCancel={() => setShowDeleteConfirm(false)}
			/>
		</div>
	);
};
