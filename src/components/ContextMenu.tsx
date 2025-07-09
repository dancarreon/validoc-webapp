import React from 'react';
import {Field} from './PDFViewer';

type Props = {
	contextMenu: { x: number, y: number, fieldId: string };
	field: Field;
	updateFieldProperty: (fieldId: string, prop: keyof Field, value: unknown) => void;
};

export const ContextMenu: React.FC<Props & { onPickColor: () => void }> = (
	{
		contextMenu,
		field,
		updateFieldProperty,
		onPickColor,
	}) => (
	<div
		id="pdf-context-menu"
		className="fixed bg-black z-50 p-2 rounded-md min-w-[220px]"
		style={{
			top: contextMenu.y,
			left: contextMenu.x,
		}}
	>
		<div className="flex justify-between items-center mb-1.5">
			<label className="block text-xs">Font:</label>
			<select value={field.fontFamily || 'Helvetica'}
					onChange={e => updateFieldProperty(field.id, 'fontFamily', e.target.value)}
					className="w-[120px] text-left">
				<option value="Helvetica">Helvetica</option>
				<option value="TimesRoman">TimesRoman</option>
				<option value="Courier">Courier</option>
			</select>
		</div>
		<div className="flex justify-between items-center mb-1.5">
			<label className="block text-xs">Tamaño:</label>
			<input type="number"
				   min={6}
				   max={72}
				   value={field.fontSize || 14}
				   onChange={e => updateFieldProperty(field.id, 'fontSize', parseInt(e.target.value, 10))}
				   className="w-[120px] text-left"/>
		</div>
		<div className="flex justify-between items-center mb-1.5">
			<label className="block text-xs">Alineación:</label>
			<select value={field.align || 'left'}
					onChange={e => updateFieldProperty(field.id, 'align', e.target.value)}
					className="w-[120px] text-left">
				<option value="left">Left</option>
				<option value="center">Center</option>
				<option value="right">Right</option>
			</select>
		</div>
		<div className="flex justify-between items-center mb-1.5">
			<label className="block text-xs">Ancho:</label>
			<input type="number"
				   value={field.width}
				   onChange={e => updateFieldProperty(field.id, 'width', Number(e.target.value))}
				   className="w-[120px] text-left border rounded px-1 py-0.5"/>
		</div>
		<div className="flex justify-between items-center mb-1.5">
			<label className="block text-xs">Alto:</label>
			<input type="number"
				   value={field.height}
				   onChange={e => updateFieldProperty(field.id, 'height', Number(e.target.value))}
				   className="w-[120px] text-left border rounded px-1 py-0.5"/>
		</div>
		<div className="flex justify-between items-center mb-1.5">
			<label className="block text-xs">Pos X:</label>
			<input type="number"
				   value={field.x}
				   onChange={e => updateFieldProperty(field.id, 'x', Number(e.target.value))}
				   className="w-[120px] text-left border rounded px-1 py-0.5"/>
		</div>
		<div className="flex justify-between items-center mb-1.5">
			<label className="block text-xs">Pos Y:</label>
			<input type="number"
				   value={field.y}
				   onChange={e => updateFieldProperty(field.id, 'y', Number(e.target.value))}
				   className="w-[120px] text-left border rounded px-1 py-0.5"/>
		</div>
		<div className="flex justify-between items-center">
			<label className="block text-xs">Color:</label>
			<button type="button"
					onClick={onPickColor}
					className="flex items-center gap-2">
				<div className="w-30 h-6 border border-gray-300 rounded inline-block"
					 style={{background: field.backgroundColor || '#fff'}}/>
			</button>
		</div>
	</div>
);
