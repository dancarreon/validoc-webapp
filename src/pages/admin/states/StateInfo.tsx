import {Header} from "../../../components/Header.tsx";
import {TextInput} from "../../../components/TextInput.tsx";
import {Button} from "../../../components/Button.tsx";
import {Container} from "../../../components/Container.tsx";
import {ChangeEvent, useEffect, useState} from "react";
import {useParams} from "react-router";
import {CheckInput} from "../../../components/CheckInput.tsx";
import {Alert} from "../../../components/Alert.tsx";
import {Spinner} from "../../../components/Spinner.tsx";
import {Toast} from "../../../components/Toast.tsx";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {UpdateStateSchema, UpdateStateType} from "../../../api/types/state-types.ts";
import {getState, updateState} from "../../../api/states-api.ts";
import {StatusType} from "../../../api/types/user-types.ts";

export const StateInfo = () => {

    const [show, setShow] = useState(false)
    const [showErrors, setShowErrors] = useState(false)
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(true);

    const params = useParams();

    const [state, setState] = useState<UpdateStateType>({
        name: '',
        status: StatusType.ACTIVE,
        createdAt: '',
        updatedAt: '',
    } as UpdateStateType);

    const {
        register,
        handleSubmit,
        setValue,
        formState: {errors},
    } = useForm<UpdateStateType>({
        resolver: zodResolver(UpdateStateSchema),
    });

    let errorMap: (string | undefined)[] = [];

    const onSubmit: SubmitHandler<UpdateStateType> = async (state: UpdateStateType) => {
        setIsLoading(true);
        const updatedState = await updateState(params.id!, state);

        if (updatedState) {
            setShow(true);
            setMessage('Estado actualizado exitosamente')
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
        setState({...state, [e.target.name]: e.target.value});
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

    if (errors) {
        for (const key in errors) {
            errorMap.push(errors[key as keyof UpdateStateType]!.message);
        }
    }

    useEffect(() => {
        async function fetchUser() {
            const state = await getState(String(params.id));
            if (state) {
                setState(state);
                setIsLoading(false);

                setValue('name', state.name);
                setValue('status', state.status);
            }
        }

        fetchUser().catch(console.error);
    }, [params.id, setValue]);

    const isActive: boolean = state.status === StatusType.ACTIVE.valueOf();

    return (
        <div className='h-[100%] content-center mt-3'>
            {params.id !== '' ? (
                <Container>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Header title={state.name}>
                            <CheckInput label='Activo' name='status' checked={isActive} onChange={handleChange}/>
                        </Header>
                        <div className='mt-5'>
                            <TextInput placeholder='Nombre' {...register('name')}/>
                            {isLoading ? (<Spinner styles='m-auto pb-10.5 grid'/>) : (
                                <Button type='submit' label='Guardar' onClick={handleClick}/>
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
                            <Header title='No se encontró el Estado'/>
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
