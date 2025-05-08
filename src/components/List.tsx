import {UserType} from "../api/types/user-types.ts";
import {useNavigate} from "react-router";
import {TrazaType} from "../api/types/traza-types.ts";
import {StateType} from "../api/types/state-types.ts";
import {TadType} from "../api/types/tad-types.ts";
import {ModelType} from "../api/types/model-types.ts";
import {ProductType} from "../api/types/product-types.ts";
import {ClaveType} from "../api/types/clave-types.ts";
import {TransportistaType} from "../api/types/transportista-types.ts";
import {StatusType} from "../api/types/status-type.ts";
import {FileIcon} from "./icons/FileIcon.tsx";

export type ListType<T> = {
    model: ModelType;
    elements: UserType[] | TrazaType[] | StateType[] | TadType[] | ProductType[] | ClaveType[] | TransportistaType[] | T[];
}

export const List = <T extends object>({elements, cols = 2}: {
    elements: ListType<T>,
    cols?: number
}) => {

    const navigate = useNavigate();

    let isAdmin = false;

    if (window.location.pathname.includes("admin")) {
        isAdmin = true;
    }

    const handleClick = (model: string, element: T | UserType | TrazaType | StateType | TadType | ProductType | ClaveType | TransportistaType) => {
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
            } else if (model === ModelType.TRANSPORTISTA) {
                navigate(path + '/transportistas/' + element.id);
            }
        }
    }

    function getLabel(model: string, element: T | UserType | TrazaType | StateType | TadType | ProductType | ClaveType | TransportistaType): string {
        if (model === ModelType.USER && "username" in element) {
            return element.username;
        } else if (model === ModelType.TAD && "ciudad" in element) {
            return element.ciudad;
        } else if (model === ModelType.CLAVE && "clave" in element) {
            return element.clave;
        } else if (model === ModelType.PRODUCT && "clave" in element) {
            return element.clave;
        } else {
            return "name" in element && typeof element.name === "string" ? element.name : "";
        }
    }

    function getNextLabel(element: T | UserType | TrazaType | StateType | TadType | ProductType | ClaveType | TransportistaType): string {
        if ("estado" in element) {
            return element.estado?.name as string;
        } else if ("lastName" in element) {
            return element.lastName as string;
        } else if ("descripcion" in element) {
            return element.descripcion as string;
        } else if ("name" in element) {
            return element.name as string;
        }
        return '';
    }

    return (
        <>
            {elements && elements.elements && elements.elements.length > 0 ? (
                <ul className="list shadow-md w-[100%]">
                    {elements.elements.map(element => (
                        <li className={'list-row items-center rounded-none hover:bg-black cursor-pointer grid-cols-' + cols + ' flex justify-stretch'}
                            key={"id" in element ? element.id : ''}
                            onClick={() => handleClick(elements.model, element)}>
                            <div className='inline-flex items-center w-full'>
                                <div className='w-fit'>
                                    <FileIcon/>
                                </div>
                                <div className='ml-3 text-left'>
                                    {
                                        getLabel != null
                                            ? getLabel(elements.model, element)
                                            : ''
                                    }
                                </div>
                            </div>
                            {
                                cols > 2
                                    ?
                                    <div className='text-m content-center w-full'>
                                        <div className='text-left'>
                                            {getNextLabel(element)}
                                        </div>
                                    </div>
                                    : ''
                            }
                            {
                                'status' in element
                                    ?
                                    <div className='text-right w-full'>
                                        <input type="checkbox"
                                               readOnly={true}
                                               checked={"status" in element ? element.status === StatusType.ACTIVE.valueOf() : undefined}
                                               className='checkbox border-white checkbox-md checked:text-[#EC3113]'/>
                                    </div>
                                    : ''
                            }
                        </li>
                    ))}
                </ul>
            ) : (
                <div className='mt-5 mb-1'>No existen registros</div>
            )}
        </>
    )
}
