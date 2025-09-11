import React, {useState} from 'react';
import {Field} from '../api/types/field-types';
import {ConfirmDialog} from './ConfirmDialog';

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
};

export const ContextMenu: React.FC<Props & { onPickColor: () => void }> = (
	{
		contextMenu,
		field,
		updateFieldProperty,
		onDelete,
		onPickColor,
	}) => {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	return (
	<div
		id="pdf-context-menu"
		className="fixed bg-black z-50 p-2 rounded-md min-w-[220px]"
		style={{
			top: contextMenu.y,
			left: contextMenu.x,
		}}
		onClick={(e) => e.stopPropagation()}
		onMouseDown={(e) => e.stopPropagation()}
	>
		<div className="flex justify-between items-center mb-1.5">
			<label className="block text-xs text-white">Font:</label>
			<select value={field.fontFamily || 'Helvetica'}
					onChange={e => updateFieldProperty(field.id, 'fontFamily', e.target.value)}
					onClick={(e) => e.stopPropagation()}
					onMouseDown={(e) => e.stopPropagation()}
					className="w-[120px] text-left bg-white text-black border border-gray-300 rounded px-1 py-0.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
				<option value="Helvetica">Helvetica</option>
				<option value="TimesRoman">TimesRoman</option>
				<option value="Courier">Courier</option>
			</select>
		</div>
		<div className="flex justify-between items-center mb-1.5">
			<label className="block text-xs text-white">Tamaño:</label>
			<input type="number"
				   min={6}
				   max={72}
				   value={field.fontSize || 14}
				   onChange={e => updateFieldProperty(field.id, 'fontSize', parseInt(e.target.value, 10))}
				   onClick={(e) => e.stopPropagation()}
				   onMouseDown={(e) => e.stopPropagation()}
				   className="w-[120px] text-left bg-white text-black border border-gray-300 rounded px-1 py-0.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:h-6 [&::-webkit-inner-spin-button]:h-6 [&::-webkit-outer-spin-button]:w-8 [&::-webkit-inner-spin-button]:w-8 [&::-moz-number-spin-box]:appearance-none [&::-moz-number-spin-up]:appearance-none [&::-moz-number-spin-down]:appearance-none"/>
		</div>
		<div className="flex justify-between items-center mb-1.5">
			<label className="block text-xs text-white">Alineación:</label>
			<select value={field.align || 'left'}
					onChange={e => updateFieldProperty(field.id, 'align', e.target.value)}
					onClick={(e) => e.stopPropagation()}
					onMouseDown={(e) => e.stopPropagation()}
					className="w-[120px] text-left bg-white text-black border border-gray-300 rounded px-1 py-0.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
				<option value="left">Left</option>
				<option value="center">Center</option>
				<option value="right">Right</option>
			</select>
		</div>
		<div className="flex justify-between items-center mb-1.5">
			<label className="block text-xs text-white">Ancho:</label>
			<input type="number"
				   value={field.width}
				   onChange={e => updateFieldProperty(field.id, 'width', Number(e.target.value))}
				   onClick={(e) => e.stopPropagation()}
				   onMouseDown={(e) => e.stopPropagation()}
				   className="w-[120px] text-left bg-white text-black border border-gray-300 rounded px-1 py-0.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:h-6 [&::-webkit-inner-spin-button]:h-6 [&::-webkit-outer-spin-button]:w-8 [&::-webkit-inner-spin-button]:w-8 [&::-moz-number-spin-box]:appearance-none [&::-moz-number-spin-up]:appearance-none [&::-moz-number-spin-down]:appearance-none"/>
		</div>
		<div className="flex justify-between items-center mb-1.5">
			<label className="block text-xs text-white">Alto:</label>
			<input type="number"
				   value={field.height}
				   onChange={e => updateFieldProperty(field.id, 'height', Number(e.target.value))}
				   onClick={(e) => e.stopPropagation()}
				   onMouseDown={(e) => e.stopPropagation()}
				   className="w-[120px] text-left bg-white text-black border border-gray-300 rounded px-1 py-0.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:h-6 [&::-webkit-inner-spin-button]:h-6 [&::-webkit-outer-spin-button]:w-8 [&::-webkit-inner-spin-button]:w-8 [&::-moz-number-spin-box]:appearance-none [&::-moz-number-spin-up]:appearance-none [&::-moz-number-spin-down]:appearance-none"/>
		</div>
		<div className="flex justify-between items-center mb-1.5">
			<label className="block text-xs text-white">Pos X:</label>
			<input type="number"
				   value={field.x}
				   onChange={e => updateFieldProperty(field.id, 'x', Number(e.target.value))}
				   onClick={(e) => e.stopPropagation()}
				   onMouseDown={(e) => e.stopPropagation()}
				   className="w-[120px] text-left bg-white text-black border border-gray-300 rounded px-1 py-0.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:h-6 [&::-webkit-inner-spin-button]:h-6 [&::-webkit-outer-spin-button]:w-8 [&::-webkit-inner-spin-button]:w-8 [&::-moz-number-spin-box]:appearance-none [&::-moz-number-spin-up]:appearance-none [&::-moz-number-spin-down]:appearance-none"/>
		</div>
		<div className="flex justify-between items-center mb-1.5">
			<label className="block text-xs text-white">Pos Y:</label>
			<input type="number"
				   value={field.y}
				   onChange={e => updateFieldProperty(field.id, 'y', Number(e.target.value))}
				   onClick={(e) => e.stopPropagation()}
				   onMouseDown={(e) => e.stopPropagation()}
				   className="w-[120px] text-left bg-white text-black border border-gray-300 rounded px-1 py-0.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:h-6 [&::-webkit-inner-spin-button]:h-6 [&::-webkit-outer-spin-button]:w-8 [&::-webkit-inner-spin-button]:w-8 [&::-moz-number-spin-box]:appearance-none [&::-moz-number-spin-up]:appearance-none [&::-moz-number-spin-down]:appearance-none"/>
		</div>
		<div className="flex justify-between items-center mb-1.5">
			<label className="block text-xs text-white">Color:</label>
			<button type="button"
					onClick={onPickColor}
					className="flex items-center gap-2">
				<div className="w-30 h-6 border border-gray-300 rounded inline-block"
					 style={{background: field.backgroundColor || '#fff'}}/>
			</button>
		</div>
		<div className="flex justify-between items-center">
			<label className="block text-xs text-white">Acciones:</label>
			<button type="button"
					onClick={() => setShowDeleteConfirm(true)}
					className="px-3 py-1 text-xs text-white bg-red-600 rounded shadow-sm opacity-90 hover:opacity-100 hover:bg-red-700 transition-all duration-150 font-bold flex items-center gap-1">
				🗑️ Eliminar
			</button>
		</div>
		
		<ConfirmDialog
			isOpen={showDeleteConfirm}
			title="Eliminar Campo"
			message={`¿Estás seguro de que quieres eliminar el campo "${field.name}"?`}
			confirmText="Eliminar"
			cancelText="Cancelar"
			onConfirm={() => {
				onDelete(field.id);
				setShowDeleteConfirm(false);
			}}
			onCancel={() => setShowDeleteConfirm(false)}
		/>
	</div>
	);
};
