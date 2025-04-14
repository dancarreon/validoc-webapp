import {NewProps, PageNewTemplate} from "../../templates/PageNewTemplate.tsx";
import {createUser} from "../../../api/users-api.ts";
import {User, UserSchema, UserType} from "../../../api/types/user-types.ts";

const newProps = {
    title: 'Nuevo Usuario',
    createRecord: createUser,
    createZodSchema: UserSchema,
    objectInstance: new User({}),
} as NewProps<UserType>

export const NewUser = () => {
    return (
        <PageNewTemplate props={newProps}/>
    )
}
