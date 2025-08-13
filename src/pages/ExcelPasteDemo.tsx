import React from 'react';
import {ExcelPasteForm} from '../components/ExcelPasteForm';

export const ExcelPasteDemo: React.FC = () => {

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="text-center mb-3">
					<h1 className="text-2xl font-bold text-gray-800 mb-1">
						📋 Importador de Datos Excel
					</h1>
				</div>
				{/* Component */}
				<ExcelPasteForm
					placeholder="Pega aquí los datos de Excel..."
				/>
			</div>
		</div>
	);
};
