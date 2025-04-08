import {StatusType, UserType} from "../api/types/user-types.ts";
import {UserListIcon} from "./icons/UserListIcon.tsx";
import {PdfIcon} from "./icons/PDFIcon.tsx";
import {useNavigate} from "react-router";
import {TrackType} from "../api/types/traza-types.ts";
import {StateType} from "../api/types/state-types.ts";
import {TadType} from "../api/types/tad-types.ts";

export type ListType = {
    model: string;
    elements: UserType[] | TrackType[] | StateType[] | TadType[];
}

export const List = ({elements, isUser = false}: { elements: ListType, isUser: boolean }) => {

    const navigate = useNavigate();

    let isAdmin = false;

    if (window.location.pathname.includes("admin")) {
        isAdmin = true;
    }

    const handleClick = (model: string, element: UserType | TrackType | StateType | TadType) => {
        const path: string = isAdmin ? "/admin" : "/user";

        if (model === 'user') {
            navigate(path + '/usuario/' + element.id);
        } else if (model === 'track') {
            navigate(path + '/traza/' + element.id);
        } else if (model === 'states') {
            navigate(path + '/estados/' + element.id);
        } else if (model === 'tad') {
            navigate(path + '/tads/' + element.id);
        } else if (model === 'clave') {
            navigate(path + '/claves/' + element.id);
        }
    }

    function getLabel(model: string, element: UserType | TrackType | StateType | TadType): string | undefined {
        if (model === 'user' && "username" in element) {
            return element.username
        } else if (model === 'tad' && "ciudad" in element) {
            return element.ciudad
        } else {
            return "name" in element ? element.name : '' as string;
        }
    }

    return (
        <>
            {elements && elements.elements && elements.elements.length > 0 ? (
                <ul className="list shadow-md w-[100%]">
                    {elements.elements.map(element => (
                        <li className='list-row items-center rounded-none hover:bg-black cursor-pointer z-10'
                            key={element.id}
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
                                   checked={element.status === StatusType.ACTIVE.valueOf()}
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
