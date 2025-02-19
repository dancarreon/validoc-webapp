import {StatusType, TrazaType, UserType} from "../api/types/types.tsx";
import {UserListIcon} from "./icons/UserListIcon.tsx";
import {PdfIcon} from "./icons/PDFIcon.tsx";

export const List = ({elements, isUser = false}: { elements: UserType[] | TrazaType[], isUser: boolean }) => {
    return (
        <>
            {elements.length > 0 ? (
                <ul className="list shadow-md w-[100%]">
                    {elements.map(element => (
                        <li className='list-row items-center rounded-none hover:bg-black cursor-pointer z-10'
                            key={element.id}>
                            {isUser ? (<UserListIcon/>) : <PdfIcon/>}
                            <div className='text-m content-center'>
                                <div className='text-left'>{"username" in element ? element.username : element.name}</div>
                            </div>
                            <input type="checkbox" checked={element.status === StatusType.ACTIVE.valueOf()}
                                   readOnly={true}
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
