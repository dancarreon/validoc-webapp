import {InfoProps, PageInfoTemplate} from "../../templates/PageInfoTemplate.tsx";
import {getConsecutivo, updateConsecutivo} from "../../../api/consecutivo-api.ts";
import {UpdateConsecutivoSchema, UpdateConsecutivoType} from "../../../api/types/consecutivo-types.ts";

const infoProps = {
	getRecord: getConsecutivo,
	updateRecord: updateConsecutivo,
	updateZodSchema: UpdateConsecutivoSchema,
} as InfoProps<UpdateConsecutivoType>;

export const ConsecutivoInfo = () => {
	return (
		<PageInfoTemplate props={infoProps}/>
	)
}
