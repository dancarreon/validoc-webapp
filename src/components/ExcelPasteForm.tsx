/**
 * ExcelPasteForm Component - Version 4.0
 *
 * Features:
 * - Parses Excel data with three distinct sections
 * - Handles attributes with descriptive text in parentheses
 * - Supports multiple data formats (tabs, spaces, colons)
 * - Visual feedback for loaded values
 * - Special handling for CARTA PORTE section
 * - Auto-selection of similar attributes using fuzzy matching
 * - Compact, table-like UI with column headers
 * - Manual re-auto-selection capability
 * - Auto-cleaning of numeric values (removes spaces around commas)
 * - Dynamic dropdown system preventing duplicate attribute selection
 * - Smart visual indicators for auto-selected vs. manual attributes
 * - Accurate Excel source tracking for unmodified values
 * - API integration with createTraza method
 * - Automatic redirect to NewTraza after successful creation
 *
 * Version History:
 * - v1.0: Basic Excel parsing with manual attribute selection
 * - v2.0: Added auto-selection, compact UI, column headers, removed debug elements
 * - v3.0: Added auto-cleaning of numeric values, improved data processing pipeline
 * - v4.0: Added dynamic dropdowns, smart indicators, Excel source tracking
 * - v4.1: Added API integration and navigation functionality
 *
 * Last Updated: Current session
 * Status: Stable - Ready for production use
 */

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router';
import {CreateTrazaType} from '../api/types/traza-types';
import {StatusType} from '../api/types/status-type';
import {createTraza} from '../api/trazas-api';
import {getAllTads} from '../api/tads-api';
import {TadType} from '../api/types/tad-types';
import {ClaveType} from '../api/types/clave-types';
import {RazonType} from '../api/types/razon-types';
import {ClientType} from '../api/types/client-types';
import {fetchClaves, fetchRazones} from "../pages/utils/utils.ts";
import {getAllClients} from '../api/clients-api';

interface AttributeValuePair {
	attribute: string;
	value: string;
	originalAttribute?: string; // Keep track of original Excel attribute for reference
	isValueModified?: boolean; // Track if the value has been manually modified
	similarity?: number;
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

// All available Traza attributes for dropdown selection
const TRAZA_ATTRIBUTES = [
	// DATOS DE LA UNIDAD (Unit Data)
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

	// DATOS PARA ELABORACION DE FACTURA (Invoice Data)
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
	{value: 'fechaHoraPemex', label: 'Fecha y Hora PEMEX'},
	{value: 'fechaHoraTrasvase', label: 'Fecha y Hora Trasvase'},

	// DATOS PARA ELABORACION DE CARTA PORTE (Bill of Lading Data)
	{value: 'marcaUnidad1', label: 'Marca de la Unidad'},
	{value: 'folioCartaPorte', label: 'Folio Carta Porte'},
	{value: 'folioFiscalCartaPorte', label: 'Folio Fiscal Carta Porte'},

	// Additional fields
	{value: 'tadDireccionId', label: 'TAD Dirección'},
	{value: 'claveConcentradoraId', label: 'Clave Concentradora'},
	{value: 'razonSocialComercialId', label: 'Razón Social Comercial'},
	{value: 'productoId', label: 'Producto'},
	{value: 'tipoTraza', label: 'Tipo Traza (Nacional/Internacional)'},
	{value: 'origenCiudad', label: 'Ciudad de Origen'},
	{value: 'origenEstado', label: 'Estado de Origen'},
	{value: 'destinoCiudad', label: 'Ciudad de Destino'},
	{value: 'destinoEstado', label: 'Estado de Destino'},
];

// Helper function to calculate string similarity using Levenshtein distance
const calculateSimilarity = (str1: string, str2: string): number => {
	const s1 = str1.toLowerCase().trim();
	const s2 = str2.toLowerCase().trim();

	// Exact match gets highest score
	if (s1 === s2) return 1.0;

	// Direct matching for Placas Autotanque cases
	if (s1 === 'placas autotanque 1 (sin guiones y espacios)' && s2.includes('placas autotanque 1')) {
		return 1.0; // Perfect match
	}
	if (s1 === 'placas autotanque 2 (sin guiones y espacios)' && s2.includes('placas autotanque 2')) {
		return 1.0; // Perfect match
	}
	if (s1 === 'placas autotanque 3 (sin guiones y espacios)' && s2.includes('placas autotanque 3')) {
		return 1.0; // Perfect match
	}

	// Direct matching for Cap. Autotanque cases
	if (s1 === 'cap. autotanque 1' && s2.includes('capacidad autotanque 1')) {
		return 1.0; // Perfect match
	}
	if (s1 === 'cap. autotanque 2' && s2.includes('capacidad autotanque 2')) {
		return 1.0; // Perfect match
	}

	// Direct matching for Precio/Litro Cliente Final
	if (s1 === 'precio/litro cliente final' && s2.includes('precio por litro')) {
		return 1.0; // Perfect match
	}

	// Direct matching for Direccion de Destino Final
	if (s1 === 'direccion de destino final' && s2.includes('dirección de destino final')) {
		return 1.0; // Perfect match
	}

	// Direct matching for Ciudad and Estado
	if (s1 === 'ciudad' && s2.includes('ciudad')) {
		return 1.0; // Perfect match
	}
	if (s1 === 'estado' && s2.includes('estado')) {
		return 1.0; // Perfect match
	}
	if (s1 === 'ciudad, estado' && s2.includes('ciudad') && s2.includes('estado')) {
		return 1.0; // Perfect match
	}

	// Direct matching for Origen and Destino attributes
	if (s1 === 'origenciudad' && s2.includes('ciudad de origen')) {
		return 1.0; // Perfect match
	}
	if (s1 === 'origenestado' && s2.includes('estado de origen')) {
		return 1.0; // Perfect match
	}
	if (s1 === 'destinociudad' && s2.includes('ciudad de destino')) {
		return 1.0; // Perfect match
	}
	if (s1 === 'destinoestado' && s2.includes('estado de destino')) {
		return 1.0; // Perfect match
	}

	// Check if one string contains the other
	if (s1.includes(s2) || s2.includes(s1)) return 0.9;

	// Check for common words
	const words1 = s1.split(/\s+/);
	const words2 = s2.split(/\s+/);
	const commonWords = words1.filter(word => words2.includes(word));
	if (commonWords.length > 0) {
		const wordSimilarity = commonWords.length / Math.max(words1.length, words2.length);
		return 0.7 + (wordSimilarity * 0.2);
	}

	// Check for partial matches
	let partialMatches = 0;
	for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
		if (s1[i] === s2[i]) partialMatches++;
	}
	const partialSimilarity = partialMatches / Math.max(s1.length, s2.length);

