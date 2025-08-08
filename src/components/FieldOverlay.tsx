import React, {useState} from 'react';
import {Field} from '../api/types/field-types';
import {ConfirmDialog} from './ConfirmDialog';

type FieldOverlayProps = {
	field: Field;
	scale: number;
	isActive: boolean;
	onEdit: (f: Field) => void;
	onRemove: (id: string) => void;
	onContextMenu: (e: React.MouseEvent, id: string) => void;
	onMouseDown: (e: React.MouseEvent, id: string, f: Field) => void;
	onResize: (e: React.MouseEvent, id: string, mode: 'horizontal' | 'vertical' | 'both') => void;
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
														  }) => {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	return (
	<div
		tabIndex={0}
		onFocus={() => setActive(field.id)}
		onClick={e => {
			e.stopPropagation();
			setActive(field.id);
		}}
		onDoubleClick={() => onEdit(field)}
		className={`pdf-overlay absolute border-2 ${isActive ? 'border-yellow-400 bg-yellow-100/90 shadow-lg' : 'border-blue-500 bg-blue-200/85'} cursor-move group noselect flex flex-col rounded-sm`}
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
            <span className="text-xs font-bold text-black bg-yellow-200/90 px-2 py-0.5 rounded shadow-sm border border-yellow-300/50">
                {field.name}
            </span>

			{/* Edit and remove buttons */}
			<div className="flex space-x-1">
				<button
					type="button"
					className="px-1.5 py-0.5 text-xs text-white bg-blue-500 rounded shadow-sm opacity-90 hover:opacity-100 hover:bg-blue-600 transition-all duration-150"
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
					type="button"
					className="px-2 py-0.5 text-xs text-white bg-red-600 rounded shadow-sm opacity-90 hover:opacity-100 hover:bg-red-700 transition-all duration-150 font-bold"
					style={{zIndex: 20}}
					onClick={e => {
						e.stopPropagation();
						setShowDeleteConfirm(true);
					}}
					aria-label="Delete field"
					title="Delete field"
				>
					🗑️
				</button>
			</div>
		</div>
		{/* Resize handles */}
		{/* Horizontal resize handle (right edge) */}
		<div
			className="absolute top-0 right-0 w-[7px] h-full bg-blue-500 cursor-e-resize opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity duration-150"
			onMouseDown={e => onResize(e, field.id, 'horizontal')}
			style={{zIndex: 20}}
			aria-label="Resize field horizontally"
			title="Resize horizontally"
		/>
		{/* Vertical resize handle (bottom edge) */}
		<div
			className="absolute bottom-0 left-0 w-full h-[7px] bg-blue-500 cursor-s-resize opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity duration-150"
			onMouseDown={e => onResize(e, field.id, 'vertical')}
			style={{zIndex: 20}}
			aria-label="Resize field vertically"
			title="Resize vertically"
		/>
		{/* Corner resize handle (both directions) */}
		<div
			className="absolute bottom-0 right-0 w-[7px] h-[7px] bg-blue-500 cursor-se-resize opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity duration-150"
			onMouseDown={e => onResize(e, field.id, 'both')}
			style={{zIndex: 20}}
			aria-label="Resize field in both directions"
			title="Resize both directions"
		/>

		<ConfirmDialog
			isOpen={showDeleteConfirm}
			title="Eliminar Campo"
			message={`¿Estás seguro de que quieres eliminar el campo "${field.name}"?`}
			confirmText="Eliminar"
			cancelText="Cancelar"
			onConfirm={() => {
				onRemove(field.id);
				setShowDeleteConfirm(false);
			}}
			onCancel={() => setShowDeleteConfirm(false)}
		/>
	</div>
	);
};
