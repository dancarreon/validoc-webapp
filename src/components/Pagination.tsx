export const Pagination = ({currentPage = 1}: { currentPage: number }) => {

    const pages = [1, 2, 3, 4, 5, 6];

    return (
        <div className="join mb-3">
            {pages.map((page) => (
                <input className="join-item btn btn-square" type="radio" name="options" aria-label={String(page)}
                       checked={currentPage == page}/>
            ))}
        </div>
    )
}
