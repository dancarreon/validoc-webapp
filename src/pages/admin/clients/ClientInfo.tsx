import {InfoProps, PageInfoTemplate} from "../../templates/PageInfoTemplate.tsx";
import {getClient, updateClient} from "../../../api/clients-api.ts";
import {UpdateClientSchema, UpdateClientType} from "../../../api/types/client-types.ts";

const infoProps = {
	getRecord: getClient,
	updateRecord: updateClient,
	updateZodSchema: UpdateClientSchema,
} as InfoProps<UpdateClientType>

export const ClientInfo = () => {
	return (
		<PageInfoTemplate props={infoProps}/>
	)
}
