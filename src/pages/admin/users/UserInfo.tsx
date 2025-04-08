import {Header} from "../../../components/Header.tsx";
import {TextInput} from "../../../components/TextInput.tsx";
import {Button} from "../../../components/Button.tsx";
import {Container} from "../../../components/Container.tsx";
import {StatusType, UpdateUserSchema, UpdateUserType} from "../../../api/types/user-types.ts";
import {ChangeEvent, useEffect, useState} from "react";
import {getUser, updateUser} from "../../../api/users-api.ts";
import {useParams} from "react-router";
import {CheckInput} from "../../../components/CheckInput.tsx";
import {Alert} from "../../../components/Alert.tsx";
import {Spinner} from "../../../components/Spinner.tsx";
import {Toast} from "../../../components/Toast.tsx";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

export const UserInfo = () => {

    const [show, setShow] = useState(false)
    const [showErrors, setShowErrors] = useState(false)
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(true);

    const params = useParams();

    const [user, setUser] = useState<UpdateUserType>({} as UpdateUserType);

    const {
        register,
        handleSubmit,
        setValue,
        formState: {errors},
    } = useForm<UpdateUserType>({
        resolver: zodResolver(UpdateUserSchema),
    });

    let errorMap: (string | undefined)[] = [];

    const onSubmit: SubmitHandler<UpdateUserType> = async (user: UpdateUserType) => {
        setIsLoading(true);
        const updatedUser = await updateUser(params.id!, user);

        if (updatedUser) {
            setShow(true);
            setMessage('Usuario actualizado exitosamente')
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
        setUser({...user, [e.target.name]: e.target.value});
    }

    const handleClick = () => {
        if (Object.keys(errors).length > 0) {
            setShowErrors(true);
            setTimeout(function () {
                setShowErrors(false);
                errorMap = [];
            }, 5000);
        }
    }

    const handleReset = () => {
        console.log('test');
    }

    if (errors) {
        for (const key in errors) {
            errorMap.push(errors[key as keyof UpdateUserType]!.message);
        }
    }

    useEffect(() => {
        async function fetchUser() {
            const user = await getUser(String(params.id));
            if (user) {
                setUser(user);
                setIsLoading(false);

                setValue('username', user.username);
                setValue('name', user.name);
                setValue('lastName', user.lastName);
                setValue('email', user.email);
                setValue('phone', user.phone);
                setValue('status', user.status);
            }
        }

        fetchUser().catch(console.error);
    }, [params.id, setValue]);

    const isActive: boolean = user.status === StatusType.ACTIVE.valueOf();

    return (
        <div className='h-[100%] content-center mt-3'>
            {params.id !== '' ? (
                <Container>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Header title={user.username}>
                            <CheckInput label='Activo' name='status' checked={isActive} onChange={handleChange}/>
                        </Header>
                        <div className='mt-5'>
                            <TextInput placeholder='Usuario' {...register('username')}/>
                            <TextInput placeholder='Nombre del Usuario' {...register('name')}/>
                            <TextInput placeholder='Apellido del Usuario' {...register('lastName')}/>
                            <TextInput placeholder='Email' {...register('email')}/>
                            <TextInput placeholder='Teléfono' {...register('phone')}/>
                            {isLoading ? (<Spinner styles='m-auto pb-10.5 grid'/>) : (
                                <>
                                    <Button type='submit' label='Guardar' onClick={handleClick}/>
                                    <Button type='button' label='Reestablecer Constraseña'
                                            styles={'bg-black text-md ml-6'} onClick={handleReset}/>
                                </>
                            )}
                        </div>
                    </form>
                </Container>
            ) : (
                isLoading
                    ? (
                        <Spinner styles='m-auto pb-10.5 grid'/>
                    )
                    : (
                        <Container>
                            <Header title='No se encontró el usuario'/>
                        </Container>
                    )
            )}
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
