import {NewProps, PageNewTemplate} from "../../templates/PageNewTemplate.tsx";
import {createSolicitante} from "../../../api/solicitante-api.ts";
import {Solicitante, SolicitanteSchema, SolicitanteType} from "../../../api/types/solicitante-types.ts";

const newProps = {
	title: 'Nuevo Solicitante',
	createRecord: createSolicitante,
	createZodSchema: SolicitanteSchema,
	objectInstance: new Solicitante({}),
} as NewProps<SolicitanteType>

export const NewSolicitante = () => {
	return (
		<PageNewTemplate props={newProps}/>
	)
}
