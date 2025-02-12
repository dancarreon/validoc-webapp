import {PdfIcon} from "./icons/PDFIcon.tsx";
import {TrazaType, User} from "../api/types/types.tsx";

export const List = ({elements}: { elements: User[] | TrazaType[] }) => {
    return (
        <>
            {elements.length > 0 ? (
                <ul className="list shadow-md">
                    {elements.map(element => (
                        <li className='list-row items-center rounded-none hover:bg-black' key={element.id}>
                            <PdfIcon/>
                            <div className='text-m content-center'>
                                <div className='text-left'>{element.nombre}</div>
                            </div>
                            <input type="checkbox" checked={element.active} readOnly
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
