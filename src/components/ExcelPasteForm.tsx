/**
 * ExcelPasteForm Component - Simplified Version
 *
 * Features:
 * - Parses Excel data with three distinct sections
 * - Basic attribute selection from dropdowns
 * - Product dropdown for UUID selection
 * - Sets empty ID fields to null
 */

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router';
import {CreateTrazaType} from '../api/types/traza-types';
import {StatusType} from '../api/types/status-type';
import {TipoTrazaType} from '../api/types/tipo-traza-type';
import {createTraza} from '../api/trazas-api';
import {getAllProducts} from '../api/product-api';
import {ProductType} from '../api/types/product-types';
import {DropdownSearch} from "./DropdownSearch.tsx";
import {getAllSolicitantes} from "../api/solicitante-api.ts";
import {getAllConsecutivos} from "../api/consecutivo-api.ts";
import {ConsecutivoType} from "../api/types/consecutivo-types.ts";

interface AttributeValuePair {
	attribute: string;
	value: string;
	originalAttribute?: string; // Keep track of original Excel attribute for reference
	similarity?: number; // Track similarity score for auto-selected attributes
}

interface SectionData {
	title: string;
	rows: AttributeValuePair[];
}

interface ExcelPasteFormProps {
	onDataSubmit?: (data: { [key: string]: string }) => void;
	onCancel?: () => void;
	title?: string;
	placeholder?: string;
}

// Available Traza attributes
const TRAZA_ATTRIBUTES = [
	{value: 'numeroTractor', label: 'Número de Tractor'},
	{value: 'placasTractor', label: 'Placas del Tractor'},
	{value: 'autotanque1', label: 'Autotanque 1'},
	{value: 'placasAutotanque1', label: 'Placas Autotanque 1'},
	{value: 'autotanque2', label: 'Autotanque 2'},
	{value: 'placasAutotanque2', label: 'Placas Autotanque 2'},
	{value: 'autotanque3', label: 'Autotanque 3'},
	{value: 'placasAutotanque3', label: 'Placas Autotanque 3'},
	{value: 'capAutotanque1', label: 'Capacidad Autotanque 1'},
	{value: 'capAutotanque2', label: 'Capacidad Autotanque 2'},
	{value: 'capAutotanque3', label: 'Capacidad Autotanque 3'},
	{value: 'capAutotanque4', label: 'Capacidad Autotanque 4'},
	{value: 'sello1Autotanque1', label: 'Sello 1 Autotanque 1'},
	{value: 'sello2Autotanque1', label: 'Sello 2 Autotanque 1'},
	{value: 'sello1Autotanque2', label: 'Sello 1 Autotanque 2'},
	{value: 'sello2Autotanque2', label: 'Sello 2 Autotanque 2'},
	{value: 'nombreTransportista', label: 'Nombre del Transportista'},
	{value: 'nombreOperador', label: 'Nombre del Operador'},
	{value: 'numeroLicencia', label: 'Número de Licencia'},
	{value: 'clienteId', label: 'CFI (CRE que Facturará)'},
	{value: 'destino', label: 'Destino'},
	{value: 'destinoCorto', label: 'Destino Corto'},
	{value: 'litrosTotales', label: 'Litros Totales'},
	{value: 'precioLitro', label: 'Precio por Litro'},
	{value: 'folio', label: 'Folio'},
	{value: 'folioPemex1', label: 'Folio PEMEX 1'},
	{value: 'folioPemex2', label: 'Folio PEMEX 2'},
	{value: 'folioPemex3', label: 'Folio PEMEX 3'},
	{value: 'folioFiscalPemex1', label: 'Folio Fiscal PEMEX 1'},
	{value: 'folioFiscalPemex2', label: 'Folio Fiscal PEMEX 2'},
	{value: 'folioFiscalPemex3', label: 'Folio Fiscal PEMEX 3'},
	{value: 'folioRemisionNacional', label: 'Folio Remisión Nacional'},
	{value: 'folioFiscalRemisionNacional', label: 'Folio Fiscal Remisión Nacional'},
	{value: 'folioTrasvase', label: 'Folio Trasvase'},
	{value: 'folioCartaPorte', label: 'Folio Carta Porte'},
	{value: 'folioFiscalCartaPorte', label: 'Folio Fiscal Carta Porte'},
	{value: 'tadDireccionId', label: 'TAD Dirección'},
	{value: 'claveConcentradoraId', label: 'Clave Concentradora'},
	{value: 'razonSocialComercialId', label: 'Razón Social Comercial'},
	{value: 'productoId', label: 'Producto'},
	{value: 'tipoTraza', label: 'Tipo de Traza'},
	{value: 'cfi', label: 'CFI'},
	{value: 'direccion', label: 'Dirección'},
	{value: 'marcaUnidad1', label: 'Marca de la Unidad'},
	{value: 'modelo', label: 'Modelo'},
	{value: 'año', label: 'Año'},
	{value: 'solicitante', label: 'Solicitante'},
	{value: 'consecutivo', label: 'Consecutivo'},
];

