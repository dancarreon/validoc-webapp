import {NewProps, PageNewTemplate} from "../../templates/PageNewTemplate.tsx";
import {createClient} from "../../../api/clients-api.ts";
import {Client, ClientType, CreateClientSchema} from "../../../api/types/client-types.ts";

const newProps = {
	title: 'Nuevo Client',
	createRecord: createClient,
	createZodSchema: CreateClientSchema,
	objectInstance: new Client({}),
} as NewProps<ClientType>

export const NewClient = () => {
	return (
		<PageNewTemplate props={newProps}/>
	)
}
