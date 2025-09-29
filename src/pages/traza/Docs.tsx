import {Container} from "../../components/Container.tsx";
import {Header} from "../../components/Header.tsx";
import {SubHeader, SubHeaderProps} from "../../components/SubHeader.tsx";
import {List} from "../../components/List.tsx";
import {Steps} from "../../components/Steps.tsx";
import {useEffect, useState, useRef} from "react";
import {ModelType} from "../../api/types/model-types.ts";
import {useParams} from "react-router";
import {TemplateType} from "../../api/types/template-type.ts";
import {getTemplateFile, getTemplates} from "../../api/templates-api.ts";
import {Spinner} from "../../components/Spinner.tsx";
import {Button} from "../../components/Button.tsx";
import {Field} from "../../api/types/field-types";
import {TrazaType} from "../../api/types/traza-types.ts";
import {getTraza} from "../../api/trazas-api.ts";
import {ReactPDFGenerator} from "../../components/ReactPDFGenerator.tsx";
import {ClientType} from "../../api/types/client-types.ts";
import {getClient} from "../../api/clients-api.ts";
// Text width calculation function
const getTextWidth = (text: string, font: string): number => {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	if (!context) return 0;
	context.font = font; // e.g., "16px Arial"
	const metrics = context.measureText(text);
	return metrics.width;
};

// Function to break text into multiple lines based on field width
const breakTextIntoLines = (text: string, fieldWidth: number, fontSize: number, fontFamily: string = 'Helvetica'): string[] => {
	const font = `${fontSize}px ${fontFamily}`;
	const textWidth = getTextWidth(text, font);
	
	console.log(`breakTextIntoLines: text="${text}", fieldWidth=${fieldWidth}, fontSize=${fontSize}, fontFamily="${fontFamily}"`);
	console.log(`Text width: ${textWidth}, Field width: ${fieldWidth}`);
	
	// If text fits in one line, return as is
	if (textWidth <= fieldWidth) {
		console.log('Text fits in one line, no breaking needed');
		return [text];
	}
	
	// Split text into words
	const words = text.split(' ');
	const lines: string[] = [];
	let currentLine = '';
	
	for (const word of words) {
		const testLine = currentLine ? `${currentLine} ${word}` : word;
		const testWidth = getTextWidth(testLine, font);
		
		if (testWidth <= fieldWidth) {
			currentLine = testLine;
		} else {
			// If current line is not empty, add it to lines
			if (currentLine) {
				lines.push(currentLine);
				currentLine = word;
			} else {
				// If even a single word is too long, we need to break it by characters
				const brokenWord = breakWordByCharacters(word, fieldWidth, fontSize, fontFamily);
				lines.push(...brokenWord);
			}
		}
	}
	
	// Add the last line if it's not empty
	if (currentLine) {
		lines.push(currentLine);
	}
	
	return lines;
};

// Function to break a single word by characters if it's too long
const breakWordByCharacters = (word: string, fieldWidth: number, fontSize: number, fontFamily: string = 'Helvetica'): string[] => {
	const font = `${fontSize}px ${fontFamily}`;
	const lines: string[] = [];
	let currentLine = '';
	
	for (let i = 0; i < word.length; i++) {
		const char = word[i];
		const testLine = currentLine + char;
		const testWidth = getTextWidth(testLine, font);
		
		if (testWidth <= fieldWidth) {
			currentLine = testLine;
		} else {
			// If current line is not empty, add it to lines
			if (currentLine) {
				lines.push(currentLine);
				currentLine = char;
			} else {
				// If even a single character is too long, just add it
				lines.push(char);
			}
		}
	}
	
	// Add the last line if it's not empty
	if (currentLine) {
		lines.push(currentLine);
	}
	
	return lines;
};

