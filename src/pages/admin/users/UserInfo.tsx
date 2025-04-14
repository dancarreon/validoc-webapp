import {UpdateUserSchema, UpdateUserType} from "../../../api/types/user-types.ts";
import {getUser, updateUser} from "../../../api/users-api.ts";
import {InfoProps, PageInfoTemplate} from "../../templates/PageInfoTemplate.tsx";

const infoProps = {
    getRecord: getUser,
    updateRecord: updateUser,
    updateZodSchema: UpdateUserSchema,
} as InfoProps<UpdateUserType>;

export const UserInfo = () => {
    return (
        <PageInfoTemplate props={infoProps}/>
    )
}
