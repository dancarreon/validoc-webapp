import React from 'react';
import {Field} from './PDFViewer';

type FieldOverlayProps = {
	field: Field;
	scale: number;
	isActive: boolean;
	onEdit: (f: Field) => void;
	onRemove: (id: string) => void;
	onContextMenu: (e: React.MouseEvent, id: string) => void;
	onMouseDown: (e: React.MouseEvent, id: string, f: Field) => void;
	onResize: (e: React.MouseEvent, id: string) => void;
	setActive: (id: string) => void;
};

export const FieldOverlay: React.FC<FieldOverlayProps> = ({
															  field,
															  scale,
															  isActive,
															  onEdit,
															  onRemove,
															  onContextMenu,
															  onMouseDown,
															  onResize,
															  setActive,
														  }) => (
	<div
		tabIndex={0}
		onFocus={() => setActive(field.id)}
		onClick={e => {
			e.stopPropagation();
			setActive(field.id);
		}}
		onDoubleClick={() => onEdit(field)}
		className={`pdf-overlay absolute border-2 ${isActive ? 'border-yellow-400 bg-yellow-100/80' : 'border-blue-500 bg-blue-200/75'} cursor-move group noselect flex flex-col`}
		style={{
			left: field.x * scale,
			top: field.y * scale,
			width: field.width * scale,
			height: field.height * scale,
			zIndex: isActive ? 10 : 1,
			padding: '2px',
			overflow: 'hidden',
		}}
		onMouseDown={e => onMouseDown(e, field.id, field)}
		onContextMenu={e => onContextMenu(e, field.id)}
		title={String(field.name)}
		aria-label={`Field overlay for ${field.name}`}
	>
		{/* Field type label */}
		<div className="flex justify-between items-center w-full">
            <span className="text-xs font-bold text-black bg-yellow-200/80 px-1 rounded">
                {field.name}
            </span>

			{/* Edit and remove buttons */}
			<div className="flex space-x-1">
				<button
					className="px-1 text-xs text-white bg-blue-500 rounded opacity-80 hover:opacity-100"
					style={{zIndex: 20}}
					onClick={e => {
						e.stopPropagation();
						onEdit(field);
					}}
					aria-label="Edit field"
					title="Edit field"
				>
					✎
				</button>
				<button
					className="px-1 text-xs text-white bg-red-500 rounded opacity-80 hover:opacity-100"
					style={{zIndex: 20}}
					onClick={e => {
						e.stopPropagation();
						onRemove(field.id);
					}}
					aria-label="Remove field"
					title="Remove field"
				>
					×
				</button>
			</div>
		</div>
		{/* Resize handle */}
		<div
			className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize group-hover:block"
			onMouseDown={e => onResize(e, field.id)}
			style={{zIndex: 20}}
			aria-label="Resize field"
			title="Resize field"
		/>
	</div>
);