// Custom Spanish number-to-words converter
const convertNumberToSpanishWords = (num: number): string => {
	const ones = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
	const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
	const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
	const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

	const convertHundreds = (n: number): string => {
		if (n === 0) return '';
		if (n === 100) return 'cien';
		if (n < 100) return convertTens(n);
		
		const h = Math.floor(n / 100);
		const remainder = n % 100;
		
		if (remainder === 0) return hundreds[h];
		return hundreds[h] + ' ' + convertTens(remainder);
	};

	const convertTens = (n: number): string => {
		if (n < 10) return ones[n];
		if (n < 20) return teens[n - 10];
		
		const t = Math.floor(n / 10);
		const o = n % 10;
		
		if (o === 0) return tens[t];
		return tens[t] + ' y ' + ones[o];
	};

	const convertThousands = (n: number): string => {
		if (n < 1000) return convertHundreds(n);
		
		const thousands = Math.floor(n / 1000);
		const remainder = n % 1000;
		
		let result = '';
		if (thousands === 1) {
			result = 'mil';
		} else {
			result = convertHundreds(thousands) + ' mil';
		}
		
		if (remainder > 0) {
			result += ' ' + convertHundreds(remainder);
		}
		
		return result;
	};

	const convertMillions = (n: number): string => {
		if (n < 1000000) return convertThousands(n);
		
		const millions = Math.floor(n / 1000000);
		const remainder = n % 1000000;
		
		let result = '';
		if (millions === 1) {
			result = 'un millón';
		} else {
			result = convertHundreds(millions) + ' millones';
		}
		
		if (remainder > 0) {
			result += ' ' + convertThousands(remainder);
		}
		
		return result;
	};

	// Handle the integer part
	const integerPart = Math.floor(num);
	const decimalPart = Math.round((num - integerPart) * 100);
	
	let result = convertMillions(integerPart);
	
	// Add decimal part if exists
	if (decimalPart > 0) {
		result += ' con ' + convertTens(decimalPart);
	}
	
	return result;
};

const subheaderProps: SubHeaderProps[] = [
	{title: 'Nombre', dbProperty: 'username', sort: 'asc'},
	{title: 'Status', dbProperty: 'status', sort: 'asc'}
];

