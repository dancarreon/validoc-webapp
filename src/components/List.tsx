import {StatusType, UserType} from "../api/types/user-types.ts";
import {UserListIcon} from "./icons/UserListIcon.tsx";
import {PdfIcon} from "./icons/PDFIcon.tsx";
import {useNavigate} from "react-router";
import {TrackType} from "../api/types/traza-types.ts";
import {StateType} from "../api/types/state-types.ts";
import {TadType} from "../api/types/tad-types.ts";
import {ModelType} from "../api/types/model-types.ts";
import {ProductType} from "../api/types/product-types.ts";
import {ClaveType} from "../api/types/clave-types.ts";

export type ListType<T> = {
    model: ModelType;
    elements: UserType[] | TrackType[] | StateType[] | TadType[] | ProductType[] | ClaveType[] | T[];
}

export const List = <T extends object>({elements, isUser = false}: { elements: ListType<T>, isUser: boolean }) => {

    const navigate = useNavigate();

    let isAdmin = false;

    if (window.location.pathname.includes("admin")) {
        isAdmin = true;
    }

    const handleClick = (model: string, element: T | UserType | TrackType | StateType | TadType | ProductType | ClaveType) => {
        const path: string = isAdmin ? "/admin" : "/user";

        if ("id" in element) {
            if (model === ModelType.USER) {
                navigate(path + '/usuario/' + element.id);
            } else if (model === ModelType.TRACK) {
                navigate(path + '/traza/' + element.id);
            } else if (model === ModelType.STATES) {
                navigate(path + '/estados/' + element.id);
            } else if (model === ModelType.TAD) {
                navigate(path + '/tads/' + element.id);
            } else if (model === ModelType.CLAVE) {
                navigate(path + '/claves/' + element.id);
            } else if (model === ModelType.RAZON) {
                navigate(path + '/razones/' + element.id);
            } else if (model === ModelType.PRODUCT) {
                navigate(path + '/products/' + element.id);
            }

        }
    }

    function getLabel(model: string, element: T | UserType | TrackType | StateType | TadType | ProductType | ClaveType): string {
        if (model === ModelType.USER && "username" in element) {
            return element.username;
        } else if (model === ModelType.TAD && "ciudad" in element) {
            return element.ciudad;
        } else if (model === ModelType.CLAVE && "clave" in element) {
            return element.clave;
        } else if (model === ModelType.PRODUCT && "name" in element && typeof element.name === "string") {
            return element.name;
        } else {
            return "name" in element && typeof element.name === "string" ? element.name : "";
        }
    }

    return (
        <>
            {elements && elements.elements && elements.elements.length > 0 ? (
                <ul className="list shadow-md w-[100%]">
                    {elements.elements.map(element => (
                        <li className='list-row items-center rounded-none hover:bg-black cursor-pointer z-10'
                            key={"id" in element ? element.id : ''}
                            onClick={() => handleClick(elements.model, element)}>
                            {isUser ? (<UserListIcon/>) : <PdfIcon/>}
                            <div className='text-m content-center'>
                                <div
                                    className='text-left'>
                                    {getLabel(elements.model, element)}
                                </div>
                            </div>
                            <input type="checkbox"
                                   readOnly={true}
                                   checked={"status" in element ? element.status === StatusType.ACTIVE.valueOf() : undefined}
                                   className='checkbox border-white checkbox-md checked:text-[#EC3113]'/>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className='mt-5 mb-1'>No existen registros</div>
            )}
        </>
    )
}
