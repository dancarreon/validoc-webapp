import {Header} from "../../../components/Header.tsx";
import {TextInput} from "../../../components/TextInput.tsx";
import {Button} from "../../../components/Button.tsx";
import {Container} from "../../../components/Container.tsx";
import {UpdateClaveSchema, UpdateClaveType} from "../../../api/types/clave-types.ts";
import {ChangeEvent, useEffect, useState} from "react";
import {getClave, updateClave} from "../../../api/claves-api.ts";
import {useParams} from "react-router";
import {Alert} from "../../../components/Alert.tsx";
import {Spinner} from "../../../components/Spinner.tsx";
import {Toast} from "../../../components/Toast.tsx";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {CheckInput} from "../../../components/CheckInput.tsx";
import {StatusType} from "../../../api/types/user-types.ts";

export const ClaveInfo = () => {
    const [show, setShow] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const params = useParams();
    const [clave, setClave] = useState<UpdateClaveType>({} as UpdateClaveType);

    const {
        register,
        handleSubmit,
        setValue,
        formState: {errors},
    } = useForm<UpdateClaveType>({
        resolver: zodResolver(UpdateClaveSchema),
    });

    let errorMap: (string | undefined)[] = [];

    const onSubmit: SubmitHandler<UpdateClaveType> = async (clave: UpdateClaveType) => {
        setIsLoading(true);
        const updatedClave = await updateClave(params.id!, clave);

        if (updatedClave) {
            setShow(true);
            setMessage('Clave actualizada exitosamente');
            setTimeout(() => {
                setShow(false);
            }, 5000);
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setClave({...clave, [e.target.name]: e.target.value});
    };

    const handleClick = () => {
        if (Object.keys(errors).length > 0) {
            setShowErrors(true);
            setTimeout(() => {
                setShowErrors(false);
                errorMap = [];
            }, 5000);
        }
    };

    if (errors) {
        for (const key in errors) {
            errorMap.push(errors[key as keyof UpdateClaveType]!.message);
        }
    }

    useEffect(() => {
        async function fetchClave() {
            const clave = await getClave(String(params.id));
            if (clave) {
                setClave(clave);
                setIsLoading(false);

                setValue('clave', clave.clave);
                setValue('name', clave.name);
            }
        }

        fetchClave().catch(console.error);
    }, [params.id, setValue]);

    const isActive: boolean = clave.status === StatusType.ACTIVE.valueOf();

    return (
        <div className='h-[100%] content-center mt-3'>
            {params.id !== '' ? (
                <Container>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Header title={clave.name}>
                            <CheckInput label='Activo' name='status' checked={isActive} onChange={handleChange}/>
                        </Header>
                        <div className='mt-5'>
                            <TextInput placeholder='Clave' {...register('clave')} />
                            <TextInput placeholder='Name' {...register('name')} />
                            {isLoading ? (
                                <Spinner styles='m-auto pb-10.5 grid'/>
                            ) : (
                                <Button type='submit' label='Guardar' onClick={handleClick}/>
                            )}
                        </div>
                    </form>
                </Container>
            ) : (
                isLoading ? (
                    <Spinner styles='m-auto pb-10.5 grid'/>
                ) : (
                    <Container>
                        <Header title='No se encontró la Clave'/>
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
    );
};
