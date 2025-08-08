import React from 'react';

interface ConfirmDialogProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	confirmButtonClass?: string;
	cancelButtonClass?: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	isOpen,
	title,
	message,
	confirmText = 'Confirmar',
	cancelText = 'Cancelar',
	confirmButtonClass = 'bg-red-600 hover:bg-red-700',
	cancelButtonClass = 'bg-gray-500 hover:bg-gray-600',
	onConfirm,
	onCancel,
}) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50  flex items-center justify-center z-[3000]">
			<div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 border border-gray-200">
				<div className="flex items-center mb-4">
					<div className="flex-shrink-0">
						<div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
							<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
							</svg>
						</div>
					</div>
					<div className="ml-3">
						<h3 className="text-lg font-medium text-gray-900">
							{title}
						</h3>
					</div>
				</div>
				
				<div className="mb-6">
					<p className="text-sm text-gray-600">
						{message}
					</p>
				</div>
				
				<div className="flex justify-end space-x-3">
					<button
						type="button"
						onClick={onCancel}
						className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-200 ${cancelButtonClass}`}
					>
						{cancelText}
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-200 ${confirmButtonClass}`}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
};