export const Docs = () => {

	const [templateList, setTemplateList] = useState<TemplateType[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
	const [traza, setTraza] = useState<TrazaType | undefined>(undefined);
	const [client, setClient] = useState<ClientType | undefined>(undefined);
	
	// Add container width and scale for coordinate consistency (same as PDFViewer)
	const [containerWidth] = useState<number | null>(800); // Default container width
	const scale = 1.0; // Default scale factor
	
	// Ref for ReactPDFGenerator
	const reactPDFGeneratorRef = useRef<any>(null);

	const params = useParams();


	// Helper function to get field text value from traza/client data
	const getFieldText = (fieldName: string, trazaData?: TrazaType, clientData?: ClientType, fieldWidth?: number, fontSize?: number, fontFamily?: string): string | string[] => {
		console.log(`getFieldText called with fieldName: "${fieldName}"`);
		
		if (!trazaData && !clientData) {
			console.log('No traza or client data available, returning fieldName');
			return fieldName;
		}

		// Handle TAD Direccion fields
		if (fieldName === 'tadDireccion_ciudadEstado') {
			console.log('TAD Direccion ciudad/estado field detected');
			
			if (trazaData && trazaData.tadDireccion) {
				const tadDireccion = trazaData.tadDireccion;
				const ciudad = tadDireccion.ciudad || '';
				const estado = tadDireccion.estado?.name || tadDireccion.estadoId || '';
				
				const result = `TAD ${ciudad}, ${estado}`.trim().toUpperCase();
				console.log(`TAD Direccion ciudad/estado result: "${result}"`);
				return result;
			} else {
				console.log('TAD Direccion data not found in traza');
			}
		}

		// Handle TAD Direccion direccion field
		if (fieldName === 'tadDireccion_direccion') {
			console.log('TAD Direccion direccion field detected');
			
			if (trazaData && trazaData.tadDireccion) {
				const direccion = trazaData.tadDireccion.direccion || '';
				const result = direccion.toUpperCase();
				console.log(`TAD Direccion direccion result: "${result}"`);
				return result;
			} else {
				console.log('TAD Direccion data not found in traza');
			}
		}

		// Handle Cliente razon social field
		if (fieldName === 'razonSocialComercial_razonSocial') {
			console.log('Cliente razon social field detected');
			
			// First try to get from the associated Cliente object
			if (trazaData && trazaData.cliente && trazaData.cliente.razonSocial) {
				const razonSocial = trazaData.cliente.razonSocial;
				const result = razonSocial.toUpperCase();
				console.log(`Cliente razon social result (from cliente): "${result}"`);
				return result;
			}
			// Fallback to razonSocialComercial if cliente is not available
			else if (trazaData && trazaData.razonSocialComercial) {
				const razonSocial = trazaData.razonSocialComercial.name || '';
				const result = razonSocial.toUpperCase();
				console.log(`Cliente razon social result (from razonSocialComercial): "${result}"`);
				return result;
			} else {
				console.log('Cliente razon social data not found in traza');
			}
		}

		// Handle Cliente direccion field
		if (fieldName === 'razonSocialComercial_direccion') {
			console.log('Cliente direccion field detected');
			
			// Get from the associated Cliente object
			if (trazaData && trazaData.cliente && trazaData.cliente.direccion) {
				const direccion = trazaData.cliente.direccion;
				const result = direccion.toUpperCase();
				console.log(`Cliente direccion result (from cliente): "${result}"`);
				return result;
			} else {
				console.log('Cliente direccion data not found in traza');
			}
		}

		// Handle other Cliente fields
		if (fieldName === 'noCliente' || fieldName === 'name' || fieldName === 'unbMx' || fieldName === 'direccionCorta' || fieldName === 'id2') {
			console.log(`Cliente ${fieldName} field detected`);
			
			if (trazaData && trazaData.cliente) {
				const value = trazaData.cliente[fieldName as keyof ClientType];
				const result = value ? String(value).toUpperCase() : '';
				console.log(`Cliente ${fieldName} result: "${result}"`);
				return result;
			} else {
				console.log(`Cliente ${fieldName} data not found in traza`);
			}
		}

		// Handle Producto clave field
		if (fieldName === 'producto_clave') {
			console.log('Producto clave field detected');
			
			if (trazaData && trazaData.producto) {
				const clave = trazaData.producto.clave || '';
				const result = clave.toUpperCase();
				console.log(`Producto clave result: "${result}"`);
				
				// Apply line breaking if field dimensions are provided
				if (fieldWidth && fontSize && fontFamily) {
					console.log(`Applying line breaking for producto_clave. Field width: ${fieldWidth}, Font size: ${fontSize}, Font family: ${fontFamily}`);
					const lines = breakTextIntoLines(result, fieldWidth, fontSize, fontFamily);
					console.log(`Producto clave broken into ${lines.length} lines:`, lines);
					return lines; // Return array of lines instead of joined string
				}
				
				return result;
			} else {
				console.log('Producto data not found in traza');
			}
		}

		// Handle Producto descripcion field
		if (fieldName === 'producto_descripcion') {
			console.log('Producto descripcion field detected');
			
			if (trazaData && trazaData.producto) {
				const descripcion = trazaData.producto.descripcion || '';
				const result = descripcion.toUpperCase();
				console.log(`Producto descripcion result: "${result}"`);
				return result;
			} else {
				console.log('Producto data not found in traza');
			}
		}

		// Handle Producto nombre field
		if (fieldName === 'producto_nombre') {
			console.log('Producto nombre field detected');
			
			if (trazaData && trazaData.producto) {
				const nombre = trazaData.producto.name || '';
				const result = nombre.toUpperCase();
				console.log(`Producto nombre result: "${result}"`);
				return result;
			} else {
				console.log('Producto data not found in traza');
			}
		}

		// Handle Producto temperatura field
		if (fieldName === 'producto_temperatura') {
			console.log('Producto temperatura field detected');
			
			if (trazaData && trazaData.producto) {
				const temperatura = trazaData.producto.temperatura || '';
				
				// Format temperatura with decimal point and two trailing numbers
				let result = temperatura;
				if (temperatura && !isNaN(parseFloat(temperatura))) {
					// If it's a valid number, format it with 2 decimal places
					const numValue = parseFloat(temperatura);
					result = numValue.toFixed(2);
				} else if (temperatura) {
					// If it's not a number but has a value, keep it as is
					result = temperatura;
				}
				
				const finalResult = result.toUpperCase();
				console.log(`Producto temperatura result: "${finalResult}"`);
				return finalResult;
			} else {
				console.log('Producto data not found in traza');
			}
		}

		// Handle Producto IVA field
		if (fieldName === 'producto_iva') {
			console.log('Producto IVA field detected');
			
			if (trazaData && trazaData.producto) {
				const iva = trazaData.producto.iva || '';
				const result = iva.toUpperCase();
				console.log(`Producto IVA result: "${result}"`);
				return result;
			} else {
				console.log('Producto data not found in traza');
			}
		}

		// Handle Importe field
		if (fieldName === 'importe') {
			console.log('Importe field detected');
			
			if (trazaData && trazaData.litrosTotales && trazaData.precioLitro) {
				// Calculate importe = litrosTotales * precioLitro
				const litros = parseFloat(trazaData.litrosTotales.toString()) || 0;
				const precio = parseFloat(trazaData.precioLitro.toString()) || 0;
				const importe = litros * precio;
				// Format with commas for thousands separator and 2 decimal places
				const result = importe.toLocaleString('en-US', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				});
				console.log(`Importe calculation: ${litros} * ${precio} = ${result}`);
				return result;
			} else {
				console.log('Missing litrosTotales or precioLitro data for importe calculation');
			}
		}

		// Handle Importe con IVA field
		if (fieldName === 'importe_con_iva') {
			console.log('Importe con IVA field detected');
			
			if (trazaData && trazaData.litrosTotales && trazaData.producto && trazaData.producto.iva) {
				// Calculate importe con IVA = litrosTotales * producto.iva
				const litros = parseFloat(trazaData.litrosTotales.toString()) || 0;
				const iva = parseFloat(trazaData.producto.iva.toString()) || 0;
				const importeConIva = litros * iva;
				// Format with commas for thousands separator and 2 decimal places
				const result = importeConIva.toLocaleString('en-US', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				});
				console.log(`Importe con IVA calculation: ${litros} * ${iva} = ${result}`);
				return result;
			} else {
				console.log('Missing litrosTotales or producto.iva data for importe con IVA calculation');
			}
		}

		// Handle Importe Total field
		if (fieldName === 'importe_total') {
			console.log('Importe Total field detected');
			
			if (trazaData && trazaData.litrosTotales && trazaData.precioLitro && trazaData.producto && trazaData.producto.iva) {
				// Calculate importe = litrosTotales * precioLitro
				const litros = parseFloat(trazaData.litrosTotales.toString()) || 0;
				const precio = parseFloat(trazaData.precioLitro.toString()) || 0;
				const importe = litros * precio;
				
				// Calculate importe con IVA = litrosTotales * producto.iva
				const iva = parseFloat(trazaData.producto.iva.toString()) || 0;
				const importeConIva = litros * iva;
				
				// Calculate importe total = importe + importe con IVA
				const importeTotal = importe + importeConIva;
				
				// Format with commas for thousands separator and 2 decimal places
				const result = importeTotal.toLocaleString('en-US', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				});
				console.log(`Importe Total calculation: ${importe} + ${importeConIva} = ${result}`);
				return result;
			} else {
				console.log('Missing required data for importe total calculation (litrosTotales, precioLitro, or producto.iva)');
			}
		}

		// Handle Importe Total en Letras field
		if (fieldName === 'importe_total_en_letras') {
			console.log('Importe Total en Letras field detected');
			
			if (trazaData && trazaData.litrosTotales && trazaData.precioLitro && trazaData.producto && trazaData.producto.iva) {
				try {
					// Calculate importe = litrosTotales * precioLitro
					const litros = parseFloat(trazaData.litrosTotales.toString()) || 0;
					const precio = parseFloat(trazaData.precioLitro.toString()) || 0;
					const importe = litros * precio;
					
					// Calculate importe con IVA = litrosTotales * producto.iva
					const iva = parseFloat(trazaData.producto.iva.toString()) || 0;
					const importeConIva = litros * iva;
					
					// Calculate importe total = importe + importe con IVA
					const importeTotal = importe + importeConIva;
					
					// Convert to words using our custom Spanish converter and make it uppercase
					const wordsResult = convertNumberToSpanishWords(importeTotal).toUpperCase();
					
					// Extract the cents (decimal part) and format as (XX/100 M.N.)
					const cents = Math.round((importeTotal - Math.floor(importeTotal)) * 100);
					const centsSuffix = `(${cents.toString().padStart(2, '0')}/100 M.N.)`;
					
					// Combine the words with the cents suffix
					const result = `${wordsResult} ${centsSuffix}`;
					
					console.log(`Importe Total en Letras calculation: ${importe} + ${importeConIva} = ${importeTotal} -> "${result}"`);
					return result;
				} catch (error) {
					console.error('Error converting importe total to words:', error);
					return 'Error al convertir a letras';
				}
			} else {
				console.log('Missing required data for importe total en letras calculation (litrosTotales, precioLitro, or producto.iva)');
			}
		}

		// Handle Fecha Pemex field
		if (fieldName === 'fecha_pemex') {
			console.log('Fecha Pemex field detected');
			
			if (trazaData && trazaData.fechaHoraPemex) {
				try {
					const fechaHoraPemex = trazaData.fechaHoraPemex;
					console.log(`Found fechaHoraPemex: "${fechaHoraPemex}"`);
					
					if (fechaHoraPemex && typeof fechaHoraPemex === 'string') {
						// Try parsing the original format first
						let date = new Date(fechaHoraPemex);
						
						// If that fails, try to parse the specific format: "05/05/2025, 08:48:56 p.m."
						if (isNaN(date.getTime())) {
							console.log('Standard parsing failed, trying custom format parsing');
							
							// Parse format: "05/05/2025, 08:48:56 p.m."
							const dateMatch = (fechaHoraPemex as string).match(/(\d{2})\/(\d{2})\/(\d{4}),\s+(\d{2}):(\d{2}):(\d{2})\s+(a\.m\.|p\.m\.)/);
							if (dateMatch) {
								const [, month, day, year, hour, minute, second, period] = dateMatch;
								
								// Convert 12-hour to 24-hour format
								let hour24 = parseInt(hour);
								if (period === 'p.m.' && hour24 !== 12) {
									hour24 += 12;
								} else if (period === 'a.m.' && hour24 === 12) {
									hour24 = 0;
								}
								
								// Create date with parsed values
								date = new Date(
									parseInt(year),
									parseInt(month) - 1, // Month is 0-indexed
									parseInt(day),
									hour24,
									parseInt(minute),
									parseInt(second)
								);
								
								console.log(`Custom parsed date: ${date}`);
							} else {
								console.log('Date format not recognized');
							}
						}
						
						if (!isNaN(date.getTime())) {
							// Format as DD/MM/YYYY (date only, no time)
							const day = date.getDate().toString().padStart(2, '0');
							const month = (date.getMonth() + 1).toString().padStart(2, '0');
							const year = date.getFullYear().toString();
							const result = `${day}/${month}/${year}`;
							console.log(`Fecha Pemex result: "${result}"`);
							return result;
						} else {
							console.log('Invalid date parsed after all attempts');
						}
					} else {
						console.log('fechaHoraPemex is not a string or is empty');
					}
				} catch (error) {
					console.error('Error parsing fechaHoraPemex:', error);
				}
			} else {
				console.log('fechaHoraPemex data not found in traza');
			}
		}

		// Handle Cantidad al Natural field
		if (fieldName === 'cantidad_al_natural') {
			console.log('Cantidad al Natural field detected');
			
			if (trazaData && trazaData.litrosTotales && trazaData.producto && trazaData.producto.name) {
				try {
					const litrosTotales = parseFloat(trazaData.litrosTotales.toString()) || 0;
					const productoName = trazaData.producto.name.toLowerCase();
					
					console.log(`litrosTotales: ${litrosTotales}, producto name: "${productoName}"`);
					
					let adjustment = 0;
					if (productoName.includes('diesel')) {
						adjustment = 85;
						console.log('Producto is Diesel, adding 85');
					} else {
						adjustment = 433;
						console.log('Producto is not Diesel, adding 433');
					}
					
					const cantidadAlNatural = litrosTotales + adjustment;
					const result = cantidadAlNatural.toFixed(3);
					
					console.log(`Cantidad al Natural calculation: ${litrosTotales} + ${adjustment} = ${result}`);
					return result;
				} catch (error) {
					console.error('Error calculating cantidad al natural:', error);
					return 'Error en cálculo';
				}
			} else {
				console.log('Missing required data for cantidad al natural calculation (litrosTotales or producto.name)');
			}
		}

		// Handle date breakdown fields (e.g., 'fechaHoraPemex_year', 'fechaHoraPemex_month', 'fechaHoraPemex_day', 'fechaHoraTrasvase_year', etc.)
		if (fieldName.includes('_year') || fieldName.includes('_month') || fieldName.includes('_day')) {
			// Extract the base field name (e.g., 'fechaHoraPemex' from 'fechaHoraPemex_year', 'fechaHoraTrasvase' from 'fechaHoraTrasvase_year')
			const baseFieldName = fieldName.replace(/_year|_month|_day$/, '') as keyof TrazaType;
			console.log(`Date breakdown field detected. Base field name: "${baseFieldName}"`);
			
			if (trazaData && baseFieldName in trazaData) {
				const dateValue = trazaData[baseFieldName];
				console.log(`Found base field in traza data. Value: "${dateValue}"`);
				
				if (dateValue && typeof dateValue === 'string') {
					try {
						// Handle different date formats
						let date: Date;
						
						// Try parsing the original format first
						date = new Date(dateValue);
						
						// If that fails, try to parse the specific format: "05/05/2025, 08:48:56 p.m."
						if (isNaN(date.getTime())) {
							console.log('Standard parsing failed, trying custom format parsing');
							
							// Parse format: "05/05/2025, 08:48:56 p.m."
							const dateMatch = dateValue.match(/(\d{2})\/(\d{2})\/(\d{4}),\s+(\d{2}):(\d{2}):(\d{2})\s+(a\.m\.|p\.m\.)/);
							if (dateMatch) {
								const [, month, day, year, hour, minute, second, period] = dateMatch;
								
								// Convert 12-hour to 24-hour format
								let hour24 = parseInt(hour);
								if (period === 'p.m.' && hour24 !== 12) {
									hour24 += 12;
								} else if (period === 'a.m.' && hour24 === 12) {
									hour24 = 0;
								}
								
								// Create date with parsed values
								date = new Date(
									parseInt(year),
									parseInt(month) - 1, // Month is 0-indexed
									parseInt(day),
									hour24,
									parseInt(minute),
									parseInt(second)
								);
								
								console.log(`Custom parsed date: ${date}`);
							} else {
								console.log('Date format not recognized');
							}
						}
						
						if (!isNaN(date.getTime())) {
							let result = '';
							if (fieldName.includes('_year')) {
								result = date.getFullYear().toString();
							} else if (fieldName.includes('_month')) {
								result = (date.getMonth() + 1).toString().padStart(2, '0');
							} else if (fieldName.includes('_day')) {
								result = date.getDate().toString().padStart(2, '0');
							}
							console.log(`Date breakdown result: "${result}"`);
							return result;
						} else {
							console.log('Invalid date parsed after all attempts');
						}
					} catch (error) {
						console.error('Error parsing date:', error);
					}
				} else {
					console.log('Date value is not a string or is empty');
				}
			} else {
				console.log(`Base field "${baseFieldName}" not found in traza data`);
			}
		}

		// Check if it's a traza field
		if (trazaData && fieldName in trazaData) {
			const value = trazaData[fieldName as keyof TrazaType];
			console.log(`Found field in traza data. Value: "${value}"`);
			
			// Special formatting for litrosTotales - add decimal point and 3 trailing zeros
			if (fieldName === 'litrosTotales' && value) {
				const formattedValue = `${value}.000`;
				console.log(`Formatted litrosTotales: "${formattedValue}"`);
				return formattedValue;
			}
			
			// Special formatting for precioLitro - add decimal point and 5 trailing zeros
			if (fieldName === 'precioLitro' && value) {
				const formattedValue = `${value}.00000`;
				console.log(`Formatted precioLitro: "${formattedValue}"`);
				return formattedValue;
			}
			
			return value ? String(value) : '';
		}

		// Check if it's a client field
		if (clientData && fieldName in clientData) {
			const value = clientData[fieldName as keyof ClientType];
			console.log(`Found field in client data. Value: "${value}"`);
			return value ? String(value) : '';
		}

		// Return the field name as fallback
		console.log(`Field not found, returning fieldName as fallback: "${fieldName}"`);
		return fieldName;
	};

	const generateDocs = async () => {
		if (selectedTemplates.length === 0) {
			console.log('Seleccione al menos una Plantilla.')
			return;
		}

		// Debug logging to show available data
		console.log('\n=== PDF GENERATION START ===');
		console.log('Available Traza data:', traza);
		console.log('Available Client data:', client);
		console.log(`Selected Templates: ${selectedTemplates.length} template(s)`);
		console.log('=============================\n');

		// Generate PDFs for each selected template using ReactPDFGenerator
		for (const templateId of selectedTemplates) {
			const template = templateList.find(t => t.id === templateId);
			if (template) {
				try {
					const file = await getTemplateFile(template.pdfFile);

					if (file) {
						const fields: Field[] = template.fields.map(field => {
							const fieldName = field.name;
							
							// Get the actual text value for this field with field dimensions for line breaking
							let fieldText = getFieldText(fieldName, traza, client, field.width, field.fontSize, field.fontFamily);
							
							// Handle both string and array returns from getFieldText
							let finalText: string;
							let textLines: string[] = [];
							
							if (Array.isArray(fieldText)) {
								// If it's an array of lines, join them for display but keep the array for multi-line handling
								finalText = fieldText.join(' ');
								textLines = fieldText;
								console.log(`Field: ${field.name} -> Multi-line text:`, fieldText);
							} else {
								// If it's a string, use it as is
								finalText = fieldText;
								textLines = [fieldText];
								console.log(`Field: ${field.name} -> Single-line text: "${fieldText}"`);
							}
							
							// Debug logging to see what's being populated
							const isDateBreakdown = fieldName.includes('_year') || fieldName.includes('_month') || fieldName.includes('_day');
							console.log(`Field: ${field.name} -> Final text: "${finalText}"${isDateBreakdown ? ` (date breakdown)` : ''}`);
							
							return {
								id: field.id,
								x: field.x,
								y: field.y,
								width: field.width,
								height: field.height,
								name: fieldName as keyof TrazaType,
								fontFamily: field.fontFamily,
								fontSize: field.fontSize,
								align: field.align,
								backgroundColor: field.color,
								type: (field.type as 'data' | 'qr') || 'data',
								// Add the actual text value
								text: finalText,
								// Add multi-line support for fields that need it
								...(Array.isArray(fieldText) && {
									textLines: textLines,
									isMultiLine: true
								}),
								// Add QR-specific properties if it's a QR field
								...(field.type === 'qr' && {
									qrData: finalText, // Use the populated text as QR data
									qrSize: 100,
									qrColor: '#000000',
									qrBackgroundColor: '#ffffff',
									qrErrorCorrectionLevel: 'M'
								})
							};
						});

						// Print comprehensive field summary for this template
						console.log(`\n=== TEMPLATE: ${template.name} ===`);
						console.log('Fields and Values:');
						fields.forEach((field, index) => {
							console.log(`${index + 1}. Field: "${field.name}"`);
							console.log(`   - Text Value: "${field.text}"`);
							console.log(`   - Position: (${field.x}, ${field.y})`);
							console.log(`   - Size: ${field.width} x ${field.height}`);
							console.log(`   - Type: ${field.type}`);
							if (field.type === 'qr') {
								console.log(`   - QR Data: "${field.qrData}"`);
								console.log(`   - QR Size: ${field.qrSize}`);
							}
							console.log('---');
						});
						console.log(`=== END TEMPLATE: ${template.name} ===\n`);

						const pdfFile: File = new File([file], template.pdfFile, {type: 'application/pdf'});
						
						// Use the template's containerWidth for coordinate consistency
						const templateContainerWidth = template.containerWidth || 800;
						
						// Use ReactPDFGenerator for perfect consistency with PDFViewer
						if (reactPDFGeneratorRef.current) {
							// Set the file and fields for this template
							reactPDFGeneratorRef.current.setFile(pdfFile);
							reactPDFGeneratorRef.current.setFields(fields);
							reactPDFGeneratorRef.current.setTraza(traza);
							reactPDFGeneratorRef.current.setClient(client);
							
							// Generate the PDF with the correct container width
							await reactPDFGeneratorRef.current.generatePDF(pdfFile, fields, traza, client, templateContainerWidth);
						}
					} else {
						console.error('Error fetching PDF file for template:', template.pdfFile);
					}
				} catch (error) {
					console.error(`Error generando documento para la plantilla ${template.name}:`, error);
				}
			}
		}
	}

	const handleSelection = (template: TemplateType) => {
		setSelectedTemplates(prev =>
			prev.includes(template.id)
				? prev.filter(id => id !== template.id)
				: [...prev, template.id]
		);
	}

	const handleChange = () => {
	}

	useEffect(() => {
		async function fetchTemplates() {
			setIsLoading(true);
			const templates = await getTemplates();
			if (templates) {
				setTemplateList(templates);
			} else {
				console.error('Error fetching templates');
			}
			setIsLoading(false);
		}

		async function fetchTraza() {
			if (params.id) {
				setIsLoading(true);
				const traza: TrazaType = await getTraza(params.id);
				if (traza) {
					setTraza(traza);
					
					// Also fetch client data if traza has clienteId
					if (traza.clienteId) {
						try {
							const client: ClientType = await getClient(traza.clienteId);
							if (client) {
								setClient(client);
							}
						} catch (error) {
							console.error('Error fetching client:', error);
						}
					}
				} else {
					console.error('Error fetching traza:', params.id);
					setTraza(undefined);
				}
				setIsLoading(false);
			}
		}

		fetchTemplates();
		fetchTraza();
	}, [params.id]);

	return (
		<div className='h-[100%] content-center mt-3'>
			<Container>
				<Steps step={5} trazaId={params.id}/>
				<Header title='Traza'/>
				<SubHeader props={subheaderProps}/>
				<List elements={{model: ModelType.TEMPLATE, elements: templateList}}
					  onClick={(template: TemplateType) => handleSelection(template)}
					  selected={selectedTemplates}
					  onChange={handleChange}
				/>
				{
					isLoading
						? (<Spinner styles='m-auto pb-10.5 grid'/>)
						: (
							templateList.length > 0 &&
							<Button type={'submit'}
									styles='mt-5 w-[55%] text-md'
									label='Generar Documentos'
									onClick={generateDocs}
							/>
						)
				}
				
				{/* Hidden ReactPDFGenerator for PDF generation */}
				<div style={{ display: 'none' }}>
					<ReactPDFGenerator
						ref={reactPDFGeneratorRef}
						file={null}
						fields={[]}
						traza={traza || {
							id: 'test-id',
							folio: 'TEST-001',
							placasTractor: 'ABC-123',
							placasAutotanque1: 'XYZ-789',
							sello1Autotanque1: 'SELLO-456',
							sello2Autotanque1: 'SELLO-789',
							nombreTransportista: 'Transportista Ejemplo S.A.',
							nombreOperador: 'Juan Pérez',
							destino: 'Ciudad de México',
							destinoCorto: 'CDMX',
							litrosTotales: 50000,
							precioLitro: 25.50,
							folioPemex1: 'PEMEX-001',
							folioTrasvase: 'TRASVASE-001',
							numeroTractor: 'TRACTOR-001',
							autotanque1: 'AUTOTANQUE-001',
							cfi: 'CFI-001',
							numeroLicencia: 'LIC-001',
							marcaUnidad1: 'Marca Ejemplo',
							folioCartaPorte: 'CARTA-PORTE-001',
						} as TrazaType}
						client={client || {
							id: 'client-test-id',
							noCliente: 'CLI-001',
							name: 'Cliente Ejemplo S.A.',
							razonSocial: 'Cliente Ejemplo Sociedad Anónima',
							rfc: 'CEX123456789',
							unbMx: 'UNB-MX-001',
							direccion: 'Av. Principal 123, Col. Centro, Ciudad de México',
							direccionCorta: 'Av. Principal 123, CDMX',
							id2: 'CLI-001-ALT',
							status: 'ACTIVE' as any,
							createdAt: new Date(),
							updatedAt: new Date(),
						} as ClientType}
						containerWidth={containerWidth}
						scale={scale}
					/>
				</div>
			</Container>
		</div>
	)
}
