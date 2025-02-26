import {Header} from "../../components/Header.tsx";
import {TextInput} from "../../components/TextInput.tsx";
import {Button} from "../../components/Button.tsx";
import {Container} from "../../components/Container.tsx";
import {StatusType, UpdateUserType} from "../../api/types/user-types.ts";
import {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {getUser, updateUser} from "../../api/users.ts";
import {useParams} from "react-router";
import {CheckInput} from "../../components/CheckInput.tsx";
import {Alert} from "../../components/Alert.tsx";

export const UserInfo = () => {

    const [show, setShow] = useState(false)
    const [message, setMessage] = useState('')

    const params = useParams();

    const [user, setUser] = useState<UpdateUserType>({
        username: '',
        email: '',
        password: '',
        id: '',
        name: '',
        phone: '',
        phoneNumber: '',
        lastName: '',
        status: StatusType.INACTIVE,
    } as UpdateUserType);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.name === 'status') {
            e.target.value = (e.target.checked ? StatusType.ACTIVE.valueOf() : StatusType.INACTIVE.valueOf());
        }
        setUser({...user, [e.target.name]: e.target.value});
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const updatedUser = await updateUser(user);

        if (updatedUser) {
            setShow(true);
            setMessage('Usuario actualizado exitosamente')
            setTimeout(function () {
                setShow(false);
            }, 5000);
        }
    }

    useEffect(() => {
        async function fetchUser() {
            const response = await getUser(String(params.id));
            if (response) {
                setUser(response);
            }
        }

        fetchUser().catch(console.error);

    }, [params.id]);

    const isActive: boolean = user.status === StatusType.ACTIVE.valueOf();

    return (
        <div className='h-[100%] content-center mt-3'>
            {user.id !== '' ? (
                <Container>
                    <form onSubmit={handleSubmit}>
                        <Header title={user.username}>
                            <CheckInput label='Activo' name='status' checked={isActive} onChange={handleChange}/>
                        </Header>
                        <div className='mt-5'>
                            <TextInput type='text' name='username' placeholder='Usuario' onChange={handleChange}
                                       value={user.username}/>
                            <TextInput type='text' name='password' placeholder='Contraseña' onChange={handleChange}
                                       value={user.password}/>
                            <TextInput type='text' name='name' placeholder='Nombre del Usuario' onChange={handleChange}
                                       value={user.name}/>
                            <TextInput type='text' name='lastName' placeholder='Apellido del Usuario'
                                       onChange={handleChange}
                                       value={user.lastName}/>
                            <TextInput type='text' name='email' placeholder='Email' onChange={handleChange}
                                       value={user.email}/>
                            <TextInput type='text' name='phone' placeholder='Teléfono' onChange={handleChange}
                                       value={user.phone}/>
                            <Button label='Guardar'/>
                        </div>
                    </form>
                </Container>
            ) : (
                <Container>
                    <Header title='No se encontró el usuario'/>
                </Container>
            )}
            {show && <Alert message={message}/>}
        </div>
    )
}