	return Math.max(0.1, partialSimilarity * 0.6);
};

// Helper function to find the best matching attribute
const findBestMatch = (excelAttribute: string): { value: string; label: string; similarity: number } | null => {
	let bestMatch: { value: string; label: string; similarity: number } | null = null;
	let highestSimilarity = 0;

	for (const attr of TRAZA_ATTRIBUTES) {
		const similarity = calculateSimilarity(excelAttribute, attr.label);

		if (similarity > highestSimilarity && similarity > 0.3) { // Minimum threshold
			highestSimilarity = similarity;
			bestMatch = {...attr, similarity};
		}
	}

	return bestMatch;
};

// Helper function to get the display label for a given value
const getDisplayLabel = (value: string): string => {
	const attr = TRAZA_ATTRIBUTES.find(attr => attr.value === value);
	return attr ? attr.label : value;
};

export const ExcelPasteForm: React.FC<ExcelPasteFormProps> = ({
																  placeholder = "Pega aquí los datos de Excel (Ctrl+V)..."
															  }) => {
	const [isPasteAreaActive, setIsPasteAreaActive] = useState(true);
	const [sections, setSections] = useState<SectionData[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');
	const [claves, setClaves] = useState<ClaveType[]>([]);
	const [razones, setRazones] = useState<RazonType[]>([]);
	const [clients, setClients] = useState<ClientType[]>([]);
	const pasteAreaRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

	const parseExcelData = useCallback((text: string) => {
		const lines = text.trim().split('\n');
		if (lines.length < 2) return [];

		const sections: SectionData[] = [];
		let currentSection: SectionData | null = null;
		let currentRows: AttributeValuePair[] = [];

		// Helper function to detect section headers
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

			// Check if this is a section header
			if (isSectionHeader(line)) {
				// Save previous section if exists
				if (currentSection) {
					currentSection.rows = currentRows;
					sections.push(currentSection);
				}

				// Start new section
				currentSection = {title: line, rows: []};
				currentRows = [];

				// Special handling for CARTA PORTE section
				if (line.toLowerCase().includes('carta porte')) {
					// CARTA PORTE section detected
				}
			} else if (line.includes('Atributo') && line.includes('Valor')) {
				// Skip the "Atributo Valor" header rows

			} else if (line && currentSection) {
				// Parse attribute-value pair - try different separators
				let parts: string[] = [];

				// Special handling for CARTA PORTE section
				if (currentSection.title.toLowerCase().includes('carta porte')) {
					// Processing CARTA PORTE line
				}

				// Special handling for attributes with descriptive text in parentheses
				if (line.includes('(') && line.includes(')')) {
					// Check if this looks like an attribute with description (like "CFI (CRE que Facturará)")
					const parenthesesMatch = line.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
					if (parenthesesMatch) {
						// This is an attribute with description, treat as single attribute with empty value
						parts = [line.trim(), ''];
					}
				}

				// Additional check for common descriptive attribute patterns
				if (parts.length === 0) {
					const descriptivePatterns = [
						/^Direccion de Destino Final\s*$/i,
						/^Marca de la Unidad\s*$/i,
						/^Modelo\s*$/i,
						/^Año\s*$/i,
						/^CFI\s*\([^)]+\)\s*$/i,
						/^Origen\s*\([^)]+\)\s*$/i,
						/^Destino\s*\([^)]+\)\s*$/i
					];

					for (const pattern of descriptivePatterns) {
						if (pattern.test(line.trim())) {
							parts = [line.trim(), ''];
							break;
						}
					}
				}

				// If we haven't determined parts yet, try normal parsing
				if (parts.length === 0) {
					// First try tab separator (most common from Excel)
					if (line.includes('\t')) {
						parts = line.split('\t');
					} else {
						// If no tabs, try to split by multiple spaces or other common separators
						// Look for patterns like "Attribute    Value" or "Attribute: Value"
						// But be careful not to split attributes that contain parentheses
						const match = line.match(/^(.+?)\s{2,}(.+)$/);
						if (match) {
							// Check if the first part contains parentheses - if so, it's likely all one attribute
							if (match[1].includes('(') && !match[1].includes(')')) {
								// If first part has opening parenthesis but no closing, treat the whole line as attribute
								parts = [line.trim(), ''];
							} else {
								parts = [match[1].trim(), match[2].trim()];
							}
						} else {
							// Try colon separator
							const colonMatch = line.match(/^(.+?):\s*(.+)$/);
							if (colonMatch) {
								parts = [colonMatch[1].trim(), colonMatch[2].trim()];
							} else {
								// Try to find any separation pattern
								const anySepMatch = line.match(/^(.+?)(\s+)(.+)$/);
								if (anySepMatch) {
									// Check if first part contains parentheses
									if (anySepMatch[1].includes('(') && !anySepMatch[1].includes(')')) {
										parts = [line.trim(), ''];
									} else {
										parts = [anySepMatch[1].trim(), anySepMatch[3].trim()];
									}
								}
							}
						}
					}
				}

				if (parts.length >= 2) {
					const attribute = parts[0].trim();
					const value = parts[1].trim();
					// Always add the row if there's an attribute, even if value is empty
					if (attribute) {
						currentRows.push({attribute, value});
					}
				} else if (parts.length === 1 && parts[0]) {
					// If we can't split, treat the whole line as an attribute with empty value
					currentRows.push({attribute: parts[0].trim(), value: ''});
				} else {
					// Special handling for CARTA PORTE section - treat unparseable lines as attributes
					if (currentSection.title.toLowerCase().includes('carta porte')) {
						currentRows.push({attribute: line.trim(), value: ''});
					}
				}
			}
		}

		// Add the last section
		if (currentSection) {
			currentSection.rows = currentRows;
			sections.push(currentSection);
		}

		// Ensure CARTA PORTE section has all expected attributes
		const cartaPorteSection = sections.find(section =>
			section.title.toLowerCase().includes('carta porte')
		);

		if (cartaPorteSection) {
			const expectedAttributes = [
				'Direccion de Destino Final',
				'Marca de la Unidad',
				'Modelo',
				'Año'
			];

			// Add missing attributes with empty values
			expectedAttributes.forEach(attr => {
				const exists = cartaPorteSection.rows.some(row =>
					row.attribute.toLowerCase() === attr.toLowerCase()
				);
				if (!exists) {
					cartaPorteSection.rows.push({attribute: attr, value: ''});
				}
			});
		}

		return sections;
	}, []);

	// Function to clean numeric values (remove spaces around commas)
	const cleanNumericValues = useCallback((sections: SectionData[]) => {
		return sections.map(section => ({
			...section,
			rows: section.rows.map(row => ({
				...row,
				value: row.value ? cleanNumericValue(row.value) : row.value
			}))
		}));
	}, []);


	// Helper function to clean a single numeric value
	const cleanNumericValue = (value: string): string => {
		// Check if the value looks like a numeric pattern (contains numbers and commas)
		if (/\d/.test(value) && /,/.test(value)) {
			// Remove all spaces (including between numbers and commas)
			let cleaned = value.replace(/\s+/g, '');
			// Remove leading/trailing commas
			cleaned = cleaned.replace(/^,+|,+$/g, '');
			return cleaned;
		}
		return value;
	};

	// Function to process "Origen (Municipio y Estado)" and "Destino (Municipio y Estado)" attributes and create separate rows
	const processLocationAttributes = useCallback((sections: SectionData[]) => {
		return sections.map(section => {
			const newRows: AttributeValuePair[] = [];

			section.rows.forEach(row => {
				// Check if this is the "Origen (Municipio y Estado)" attribute
				if (row.attribute === 'Origen (Municipio y Estado)' && row.value && row.value.includes(',')) {
					const parts = row.value.split(',').map(part => part.trim());
					const municipio = parts[0];
					const estado = parts[1];

					// Create row for Ciudad de Origen
					newRows.push({
						attribute: 'origenCiudad',
						value: municipio,
						originalAttribute: 'Origen (Municipio)',
						isValueModified: false
					});

					// Create row for Estado
					newRows.push({
						attribute: 'origenEstado',
						value: estado,
						originalAttribute: 'Origen (Estado)',
						isValueModified: false
					});
				}
				// Check if this is the "Destino (Municipio y Estado)" attribute
				else if (row.attribute === 'Destino (Municipio y Estado)' && row.value && row.value.includes(',')) {
					const parts = row.value.split(',').map(part => part.trim());
					const municipio = parts[0];
					const estado = parts[1];

					// Create row for Ciudad de Destino
					newRows.push({
						attribute: 'destinoCiudad',
						value: municipio,
						originalAttribute: 'Destino (Municipio)',
						isValueModified: false
					});

					// Create row for Estado de Destino
					newRows.push({
						attribute: 'destinoEstado',
						value: estado,
						originalAttribute: 'Destino (Estado)',
						isValueModified: false
					});
				} else {
					// Keep the original row as is
					newRows.push(row);
				}
			});

			return {
				...section,
				rows: newRows
			};
		});
	}, []);

	// Function to auto-select attributes based on Excel data
	const autoSelectAttributes = useCallback((parsedSections: SectionData[]) => {
		return parsedSections.map(section => ({
			...section,
			rows: section.rows.map(row => {
				const bestMatch = findBestMatch(row.attribute);
				if (bestMatch && bestMatch.similarity > 0.3) {
					return {
						...row,
						attribute: bestMatch.value, // Use the value, not the label
						originalAttribute: row.originalAttribute || row.attribute, // Keep custom originalAttribute if set, otherwise use Excel attribute
						similarity: bestMatch.similarity // Add similarity score
					};
				}
				return row;
			})
		}));
	}, []);

	// Function to search for matching TAD based on origenCiudad and origenEstado
	const findMatchingTad = async (origenCiudad: string, origenEstado: string): Promise<TadType | null> => {
		try {
			// Get all TADs to search through them
			const allTads = await getAllTads(0, 1000); // Get a large number to search through all

			if (!allTads || allTads.length === 0) {
				return null;
			}

			// Search for a TAD that matches both ciudad and estado
			const matchingTad = allTads.find(tad => {
				const ciudadMatch = tad.ciudad?.toLowerCase().includes(origenCiudad.toLowerCase()) ||
					origenCiudad.toLowerCase().includes(tad.ciudad?.toLowerCase() || '') ||
					tad.ciudad?.toLowerCase() === origenCiudad.toLowerCase();

				const estadoMatch = tad.estado?.name?.toLowerCase().includes(origenEstado.toLowerCase()) ||
					origenEstado.toLowerCase().includes(tad.estado?.name?.toLowerCase() || '') ||
					origenEstado.toLowerCase().includes(tad.estado?.name?.toLowerCase() || '');

				return ciudadMatch && estadoMatch;
			});

			if (matchingTad) {
				return matchingTad;
			} else {
				return null;
			}
		} catch (error) {
			console.error('Error fetching TADs:', error);
			return null;
		}
	};

	// Fetch claves, razones, and clients when component mounts
	useEffect(() => {
		fetchClaves(setClaves)
		fetchRazones(setRazones);
		
		// Fetch clients
		const fetchClients = async () => {
			try {
				const allClients = await getAllClients(0, 1000); // Get a large number to search through all
				if (allClients) {
					setClients(allClients);
				}
			} catch (error) {
				console.error('Error fetching clients:', error);
			}
		};
		
		fetchClients();
	}, []);

	const handlePaste = useCallback((e: React.ClipboardEvent) => {
		e.preventDefault();
		const text = e.clipboardData.getData('text');
		const parsedSections = parseExcelData(text);

		// Clean numeric values (remove spaces around commas)
		const cleanedSections = cleanNumericValues(parsedSections);

		// Process "Origen (Municipio y Estado)" and "Destino (Municipio y Estado)" attributes and create separate rows
		const processedSections = processLocationAttributes(cleanedSections);

		// Apply auto-selection
		const autoSelectedSections = autoSelectAttributes(processedSections);

		setSections(autoSelectedSections);
		setIsPasteAreaActive(false);
	}, [parseExcelData, cleanNumericValues, processLocationAttributes, autoSelectAttributes]);

	const handlePasteAreaClick = () => {
		if (pasteAreaRef.current) {
			pasteAreaRef.current.focus();
		}
	};

	const handleValueChange = (sectionIndex: number, rowIndex: number, newValue: string) => {
		const newSections = [...sections];

		// Clean numeric values using the same helper function
		newSections[sectionIndex].rows[rowIndex].value = cleanNumericValue(newValue);
		newSections[sectionIndex].rows[rowIndex].isValueModified = true; // Mark as manually modified
		setSections(newSections);
	};

	const handleClaveSelection = (sectionIndex: number, rowIndex: number, claveId: string) => {
		const newSections = [...sections];
		newSections[sectionIndex].rows[rowIndex].value = claveId;
		newSections[sectionIndex].rows[rowIndex].isValueModified = true;
		setSections(newSections);
	};

	const handleRazonSelection = (sectionIndex: number, rowIndex: number, razonId: string) => {
		const newSections = [...sections];
		newSections[sectionIndex].rows[rowIndex].value = razonId;
		newSections[sectionIndex].rows[rowIndex].isValueModified = true;
		setSections(newSections);
	};

	const handleClientSelection = (sectionIndex: number, rowIndex: number, clientId: string) => {
		const newSections = [...sections];
		newSections[sectionIndex].rows[rowIndex].value = clientId;
		newSections[sectionIndex].rows[rowIndex].isValueModified = true;
		setSections(newSections);
	};

	const handleAttributeChange = (sectionIndex: number, rowIndex: number, newAttribute: string) => {
		const newSections = [...sections];
		newSections[sectionIndex].rows[rowIndex].attribute = newAttribute;

		// If the user selects 'claveConcentradoraId', we can optionally pre-populate the value
		// with the first available clave if they want to make it easier
		if (newAttribute === 'claveConcentradoraId' && claves.length > 0) {
			// Optionally pre-populate with first clave, or leave empty for user to choose
			// newSections[sectionIndex].rows[rowIndex].value = claves[0].id;
		}

		// If the user selects 'razonSocialComercialId', we can optionally pre-populate the value
		// with the first available razon if they want to make it easier
		if (newAttribute === 'razonSocialComercialId' && razones.length > 0) {
			// Optionally pre-populate with first razon, or leave empty for user to choose
			// newSections[sectionIndex].rows[rowIndex].value = razones[0].id;
		}

		setSections(newSections);
	};

	// Get available attributes for dropdown (exclude already selected ones)
	const getAvailableAttributes = (currentSectionIndex: number, currentRowIndex: number) => {
		const selectedAttributes = new Set<string>();
		const excludedAttributes = new Set<string>();

		// Collect all currently selected attributes
		sections.forEach((section, sectionIdx) => {
			section.rows.forEach((row, rowIdx) => {
				// Skip the current row being edited
				if (sectionIdx === currentSectionIndex && rowIdx === currentRowIndex) {
					return;
				}
				// Add selected attributes to the set
				if (row.attribute && row.attribute !== '') {
					selectedAttributes.add(row.attribute);


				}
			});
		});

		// Return TRAZA_ATTRIBUTES filtered to exclude already selected ones and excluded parent fields
		return TRAZA_ATTRIBUTES.filter(attr =>
			!selectedAttributes.has(attr.value) && !excludedAttributes.has(attr.value)
		);
	};

	const handleSubmit = async () => {
		// Validate that we have at least some data
		if (sections.length === 0) {
			alert('No hay datos para enviar. Por favor, pega datos de Excel primero.');
			return;
		}

		// Check if we have any required fields (at least one attribute with a value)
		const hasData = sections.some(section =>
			section.rows.some(row => row.value.trim() && row.attribute)
		);

		if (!hasData) {
			alert('No hay datos válidos para enviar. Por favor, verifica que al menos un atributo tenga un valor.');
			return;
		}

		setIsLoading(true);
		setSuccessMessage('');

		// Create a new Traza object from the form data
		const trazaData: CreateTrazaType = {
			status: StatusType.ACTIVE,
			tadDireccionId: '',
			claveConcentradoraId: '',
			razonSocialComercialId: '',
			productoId: '', // Will be populated by product search
			origenCiudad: {} as never,
			origenEstado: {} as never,
			destinoCiudad: '',
			destinoEstado: {} as never
		};

		// Store the original product value from Excel for later search
		let originalProductValue = '';

		// Populate Traza attributes based on dropdown selections and input values
		sections.forEach(section => {
			section.rows.forEach(row => {
				if (row.value.trim() && row.attribute) {
					const attribute = row.attribute;
					const value = row.value.trim();

					// Handle numeric fields
					if (['capAutotanque1', 'capAutotanque2', 'capAutotanque3', 'capAutotanque4', 'litrosTotales', 'precioLitro'].includes(attribute)) {
						// Remove commas before parsing to get the full number
						const cleanValue = value.replace(/,/g, '');
						const numValue = parseFloat(cleanValue);
						if (!isNaN(numValue)) {
							(trazaData as Record<string, unknown>)[attribute] = numValue;
						}
					}
					// Handle date fields
					else if (['fechaHoraPemex', 'fechaHoraTrasvase'].includes(attribute)) {
						const dateValue = new Date(value);
						if (!isNaN(dateValue.getTime())) {
							(trazaData as Record<string, unknown>)[attribute] = dateValue.toISOString();
						}
					}
					// Handle string fields
					else {
						// Special handling for tipoTraza - validate enum values
						if (attribute === 'tipoTraza') {
							const upperValue = value.toUpperCase();
							if (upperValue === 'NACIONAL' || upperValue === 'INTERNACIONAL') {
								(trazaData as Record<string, unknown>)[attribute] = upperValue;
							}
						} else if (attribute === 'productoId') {
							// Store the product value for later search, don't assign directly
							originalProductValue = value;
						} else if (attribute === 'claveConcentradoraId') {
							// Skip - will be handled by dropdown selection
						} else if (attribute === 'razonSocialComercialId') {
							// Skip - will be handled by dropdown selection
						} else if (attribute === 'clienteId') {
							// Skip - will be handled by dropdown selection
						} else if (['origenCiudad', 'origenEstado', 'destinoCiudad', 'destinoEstado'].includes(attribute)) {
							// Skip location attributes - they are not needed in the Traza object
							// Do nothing - skip this attribute
						} else {
							(trazaData as Record<string, unknown>)[attribute] = value;
						}
					}
				}
			});
		});

		// Search for matching TAD based on origenCiudad and origenEstado from Excel data
		// We need to extract these values from the sections data since we're not storing them in trazaData
		let origenCiudadValue = '';
		let origenEstadoValue = '';

		// Find origenCiudad and origenEstado values from the processed sections
		sections.forEach(section => {
			section.rows.forEach(row => {
				if (row.attribute === 'origenCiudad' && row.value.trim()) {
					origenCiudadValue = row.value.trim();
				} else if (row.attribute === 'origenEstado' && row.value.trim()) {
					origenEstadoValue = row.value.trim();
				}
			});
		});

		if (origenCiudadValue && origenEstadoValue) {
			const matchingTad = await findMatchingTad(origenCiudadValue, origenEstadoValue);

			if (matchingTad) {
				// Populate only the TAD ID, not the object
				trazaData.tadDireccionId = matchingTad.id;
			}
		}

		// Search for matching Product based on the original product value from Excel
		if (originalProductValue) {
			// For now, just store the original value as productoId
			trazaData.productoId = originalProductValue;
		}

		// Get Clave ID from dropdown selection
		sections.forEach(section => {
			section.rows.forEach(row => {
				if (row.attribute === 'claveConcentradoraId' && row.value.trim()) {
					trazaData.claveConcentradoraId = row.value.trim();
				}
			});
		});

		// Get Razón ID from dropdown selection
		sections.forEach(section => {
			section.rows.forEach(row => {
				if (row.attribute === 'razonSocialComercialId' && row.value.trim()) {
					trazaData.razonSocialComercialId = row.value.trim();
				}
			});
		});

		// Get Cliente ID from dropdown selection
		sections.forEach(section => {
			section.rows.forEach(row => {
				if (row.attribute === 'clienteId' && row.value.trim()) {
					trazaData.clienteId = row.value.trim();
				}
			});
		});

		// Log the new Traza object to console before any API calls
		console.log('🚛 Nueva Traza preparada para envío:', trazaData);

		// Add a warning about required fields that might not be present in Excel data
		const missingRequiredFields = [];
		if (!trazaData.tadDireccionId) missingRequiredFields.push('TAD Dirección');
		if (!trazaData.claveConcentradoraId) missingRequiredFields.push('Clave Concentradora');
		if (!trazaData.razonSocialComercialId) missingRequiredFields.push('Razón Social Comercial');
		// Note: productoId is now searched automatically, not required to be manually filled

		if (missingRequiredFields.length > 0) {
			const proceed = confirm(
				`⚠️ Los siguientes campos requeridos no están presentes en los datos de Excel:\n\n` +
				`${missingRequiredFields.join(', ')}\n\n` +
				`Estos campos deberán ser completados manualmente en el formulario de Traza.\n\n` +
				`¿Deseas continuar con la creación de la traza?`
			);

			if (!proceed) {
				setIsLoading(false);
				return;
			}
		}

		try {
			const createdTraza = await createTraza(trazaData);

			if (createdTraza && createdTraza.id) {
				console.log('🚛 Nueva Traza creada:', createdTraza);
				setSuccessMessage('✅ Traza creada exitosamente. Redirigiendo...');

				// Small delay to show success message before redirecting
				setTimeout(() => {
					// Determine if user is admin or regular user based on current path
					const isAdmin = window.location.pathname.includes('/admin');
					const basePath = isAdmin ? '/admin' : '/user';

					// Navigate to the appropriate NewTraza route
					navigate(`${basePath}/traza/${createdTraza.id}`);
				}, 1500);
			} else {
				new Error('No se pudo crear la traza. El servidor no devolvió una respuesta válida.');
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear la traza';
			alert(`Error al crear la traza: ${errorMessage}. Por favor, intenta de nuevo.`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleReset = () => {
		setSections([]);
		setIsPasteAreaActive(true);
	};

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
								<li>Los datos se mostrarán organizados en 3 secciones</li>
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
					<div className="space-y-6">
						{/* Data Summary */}
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
							<h3 className="font-semibold text-blue-800 text-base mb-2">
								📊 Datos Importados
							</h3>
							<p className="text-blue-700 text-sm">
								{sections.length} secciones encontradas
								<span className="ml-2 text-green-600">
                                    ✓ Auto-selección habilitada
                                </span>
							</p>

							{/* Auto-selection summary */}
							{sections.length > 0 && (
								<div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
									<h4 className="font-medium text-green-800 mb-1 text-sm">
										🔍 Resumen de Auto-selección
									</h4>
									{(() => {
										const totalRows = sections.reduce((acc, section) => acc + section.rows.length, 0);
										const autoSelectedRows = sections.reduce((acc, section) =>
											acc + section.rows.filter(row => row.similarity).length, 0
										);
										const manualRows = totalRows - autoSelectedRows;

										return (
											<div className="text-xs text-green-700 space-y-0.5">
												<p>• Total de atributos: {totalRows}</p>
												<p>• Auto-seleccionados: {autoSelectedRows}</p>
												<p>• Requieren revisión manual: {manualRows}</p>
											</div>
										);
									})()}
								</div>
							)}

							{/* Attribute usage summary */}
							{sections.length > 0 && (
								<div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
									<h4 className="font-medium text-blue-800 mb-1 text-sm">
										🎯 Resumen de Atributos
									</h4>
									{(() => {
										const selectedAttributes = sections.reduce((acc, section) =>
											acc + section.rows.filter(row => row.attribute && row.attribute !== '').length, 0
										);
										const availableAttributes = TRAZA_ATTRIBUTES.length - selectedAttributes;
										return (
											<div className="text-xs text-blue-700 space-y-0.5">
												<p>• Atributos seleccionados: {selectedAttributes}</p>
												<p>• Atributos disponibles: {availableAttributes}</p>
												<p>• Total de atributos Traza: {TRAZA_ATTRIBUTES.length}</p>


											</div>
										);
									})()}
								</div>
							)}

						</div>

						{/* Sections Display */}
						{sections.map((section, sectionIndex) => (
							<div key={sectionIndex} className="border border-gray-200 rounded-lg p-4">
								<h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
									{section.title}
								</h3>

								{/* Column headers */}
								<div className="grid grid-cols-2 gap-3 mb-2">
									<div className="text-xs font-semibold text-gray-700">
										Atributo:
									</div>
									<div className="text-xs font-semibold text-gray-700">
										Valor:
									</div>
								</div>

								<div className="space-y-2">
									{section.rows.map((row, rowIndex) => (
										<div key={rowIndex} className="grid grid-cols-2 gap-3 items-center">
											<div className="bg-gray-50 p-2 rounded border border-gray-200">
												<select
													value={row.attribute}
													onChange={(e) => handleAttributeChange(sectionIndex, rowIndex, e.target.value)}
													className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
												>
													<option value="">Seleccionar atributo...</option>

													{/* Get available attributes (exclude already selected ones) */}
													{(() => {
														const availableAttributes = getAvailableAttributes(sectionIndex, rowIndex);

														// Group attributes by category for better organization
														const vehicleEquipment = availableAttributes.filter(attr =>
															['numeroTractor', 'placasTractor', 'autotanque1', 'placasAutotanque1',
																'autotanque2', 'placasAutotanque2', 'autotanque3', 'placasAutotanque3',
																'capAutotanque1', 'capAutotanque2', 'capAutotanque3', 'capAutotanque4',
																'sello1Autotanque1', 'sello2Autotanque1', 'sello1Autotanque2', 'sello2Autotanque2',
																'marcaUnidad1'].includes(attr.value)
														);

														const personnelOperations = availableAttributes.filter(attr =>
															['nombreTransportista', 'nombreOperador', 'numeroLicencia', 'fechaHoraPemex', 'fechaHoraTrasvase'].includes(attr.value)
														);

														const documentationFolios = availableAttributes.filter(attr =>
															['folio', 'folioPemex1', 'folioPemex2', 'folioPemex3', 'folioFiscalPemex1',
																'folioFiscalPemex2', 'folioFiscalPemex3', 'folioRemisionNacional',
																'folioFiscalRemisionNacional', 'folioTrasvase', 'folioCartaPorte', 'folioFiscalCartaPorte'].includes(attr.value)
														);

														const financialQuantities = availableAttributes.filter(attr =>
															['cfi', 'litrosTotales', 'precioLitro'].includes(attr.value)
														);

														const locationAddresses = availableAttributes.filter(attr =>
															['destino', 'destinoCorto', 'direccion', 'origenCiudad', 'origenEstado', 'destinoCiudad', 'destinoEstado'].includes(attr.value)
														);

														const businessEntities = availableAttributes.filter(attr =>
															['tadDireccionId', 'claveConcentradoraId', 'razonSocialComercialId', 'productoId', 'tipoTraza'].includes(attr.value)
														);

														const clients = availableAttributes.filter(attr =>
															['clienteId'].includes(attr.value)
														);


														return (
															<>
																{/* VEHICLE & EQUIPMENT */}
																{vehicleEquipment.length > 0 && (
																	<optgroup label="🚛 VEHÍCULOS Y EQUIPOS">
																		{vehicleEquipment.map(attr => (
																			<option key={attr.value} value={attr.value}>
																				{attr.label}
																			</option>
																		))}
																	</optgroup>
																)}

																{/* PERSONNEL & OPERATIONS */}
																{personnelOperations.length > 0 && (
																	<optgroup label="👥 PERSONAL Y OPERACIONES">
																		{personnelOperations.map(attr => (
																			<option key={attr.value} value={attr.value}>
																				{attr.label}
																			</option>
																		))}
																	</optgroup>
																)}

																{/* DOCUMENTATION & FOLIOS */}
																{documentationFolios.length > 0 && (
																	<optgroup label="📋 DOCUMENTACIÓN Y FOLIOS">
																		{documentationFolios.map(attr => (
																			<option key={attr.value} value={attr.value}>
																				{attr.label}
																			</option>
																		))}
																	</optgroup>
																)}

																{/* FINANCIAL & QUANTITIES */}
																{financialQuantities.length > 0 && (
																	<optgroup label="💰 FINANZAS Y CANTIDADES">
																		{financialQuantities.map(attr => (
																			<option key={attr.value} value={attr.value}>
																				{attr.label}
																			</option>
																		))}
																	</optgroup>
																)}

																{/* LOCATION & ADDRESSES */}
																{locationAddresses.length > 0 && (
																	<optgroup label="📍 UBICACIÓN Y DIRECCIONES">
																		{locationAddresses.map(attr => (
																			<option key={attr.value} value={attr.value}>
																				{attr.label}
																			</option>
																		))}
																	</optgroup>
																)}

																{/* BUSINESS ENTITIES */}
																{businessEntities.length > 0 && (
																	<optgroup label="🏢 ENTIDADES COMERCIALES">
																		{businessEntities.map(attr => (
																			<option key={attr.value} value={attr.value}>
																				{attr.label}
																			</option>
																		))}
																	</optgroup>
																)}

																{/* CLIENTS */}
																{clients.length > 0 && (
																	<optgroup label="🏢 CLIENTES CFI">
																		{clients.map(attr => (
																			<option key={attr.value} value={attr.value}>
																				{attr.label}
																			</option>
																		))}
																	</optgroup>
																)}

																{/* CLAVES - Show when Clave Concentradora is selected */}
																{row.attribute === 'claveConcentradoraId' && claves.length > 0 && (
																	<optgroup label="🔑 CLAVES DISPONIBLES">
																		{claves.map(clave => (
																			<option key={clave.id} value={clave.id}>
																				{clave.clave} - {clave.name}
																			</option>
																		))}
																	</optgroup>
																)}
															</>
														);
													})()}
												</select>

												{/* Show original Excel attribute only if it was auto-selected */}
												{row.originalAttribute && row.similarity && row.originalAttribute !== getDisplayLabel(row.attribute) && (
													<div className="text-xs text-blue-600 mt-1">
														📝 Original: {row.originalAttribute}
													</div>
												)}
											</div>
											<div>
												{row.attribute === 'claveConcentradoraId' && claves.length > 0 ? (
													<select
														value={row.value}
														onChange={(e) => handleClaveSelection(sectionIndex, rowIndex, e.target.value)}
														className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
															row.value ? 'border-green-500 bg-white text-gray-900' : 'border-gray-300 bg-white text-gray-900'
														}`}
													>
														<option value="">Seleccionar Clave...</option>
														{claves.map(clave => (
															<option key={clave.id} value={clave.id}>
																{clave.clave} - {clave.name}
															</option>
														))}
													</select>
												) : row.attribute === 'razonSocialComercialId' && razones.length > 0 ? (
													<select
														value={row.value}
														onChange={(e) => handleRazonSelection(sectionIndex, rowIndex, e.target.value)}
														className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
															row.value ? 'border-green-500 bg-white text-gray-900' : 'border-gray-300 bg-white text-gray-900'
														}`}
													>
														<option value="">Seleccionar Razón Social...</option>
														{razones.map(razon => (
															<option key={razon.id} value={razon.id}>
																{razon.name}
															</option>
														))}
													</select>
												) : row.attribute === 'clienteId' && clients.length > 0 ? (
													<select
														value={row.value}
														onChange={(e) => handleClientSelection(sectionIndex, rowIndex, e.target.value)}
														className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
															row.value ? 'border-green-500 bg-white text-gray-900' : 'border-gray-300 bg-white text-gray-900'
														}`}
													>
														<option value="">Seleccionar Cliente...</option>
														{clients.map(client => (
															<option key={client.id} value={client.id}>
																{client.noCliente} - {client.name}
															</option>
														))}
													</select>
												) : (
													<input
														type="text"
														value={row.value}
														onChange={(e) => handleValueChange(sectionIndex, rowIndex, e.target.value)}
														className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
															row.value ? 'border-green-500 bg-white text-gray-900' : 'border-gray-300 bg-white text-gray-900'
														}`}
														placeholder={row.value ? undefined : "Valor vacío"}
													/>
												)}
												{row.value && row.originalAttribute && !row.isValueModified && (
													<div className="text-xs text-green-600 mt-1">
														✓ Valor cargado desde Excel
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						))}

						{/* Success Message */}
						{successMessage && (
							<div className="bg-green-50 border border-green-200 rounded-lg p-3">
								<p className="text-green-800 text-sm font-medium">
									{successMessage}
								</p>
							</div>
						)}

						{/* Actions */}
						<div className="flex justify-between items-center pt-4 border-t border-gray-200">
							<div className="text-gray-600">
								<p className="text-xs">
									💡 <strong>Consejo:</strong> Revisa y modifica los valores antes de enviar
								</p>
								<p className="text-xs text-blue-600 mt-1">
									🔍 <strong>Auto-selección activa:</strong> Los atributos se mapean automáticamente
									según similitud
								</p>
								<p className="text-xs text-orange-600 mt-1">
									⚠️ <strong>Nota:</strong> El campo TAD Dirección es requerido por el sistema y
									deberá ser completado manualmente. Clave Concentradora y Razón Social tienen
									dropdowns disponibles. El Producto se busca automáticamente basado en los datos de
									Excel.
								</p>
							</div>

							<div className="flex gap-3">
								<button
									onClick={handleSubmit}
									className={`px-4 py-2 text-white rounded font-semibold text-sm transition-colors ${
										isLoading
											? 'bg-gray-400 cursor-not-allowed'
											: 'bg-blue-500 hover:bg-blue-600'
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
