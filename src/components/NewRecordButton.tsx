import {NewRecordIcon} from "./icons/NewRecordIcon.tsx";

export const NewRecordButton = ({path}: { path: string }) => {
    return (
        <button className='btn bg-black border-black float-right rounded-lg h-[35px] w-[51.3px] mr-3.5 px-[10px] shadow-none'>
            <a href={path}>
                <NewRecordIcon/>
            </a>
        </button>
    )
}
