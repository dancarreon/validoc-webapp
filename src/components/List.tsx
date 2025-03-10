import {StatusType, UserType} from "../api/types/user-types.ts";
import {UserListIcon} from "./icons/UserListIcon.tsx";
import {PdfIcon} from "./icons/PDFIcon.tsx";
import {useNavigate} from "react-router";
import {TrackType} from "../api/types/traza-types.ts";

export const List = ({elements, isUser = false}: { elements: UserType[] | TrackType[], isUser: boolean }) => {

    const navigate = useNavigate();

    let isAdmin = false;

    if (window.location.pathname.includes("admin")) {
        isAdmin = true;
    }

    const path: string = isAdmin ? "/admin" : "/user";

    const handleClick = (element: UserType | TrackType) => {
        if ('username' in element) {
            navigate(path + '/usuario/' + element.id);
        } else {
            navigate(path + '/traza/' + element.id);
        }
    }

    return (
        <>
            {elements && elements.length > 0 ? (
                <ul className="list shadow-md w-[100%]">
                    {elements.map(element => (
                        <li className='list-row items-center rounded-none hover:bg-black cursor-pointer z-10'
                            key={element.id}
                            onClick={() => handleClick(element)}>
                            {isUser ? (<UserListIcon/>) : <PdfIcon/>}
                            <div className='text-m content-center'>
                                <div
                                    className='text-left'>{"username" in element ? element.username : element.name}</div>
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
