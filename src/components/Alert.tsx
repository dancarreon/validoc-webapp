export const Alert = ({message}: { message: string }) => {
    return (
        <div className="toast toast-top toast-start show-alert z-100">
            <div className="alert alert-info text-xl text-white bg-[#EC3113] border-none">
                <span>{message}</span>
            </div>
        </div>
    )
}
