import {MouseEventHandler} from "react";

export const Pagination = ({currentPage, pageSize, totalRecords, onClick}: {
    currentPage: number,
    pageSize: number,
    totalRecords: number,
    onClick: MouseEventHandler,
}) => {

    const totalPages = Math.ceil(totalRecords / pageSize);

    return (
        <div className="join mb-3">
            {[...Array(totalPages).keys()].map((page: number, index: number) => (
                <input
                    className={'join-item btn btn-square ' + (index == 0 ? 'rounded-l-xl' : '') + (index == totalPages - 1 ? 'rounded-r-xl' : '')}
                    type="radio"
                    name="options" aria-label={String(page + 1)}
                    checked={(currentPage + 1) == (page + 1)}
                    readOnly={true}
                    key={page}
                    value={page}
                    onClick={onClick}
                />
            ))}
        </div>
    )
}
