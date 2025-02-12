export const TextInput = ({type, name, placeholder, value}: {
    type: string,
    name?: string,
    placeholder: string,
    value?: string
}) => {
    return (
        <input type={type} name={name} placeholder={placeholder} value={value}
               className="input w-83 sm:w-83 rounded-full my-2 py-6 bg-white placeholder:text-[#BFBFBF] text-black text-lg "/>
    )
}
