import {InfoProps, PageInfoTemplate} from "../../templates/PageInfoTemplate.tsx";
import {getSolicitante, updateSolicitante} from "../../../api/solicitante-api.ts";
import {UpdateSolicitanteSchema, UpdateSolicitanteType} from "../../../api/types/solicitante-types.ts";

const infoProps = {
	getRecord: getSolicitante,
	updateRecord: updateSolicitante,
	updateZodSchema: UpdateSolicitanteSchema,
} as InfoProps<UpdateSolicitanteType>;

export const SolicitanteInfo = () => {
	return (
		<PageInfoTemplate props={infoProps}/>
	)
}
