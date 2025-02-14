export const Pagination = ({currentPage = 1}: { currentPage: number }) => {

    const pages = [1, 2, 3, 4, 5, 6];

    return (
        <div className="join mb-3">
            {pages.map((page: number, index: number) => (
                <input className={'join-item btn btn-square ' + (index == 0 ? 'rounded-l-xl' : '') + (index == pages.length - 1 ? 'rounded-r-xl' : '')} type="radio"
                       name="options" aria-label={String(page)}
                       checked={currentPage == page}/>
            ))}
        </div>
    )
}
