import {NewProps, PageNewTemplate} from "../../templates/PageNewTemplate.tsx";
import {createConsecutivo} from "../../../api/consecutivo-api.ts";
import {Consecutivo, ConsecutivoSchema, ConsecutivoType} from "../../../api/types/consecutivo-types.ts";

const newProps = {
	title: 'Nuevo Consecutivo',
	createRecord: createConsecutivo,
	createZodSchema: ConsecutivoSchema,
	objectInstance: new Consecutivo({}),
} as NewProps<ConsecutivoType>

export const NewConsecutivo = () => {
	return (
		<PageNewTemplate props={newProps}/>
	)
}