export const ExcelPasteForm: React.FC<ExcelPasteFormProps> = ({
																  placeholder = "Pega aquí los datos de Excel (Ctrl+V)..."
															  }) => {
	const [isPasteAreaActive, setIsPasteAreaActive] = useState(true);
	const [sections, setSections] = useState<SectionData[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');
	const [products, setProducts] = useState<ProductType[]>([]);
	const [solicitantes, setSolicitantes] = useState<{id: string; name: string}[]>([]);
	const [selectedSolicitanteId, setSelectedSolicitanteId] = useState<string>('');
	const [consecutivos, setConsecutivos] = useState<ConsecutivoType[]>([]);
	const [selectedConsecutivoId, setSelectedConsecutivoId] = useState<string>('');
	const navigate = useNavigate();
	const pasteAreaRef = useRef<HTMLDivElement>(null);
	const processedSectionsRef = useRef<Set<string>>(new Set());

	// Parse Excel data into sections
	const parseExcelData = useCallback((text: string) => {
		const lines = text.trim().split('\n');
		if (lines.length < 2) return [];

		const sections: SectionData[] = [];
		let currentSection: SectionData | null = null;
		let currentRows: AttributeValuePair[] = [];

		// Detect section headers
		const isSectionHeader = (line: string): boolean => {
			const lowerLine = line.toLowerCase();
			return lowerLine.includes('datos de la unidad') ||
				lowerLine.includes('datos para la elaboracion de factura') ||
				lowerLine.includes('datos para elaboracion de factura') ||
				lowerLine.includes('datos para la elaboracion de carta porte') ||
				lowerLine.includes('datos para elaboracion de carta porte') ||
				lowerLine.includes('desglose de costos') ||
				lowerLine.includes('solo si aplica');
		};

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();

			if (isSectionHeader(line)) {
				// Save previous section
				if (currentSection) {
					currentSection.rows = currentRows;
					sections.push(currentSection);
				}

				// Start new section
				currentSection = {title: line, rows: []};
				currentRows = [];
			} else if (line.includes('Atributo') && line.includes('Valor')) {
				// Skip header rows
			} else if (line && currentSection) {
				// Parse attribute-value pair
				const parts = line.split(/\t|  +|:/).map(part => part.trim()).filter(part => part);

				if (parts.length >= 2) {
					currentRows.push({
						attribute: parts[0],
						value: parts.slice(1).join(' ')
					});
				} else if (parts.length === 1) {
					currentRows.push({
						attribute: parts[0],
						value: ''
					});
				}
			}
		}

		// Add last section
		if (currentSection) {
			currentSection.rows = currentRows;
			sections.push(currentSection);
		}

		return sections;
	}, []);

	// Function to auto-select attributes based on Excel data
	const autoSelectAttributes = useCallback((parsedSections: SectionData[]) => {
		// Exact mapping from Excel attributes to Traza attributes
		const attributeMapping: Record<string, string> = {
			'Tractor': '',
			'Placas Tractor (Sin Guiones y Espacios)': 'placasTractor',
			'Autotanque 1': 'autotanque1',
			'Placas Autotanque 1 (Sin Guiones y Espacios)': 'placasAutotanque1',
			'Autotanque 2': 'autotanque2',
			'Placas Autotanque 2 (Sin Guiones y Espacios)': 'placasAutotanque2',
			'Producto': 'productoId',
			'Cap. Autotanque 1': 'capAutotanque1',
			'Cap. Autotanque 2': 'capAutotanque2',
			'Sello 1 Autotanque 1': 'sello1Autotanque1',
			'Sello 2 Autotanque 1': 'sello2Autotanque1',
			'Sello 1 Autotanque 2': 'sello1Autotanque2',
			'Sello 2 Autotanque 2': 'sello2Autotanque2',
			'Nombre de Transporte': '',
			'Nombre del Operador': 'nombreOperador',
			'No. Licencia': 'numeroLicencia',
			'CFI (CRE que Facturará)': 'clienteId',
			'Origen (Municipio y Estado)': '',
			'Destino (Municipio y Estado)': 'destino',
			'Litros Totales': 'litrosTotales',
			'Precio/Litro Cliente Final': 'precioLitro',
			'Tipo Traza (Nacional/Importada)': 'tipoTraza',
			'Direccion de Destino Final': '',
			'Marca de la Unidad': 'marcaUnidad1',
			'Modelo': '',
			'Año': ''
		};

		const processedSections: SectionData[] = [];

		parsedSections.forEach(section => {
			const processedRows: AttributeValuePair[] = [];

			section.rows.forEach((row) => {
				// Special handling for "Origen (Municipio y Estado)" - split into two rows
				if (row.attribute === 'Origen (Municipio y Estado)' && row.value.includes(',')) {
					const [municipio, estado] = row.value.split(',').map(part => part.trim());

					processedRows.push({
						...row,
						attribute: '',
						originalAttribute: 'Origen (Municipio)',
						value: municipio,
						similarity: undefined
					});

					processedRows.push({
						...row,
						attribute: '',
						originalAttribute: 'Origen (Estado)',
						value: estado,
						similarity: undefined
					});
				}
				// Special handling for "Destino (Municipio y Estado)" - split into two rows
				else if (row.attribute === 'Destino (Municipio y Estado)' && row.value.includes(',')) {
					const [municipio, estado] = row.value.split(',').map(part => part.trim());

					processedRows.push({
						...row,
						attribute: '',
						originalAttribute: 'Destino (Municipio)',
						value: municipio,
						similarity: undefined
					});

					processedRows.push({
						...row,
						attribute: '',
						originalAttribute: 'Destino (Estado)',
						value: estado,
						similarity: undefined
					});
				} else {
					const mappedAttribute = attributeMapping[row.attribute];

					if (mappedAttribute && mappedAttribute !== '') {
						// Check if this attribute is already selected by ANY row in ANY section
						const isAlreadySelected = parsedSections.some(s =>
							s.rows.some((otherRow) =>
								otherRow.attribute === mappedAttribute
							)
						);

						if (isAlreadySelected) {
							processedRows.push({
								...row,
								similarity: undefined,
								originalAttribute: undefined
							});
						} else {
							// Special handling for productoId - don't auto-select here, let useEffect handle it
							if (mappedAttribute === 'productoId' && row.value.trim()) {
								processedRows.push({
									...row,
									attribute: mappedAttribute,
									originalAttribute: row.attribute,
									similarity: 1.0
								});
							} else {
								processedRows.push({
									...row,
									attribute: mappedAttribute,
									originalAttribute: row.attribute, // Keep original Excel attribute for reference
									similarity: 1.0 // Perfect match since it's exact mapping
								});
							}
						}
					} else {
						// Attributes without mapping (empty in the mapping) get no similarity
						processedRows.push({
							...row,
							similarity: undefined,
							originalAttribute: undefined
						});
					}
				}
			});

			processedSections.push({
				...section,
				rows: processedRows
			});
		});

		return processedSections;
	}, []);

	// Handle paste event
	const handlePaste = useCallback((e: React.ClipboardEvent) => {
		e.preventDefault();
		const text = e.clipboardData.getData('text');
		const parsedSections = parseExcelData(text);

		// Apply auto-selection
		const autoSelectedSections = autoSelectAttributes(parsedSections);

		// Clear processed sections ref for new data
		processedSectionsRef.current.clear();

		setSections(autoSelectedSections);
		setIsPasteAreaActive(false);
	}, [parseExcelData, autoSelectAttributes]);

	// Apply product auto-selection when products are loaded
	useEffect(() => {
		console.log('🔄 useEffect triggered - products:', products.length, 'sections:', sections.length);

		if (products.length > 0 && sections.length > 0) {
			// Create a unique key for the current sections to avoid reprocessing
			const sectionsKey = JSON.stringify(sections.map(s => s.title + s.rows.length));

			// Skip if we've already processed these sections
			if (processedSectionsRef.current.has(sectionsKey)) {
				console.log('⏭️ Skipping - already processed sections');
				return;
			}

			// Check if any sections need product auto-selection
			const needsProductAutoSelection = sections.some(section =>
				section.rows.some(row =>
					row.attribute === 'productoId' && row.value && !row.value.includes('-')
				)
			);

			console.log('🔍 Needs product auto-selection:', needsProductAutoSelection);

			if (needsProductAutoSelection) {
				console.log('🚀 Processing product auto-selection...');
				const updatedSections = sections.map(section => ({
					...section,
					rows: section.rows.map(row => {
						// If this row has productoId attribute but no product UUID, try to auto-select
						if (row.attribute === 'productoId' && row.value && !row.value.includes('-')) {
							const productDescription = row.value.toLowerCase();
							console.log('🔍 Trying to match product:', productDescription);

							// More robust product matching - try exact matches first, then partial matches
							let bestProductMatch = products.find(product =>
								product.descripcion.toLowerCase() === productDescription ||
								product.clave.toLowerCase() === productDescription
							);

							// If no exact match, try partial matches
							if (!bestProductMatch) {
								bestProductMatch = products.find(product =>
									product.descripcion.toLowerCase().includes(productDescription) ||
									product.clave.toLowerCase().includes(productDescription) ||
									productDescription.includes(product.clave.toLowerCase()) ||
									productDescription.includes(product.descripcion.toLowerCase())
								);
							}

							if (bestProductMatch) {
								console.log('✅ Found product match:', bestProductMatch.clave, bestProductMatch.descripcion);
								return {
									...row,
									value: bestProductMatch.id, // Set the UUID
									similarity: 1.0,
									originalAttribute: row.originalAttribute || row.attribute
								};
							} else {
								console.log('❌ No product match found for:', productDescription);
							}
						}
						return row;
					})
				}));

				console.log('📝 Updating sections with product matches');
				setSections(updatedSections);
				// Mark these sections as processed
				processedSectionsRef.current.add(sectionsKey);
			}
		}
	}, [products, sections]); // Keep sections in dependency array

	// Handle click on paste area
	const handlePasteAreaClick = () => {
		if (pasteAreaRef.current) {
			pasteAreaRef.current.focus();
		}
	};

	// Handle attribute change
	const handleAttributeChange = (sectionIndex: number, rowIndex: number, newAttribute: string) => {
		const newSections = [...sections];
		// Clear similarity when manually changing attribute
		newSections[sectionIndex].rows[rowIndex].attribute = newAttribute;
		newSections[sectionIndex].rows[rowIndex].similarity = undefined;
		setSections(newSections);
	};

	// Handle value change
	const handleValueChange = (sectionIndex: number, rowIndex: number, newValue: string) => {
		const newSections = [...sections];
		newSections[sectionIndex].rows[rowIndex].value = newValue;
		setSections(newSections);
	};

	// Handle product selection
	const handleProductSelection = (sectionIndex: number, rowIndex: number, productId: string) => {
		const newSections = [...sections];
		newSections[sectionIndex].rows[rowIndex].value = productId;
		setSections(newSections);
	};

	// Get available attributes for dropdown
	const getAvailableAttributes = (currentSectionIndex: number, currentRowIndex: number) => {
		const selectedAttributes = new Set<string>();

		sections.forEach((section, sectionIdx) => {
			section.rows.forEach((row, rowIdx) => {
				if (sectionIdx === currentSectionIndex && rowIdx === currentRowIndex) {
					return;
				}
				if (row.attribute && row.attribute !== '') {
					selectedAttributes.add(row.attribute);
				}
			});
		});

		const available = TRAZA_ATTRIBUTES.filter(attr => !selectedAttributes.has(attr.value));

		return available;
	};



	// Get cleaned display value for input fields (removes spaces and commas)
	const getCleanedDisplayValue = (value: string) => {
		if (!value) return value;
		return value.replace(/[\s,]/g, '');
	};

	// Handle form submission
	const handleSubmit = async () => {
		if (sections.length === 0) {
			alert('No hay datos para enviar. Por favor, pega datos de Excel primero.');
			return;
		}

		setIsLoading(true);
		setSuccessMessage('');

		// Create Traza object
		const trazaData: CreateTrazaType = {
			status: StatusType.ACTIVE,
			solicitanteId: selectedSolicitanteId || undefined,
			consecutivoId: selectedConsecutivoId || undefined
		};

		// Populate Traza attributes - only set valid TrazaType attributes
		sections.forEach(section => {
			section.rows.forEach(row => {
				if (row.value.trim() && row.attribute) {
					const attribute = row.attribute;
					const value = row.value.trim();

					// Only set attributes that exist in TrazaType interface
					switch (attribute) {
						// Numeric fields
						case 'capAutotanque1':
						case 'capAutotanque2':
						case 'capAutotanque3':
						case 'capAutotanque4':
						case 'litrosTotales':
						case 'precioLitro': {
							// Clean the value: remove spaces and commas, then parse as float
							const cleanValue = value.replace(/[\s,]/g, '');
							const numValue = parseFloat(cleanValue);
							if (!isNaN(numValue)) {
								(trazaData as CreateTrazaType)[attribute] = numValue;
							}
							break;
						}

						// String fields
						case 'tipoTraza': {
							const upperValue = value.toUpperCase();
							if (upperValue === 'NACIONAL' || upperValue === 'INTERNACIONAL') {
								(trazaData as CreateTrazaType)[attribute] = upperValue as TipoTrazaType;
							}
							break;
						}

						case 'destino':
						case 'sello1Autotanque1':
						case 'sello2Autotanque1':
						case 'sello1Autotanque2':
						case 'sello2Autotanque2':
						case 'nombreTransportista':
						case 'nombreOperador':
						case 'folioPemex1':
						case 'folioPemex2':
						case 'folioPemex3':
						case 'folioFiscalPemex1':
						case 'folioFiscalPemex2':
						case 'folioFiscalPemex3':
						case 'folioRemisionNacional':
						case 'folioFiscalRemisionNacional':
						case 'folioTrasvase':
						case 'numeroTractor':
						case 'placasTractor':
						case 'autotanque1':
						case 'placasAutotanque1':
						case 'autotanque2':
						case 'placasAutotanque2':
						case 'autotanque3':
						case 'folio':
						case 'cfi':
						case 'destinoCorto':
						case 'numeroLicencia':
						case 'marcaUnidad1':
						case 'folioCartaPorte':
						case 'folioFiscalCartaPorte':
						case 'clienteId':
							(trazaData as CreateTrazaType)[attribute] = value;
							break;

						// ID fields that should be set to null if empty
						case 'productoId':
						case 'claveConcentradoraId':
						case 'tadDireccionId':
						case 'razonSocialComercialId':
							if (value && value.trim() !== '') {
								(trazaData as CreateTrazaType)[attribute] = value;
							}
							break;

						// Skip any other attributes that don't exist in TrazaType
						default:
							console.log(`Skipping attribute "${attribute}" - not defined in TrazaType`);
							break;
					}
				}
			});
		});


		console.log('🚛 Nueva Traza preparada para envío:', trazaData);

		try {
			const createdTraza = await createTraza(trazaData);

			if (createdTraza && createdTraza.id) {
				console.log('🚛 Nueva Traza creada:', createdTraza);
				setSuccessMessage('✅ Traza creada exitosamente. Redirigiendo...');

				setTimeout(() => {
					const isAdmin = window.location.pathname.includes('/admin');
					const basePath = isAdmin ? '/admin' : '/user';
					navigate(`${basePath}/traza/${createdTraza.id}`);
				}, 1500);
			} else {
				throw new Error('No se pudo crear la traza. El servidor no devolvió una respuesta válida.');
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear la traza';
			alert(`Error al crear la traza: ${errorMessage}. Por favor, intenta de nuevo.`);
		} finally {
			setIsLoading(false);
		}
	};

	// Reset form
	const handleReset = () => {
		setSections([]);
		setIsPasteAreaActive(true);
		processedSectionsRef.current.clear();
	};

	// Fetch products, solicitantes, and consecutivos on mount
	useEffect(() => {
		const fetchData = async () => {
			try {
				const [allProducts, allSolicitantes, allConsecutivos] = await Promise.all([
					getAllProducts(0, 1000),
					getAllSolicitantes(0, 1000),
					getAllConsecutivos(0, 1000)
				]);

				if (allProducts) {
					setProducts(allProducts);
				}
				if (allSolicitantes) {
					setSolicitantes(allSolicitantes);
				}
				if (allConsecutivos && allConsecutivos.length > 0) {
					setConsecutivos(allConsecutivos);
					// Automatically set the consecutivo ID when data is loaded
					setSelectedConsecutivoId(allConsecutivos[0].id);
				}
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};

		fetchData();
	}, []);

	return (
		<div className="max-w-5xl mx-auto p-4">
			<div className="bg-white rounded-lg shadow-lg p-4">
				{isPasteAreaActive ? (
					<div className="space-y-3">
						<div className="text-gray-700 mb-3">
							<p className="mb-2 text-base">📋 <strong>Instrucciones:</strong></p>
							<ul className="list-disc list-inside space-y-0.5 text-sm">
								<li>Copia los datos de Excel (Ctrl+C)</li>
								<li>Haz clic en el área de abajo y pega (Ctrl+V)</li>
								<li>Los datos se mostrarán organizados en secciones</li>
								<li>Revisa y modifica según sea necesario</li>
							</ul>
						</div>

						<div
							ref={pasteAreaRef}
							tabIndex={0}
							onPaste={handlePaste}
							onClick={handlePasteAreaClick}
							className="min-h-[150px] border-2 border-dashed border-blue-300 rounded-lg p-4 text-center cursor-text hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:border-blue-600 focus:bg-blue-50"
						>
							<div className="text-blue-600">
								<div className="text-3xl mb-1">📋</div>
								<div className="text-base font-medium mb-1">{placeholder}</div>
								<div className="text-xs text-blue-500">
									Presiona Ctrl+V para pegar los datos
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						{/* Summary */}
						{sections.length > 0 && (
							<div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
								<p>📊 <strong>Datos cargados:</strong> {sections.length} secciones
									con {sections.reduce((acc, section) => acc + section.rows.length, 0)} atributos</p>

								{/* Auto-selection summary */}
								{(() => {
									const totalRows = sections.reduce((acc, section) => acc + section.rows.length, 0);
									const autoSelectedRows = sections.reduce((acc, section) =>
										acc + section.rows.filter(row => row.similarity).length, 0
									);
									const manualRows = totalRows - autoSelectedRows;

									return (
										<div className="mt-2 text-xs text-blue-700">
											<p>🔍 <strong>Auto-selección:</strong> {autoSelectedRows} atributos mapeados
												automáticamente, {manualRows} requieren selección manual</p>
										</div>
									);
								})()}
							</div>
						)}

						<div>
							<h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
								Consecutivo
							</h3>
							{consecutivos.length > 0 && (
								<div className="mb-4">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Consecutivo Actual: {consecutivos[0].valor}
									</label>
									<input
										type="text"
										value={consecutivos[0].valor}
										onChange={() => setSelectedConsecutivoId(consecutivos[0].id)}
										className=" w-[330px] sm:w-80 md:w-100 px-3 py-2 border text-black border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
										readOnly
									/>
								</div>
							)}
						</div>

						<div>
							<h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
								Solicitante
							</h3>
							<DropdownSearch
								options={solicitantes.map(s => ({id: s.id, name: s.name}))}
								value={selectedSolicitanteId}
								onChange={(value) => setSelectedSolicitanteId(value)}
								placeholder="Solicitante"
							/>
						</div>

						{/* Sections Display */}
						{sections.map((section, sectionIndex) => (
							<div key={sectionIndex} className="border border-gray-200 rounded-lg p-4">
								<h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
									{section.title}
								</h3>

								{/* Column headers */}
								<div className="grid grid-cols-3 gap-3 mb-2">
									<div className="text-xs font-semibold text-gray-700">Excel Original:</div>
									<div className="text-xs font-semibold text-gray-700">Atributo:</div>
									<div className="text-xs font-semibold text-gray-700">Valor:</div>
								</div>

								<div className="space-y-2">
									{(() => {
										const processedRows: React.ReactElement[] = [];

										for (let rowIndex = 0; rowIndex < section.rows.length; rowIndex++) {
											const row = section.rows[rowIndex];
											const nextRow = section.rows[rowIndex + 1];

											// Check if this is a location pair that should have merged cells
											const isLocationMunicipio = row.originalAttribute === 'Origen (Municipio)' || row.originalAttribute === 'Destino (Municipio)';
											const isLocationPair = isLocationMunicipio && nextRow &&
												((row.originalAttribute === 'Origen (Municipio)' && nextRow.originalAttribute === 'Origen (Estado)') ||
													(row.originalAttribute === 'Destino (Municipio)' && nextRow.originalAttribute === 'Destino (Estado)'));

											if (isLocationPair) {
												// Create Municipio row with normal cells
												processedRows.push(
													<div key={`${rowIndex}-municipio`}
														 className="grid grid-cols-3 gap-3 items-center">
														<div className="bg-gray-50 p-2 rounded border border-gray-200">
															<div className="text-xs text-gray-600 font-medium">
																{row.originalAttribute || row.attribute}
															</div>
														</div>
														<div className="bg-gray-50 p-2 rounded border border-gray-200">
															<select
																value={row.attribute}
																onChange={(e) => handleAttributeChange(sectionIndex, rowIndex, e.target.value)}
																className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
																	row.similarity && row.attribute && row.attribute !== '' ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'
																} text-gray-900`}
															>
																<option value="">Seleccionar atributo...</option>
																{getAvailableAttributes(sectionIndex, rowIndex).map(attr => (
																	<option key={attr.value} value={attr.value}>
																		{attr.label}
																	</option>
																))}
															</select>
														</div>
														<div>
															<input
																type="text"
																value={getCleanedDisplayValue(row.value)}
																onChange={(e) => handleValueChange(sectionIndex, rowIndex, e.target.value)}
																className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
																placeholder="Valor"
															/>
														</div>
													</div>
												);

												// Create Estado row with merged middle cell (no dropdown)
												processedRows.push(
													<div key={`${rowIndex}-estado`}
														 className="grid grid-cols-3 gap-3 items-center">
														<div className="bg-gray-50 p-2 rounded border border-gray-200">
															<div className="text-xs text-gray-600 font-medium">
																{nextRow.originalAttribute || nextRow.attribute}
															</div>
														</div>
														<div className="bg-gray-50 p-2 rounded border border-gray-200">
															{/* Empty - merged with Municipio row above */}
														</div>
														<div>
															<input
																type="text"
																value={getCleanedDisplayValue(nextRow.value)}
																onChange={(e) => handleValueChange(sectionIndex, rowIndex + 1, e.target.value)}
																className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
																placeholder="Valor"
															/>
														</div>
													</div>
												);

												// Skip the next row since we've processed it
												rowIndex++;
											} else if (!isLocationMunicipio && row.originalAttribute !== 'Origen (Estado)' && row.originalAttribute !== 'Destino (Estado)') {
												// Regular row (not part of a location pair)
												processedRows.push(
													<div key={rowIndex} className="grid grid-cols-3 gap-3 items-center">
														<div className="bg-gray-50 p-2 rounded border border-gray-200">
															<div className="text-xs text-gray-600 font-medium">
																{row.originalAttribute || row.attribute}
															</div>
														</div>
														<div className="bg-gray-50 p-2 rounded border border-gray-200">
															<select
																value={row.attribute}
																onChange={(e) => handleAttributeChange(sectionIndex, rowIndex, e.target.value)}
																className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
																	row.similarity && row.attribute && row.attribute !== '' ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'
																} text-gray-900`}
															>
																<option value="">Seleccionar atributo...</option>
																{getAvailableAttributes(sectionIndex, rowIndex).map(attr => (
																	<option key={attr.value} value={attr.value}>
																		{attr.label}
																	</option>
																))}
															</select>
														</div>
														<div>
															{row.attribute === 'productoId' && products.length > 0 ? (
																<select
																	value={row.value}
																	onChange={(e) => handleProductSelection(sectionIndex, rowIndex, e.target.value)}
																	className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
																>
																	<option value="">Seleccionar Producto...</option>
																	{products.map(product => (
																		<option key={product.id} value={product.id}>
																			{product.clave} - {product.descripcion}
																		</option>
																	))}
																</select>
															) : (
																<input
																	type="text"
																	value={getCleanedDisplayValue(row.value)}
																	onChange={(e) => handleValueChange(sectionIndex, rowIndex, e.target.value)}
																	className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
																	placeholder="Valor"
																/>
															)}
														</div>
													</div>
												);
											}
										}

										return processedRows;
									})()}
								</div>
							</div>
						))}

						{/* Success Message */}
						{successMessage && (
							<div className="bg-green-50 border border-green-200 rounded-lg p-3">
								<p className="text-green-800 text-sm font-medium">{successMessage}</p>
							</div>
						)}

						{/* Actions */}
						<div className="flex justify-between items-center pt-4 border-t border-gray-200">
							<div className="text-gray-600">
								<p className="text-xs">💡 <strong>Consejo:</strong> Revisa y modifica los valores antes
									de enviar</p>
							</div>

							<div className="flex gap-3">
								<button
									onClick={handleSubmit}
									className={`px-4 py-2 text-white rounded font-semibold text-sm transition-colors ${
										isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
									}`}
									disabled={isLoading}
								>
									{isLoading ? '⏳ Creando Traza...' : '✅ Confirmar Datos'}
								</button>
								<button
									onClick={handleReset}
									className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors font-semibold text-sm"
								>
									🔄 Nuevos Datos
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
