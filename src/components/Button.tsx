export const Button = ({type, label, styles}: {
    type?: 'submit' | 'button' | 'reset' | undefined,
    label: string,
    styles?: string
}) => {
    return (
        <button type={type}
                className={'btn w-83 sm:w-90 bg-[#EC3113] flex-auto text-lg rounded-full my-2 py-7 ' + styles}>
            {label}
        </button>
    )
}
