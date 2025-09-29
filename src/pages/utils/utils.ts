import {SubHeaderProps} from "../../components/SubHeader.tsx";
import {getAllClaves, getTotalClaves} from "../../api/claves-api.ts";
import {PAGE_SIZE} from "../../api/tads-api.ts";
import {ClaveType} from "../../api/types/clave-types.ts";
import {RazonType} from "../../api/types/razon-types.ts";
import {getAllRazones, getTotalRazones} from "../../api/razones-api.ts";

export const getOrderAndSort = (subheaderProps: SubHeaderProps[]): object[] => {
	const orderAndSort: object[] = [{}]
	subheaderProps.forEach((prop, index) => {
		orderAndSort[index] = {[prop.dbProperty]: prop.sort};
	});
	return orderAndSort;
}

export const fetchClaves = async (setClaves: (claves: ClaveType[]) => void) => {
	try {
		const total = await getTotalClaves();
		const claves = await getAllClaves(0, total >= 10 ? total : PAGE_SIZE);

		if (claves) {
			const claveTypes: ClaveType[] = claves.map((clave) => {
				return {
					id: clave.id,
					name: clave.clave + ' - ' + clave.name,
				} as ClaveType;
			});
			setClaves(claveTypes);
		}
	} catch (error) {
		console.log('Error fetching claves:', error);
	}
};

export const fetchRazones = async (setRazones: (razones: RazonType[]) => void) => {
	try {
		const total = await getTotalRazones();
		const razones = await getAllRazones(0, total >= 10 ? total : PAGE_SIZE);

		if (razones) {
			const razonesType = razones.map((razon) => {
				return {
					id: razon.id,
					name: razon.name,
				} as RazonType;
			});
			setRazones(razonesType);
		}
	} catch (error) {
		console.log('Error fetching razones:', error);
	}
};