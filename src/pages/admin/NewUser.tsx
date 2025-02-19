import {Container} from "../../components/Container.tsx";
import {Header} from "../../components/Header.tsx";
import {TextInput} from "../../components/TextInput.tsx";
import {Button} from "../../components/Button.tsx";
import {CreateUserType} from "../../api/types/types.tsx";
import {ChangeEvent, FormEvent, useState} from "react";
import {createUser} from "../../api/users.ts";

export const NewUser = () => {

    const [userForm, setUserForm] = useState<CreateUserType>({
        username: '',
        password: '',
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setUserForm({...userForm, [e.target.name]: e.target.value});
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await createUser(userForm);
    }

    return (
        <div className='h-[100%] content-center mt-3'>
            <Container>
                <Header title='Nuevo Usuario'/>
                <form onSubmit={handleSubmit} className='mt-5'>
                    <TextInput type='text' name='username' placeholder='Usuario' onChange={handleChange}/>
                    <TextInput type='text' name='password' placeholder='Contraseña' onChange={handleChange}/>
                    <TextInput type='text' name='name' placeholder='Nombre del Usuario' onChange={handleChange}/>
                    <TextInput type='text' name='lastName' placeholder='Apellido del Usuario' onChange={handleChange}/>
                    <TextInput type='text' name='email' placeholder='Email' onChange={handleChange}/>
                    <TextInput type='text' name='phone' placeholder='Teléfono' onChange={handleChange}/>
                    <Button label='Guardar'/>
                </form>
            </Container>
        </div>
    )
}
