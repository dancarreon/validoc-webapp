import {Header} from "../../../components/Header.tsx";
import {TextInput} from "../../../components/TextInput.tsx";
import {Button} from "../../../components/Button.tsx";
import {Container} from "../../../components/Container.tsx";
import {UpdateTadSchema, UpdateTadType} from "../../../api/types/tad-types.ts";
import {ChangeEvent, useEffect, useState} from "react";
import {getTad, updateTad} from "../../../api/tads-api.ts";
import {useParams} from "react-router";
import {Alert} from "../../../components/Alert.tsx";
import {Spinner} from "../../../components/Spinner.tsx";
import {Toast} from "../../../components/Toast.tsx";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {CheckInput} from "../../../components/CheckInput.tsx";
import {StatusType} from "../../../api/types/user-types.ts";

export const TadInfo = () => {

    const [show, setShow] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const params = useParams();

    const [tad, setTad] = useState<UpdateTadType>({} as UpdateTadType);

    const {
        register,
        handleSubmit,
        setValue,
        formState: {errors},
    } = useForm<UpdateTadType>({
        resolver: zodResolver(UpdateTadSchema),
    });

    let errorMap: (string | undefined)[] = [];

    const onSubmit: SubmitHandler<UpdateTadType> = async (tad: UpdateTadType) => {
        setIsLoading(true);
        const updatedTad = await updateTad(params.id!, tad);

        if (updatedTad) {
            setShow(true);
            setMessage('Tad actualizado exitosamente');
            setTimeout(() => {
                setShow(false);
            }, 5000);
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTad({...tad, [e.target.name]: e.target.value});
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
            errorMap.push(errors[key as keyof UpdateTadType]!.message);
        }
    }

    useEffect(() => {
        async function fetchTad() {
            const tad = await getTad(String(params.id));
            if (tad) {
                setTad(tad);
                setIsLoading(false);

                setValue('ciudad', tad.ciudad);
                setValue('estadoId', tad.estadoId);
            }
        }

        fetchTad().catch(console.error);
    }, [params.id, setValue]);

    const isActive: boolean = tad.status === StatusType.ACTIVE.valueOf();

    return (
        <div className='h-[100%] content-center mt-3'>
            {params.id !== '' ? (
                <Container>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Header title={tad.ciudad}>
                            <CheckInput label='Activo' name='status' checked={isActive} onChange={handleChange}/>
                        </Header>
                        <div className='mt-5'>
                            <TextInput placeholder='Ciudad' {...register('ciudad')} />
                            <TextInput placeholder='Estado ID' {...register('estadoId')} />
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
                        <Header title='No se encontró el Tad'/>
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
