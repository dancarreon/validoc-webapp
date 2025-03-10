import {Container} from "../../components/Container.tsx";
import {Header} from "../../components/Header.tsx";
import {TextInput} from "../../components/TextInput.tsx";
import {Button} from "../../components/Button.tsx";
import {UserSchema, CreateUserType, StatusType, UserType} from "../../api/types/user-types.ts";
import {ChangeEvent, useState} from "react";
import {Alert} from "../../components/Alert.tsx";
import {Spinner} from "../../components/Spinner.tsx";
import {CheckInput} from "../../components/CheckInput.tsx";
import {SubmitHandler, useForm} from "react-hook-form";
import {createUser} from "../../api/users.ts";
import {zodResolver} from "@hookform/resolvers/zod";
import {Toast} from "../../components/Toast.tsx";

export const NewUser = () => {

    const [show, setShow] = useState(false)
    const [showErrors, setShowErrors] = useState(false)
    const [message, setMessage] = useState('')
    const [userForm, setUserForm] = useState<CreateUserType>({} as CreateUserType);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<CreateUserType>({
        resolver: zodResolver(UserSchema),
    });

    let errorMap: (string | undefined)[] = [];

    const onSubmit: SubmitHandler<CreateUserType> = async (userData: CreateUserType) => {

        setIsLoading(true);
        const newUser: UserType = await createUser(userData);

        if (newUser) {
            setShow(true);
            setMessage('Nuevo Usuario creado exitosamente')
            setTimeout(function () {
                setShow(false);
            }, 5000);
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.name === 'status') {
            e.target.value = (e.target.checked ? StatusType.ACTIVE.valueOf() : StatusType.INACTIVE.valueOf());
        }
        setUserForm({...userForm, [e.target.name]: e.target.value});
    }

    const handleClick = () => {
        setShowErrors(true);
        setTimeout(function () {
            setShowErrors(false);
            errorMap = [];
        }, 5000);
    }

    if (errors) {
        for (const key in errors) {
            errorMap.push(errors[key as keyof CreateUserType]!.message);
        }
    }

    return (
        <div className='h-[100%] content-center mt-3'>
            <Container>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Header title='Nuevo Usuario'>
                        <CheckInput label='Activo' name='status' onChange={handleChange}/>
                    </Header>
                    <div className='mt-5'>
                        <TextInput placeholder='Usuario' {...register('username')}/>
                        <TextInput placeholder='Contraseña' {...register('password')}/>
                        <TextInput placeholder='Nombre del Usuario' {...register('name')}/>
                        <TextInput placeholder='Apellido del Usuario' {...register('lastName')}/>
                        <TextInput placeholder='Email' {...register('email')}/>
                        <TextInput placeholder='Teléfono' {...register('phone')}/>
                        {isLoading ? (<Spinner styles='m-auto pb-10.5 grid'/>) :
                            <Button label='Guardar' onClick={handleClick}/>}
                    </div>
                </form>
            </Container>
            <Toast>
                {show && <Alert message={message}/>}
            </Toast>
            {showErrors && (
                <Toast>
                    {errorMap.length > 0 && errorMap.map((error, index) => (
                        <Alert message={error!} key={index}/>
                    ))}
                </Toast>
            )}
        </div>
    )
}
