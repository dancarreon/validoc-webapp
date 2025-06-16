import {Header} from "../../components/Header.tsx";
import {TextInput} from "../../components/TextInput.tsx";
import {Button} from "../../components/Button.tsx";
import {Container} from "../../components/Container.tsx";
import {Steps} from "../../components/Steps.tsx";
import {useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {TrazaSchema, TrazaType, UpdateTrazaType} from "../../api/types/traza-types.ts";
import {Path, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {getTraza, updateTraza} from "../../api/trazas-api.ts";
import {Spinner} from "../../components/Spinner.tsx";
import {Toast} from "../../components/Toast.tsx";
import {Alert} from "../../components/Alert.tsx";

export const Placas = () => {

    const [show, setShow] = useState(false)
    const [showErrors, setShowErrors] = useState(false)
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false);
    const [traza, setTraza] = useState<TrazaType | null>(null);
    const navigate = useNavigate();

    const params = useParams();

    const {
        register,
        handleSubmit,
        setValue,
        formState: {errors},
    } = useForm({
        resolver: zodResolver(TrazaSchema),
    });

    const onSubmit: SubmitHandler<TrazaType> = async (recordData: TrazaType) => {
        if (traza !== null) {
            setIsLoading(true);

            const updatedRecord: TrazaType = await updateTraza(traza.id, recordData);

            if (updatedRecord) {
                setTraza(updatedRecord);
                setShow(true);
                setMessage('Traza actualizada exitosamente')
                setTimeout(function () {
                    setShow(false);
                }, 5000);
            }
            setIsLoading(false);
        }
    }

    const handleClick = () => {
        setShowErrors(true);
        setTimeout(function () {
            setShowErrors(false);
            errorMap = [];
        }, 5000);
    }

    const handleReset = () => {
        navigate(-1);
    }

    let errorMap: (string | undefined)[] = [];

    if (errors) {
        for (const key in errors) {
            errorMap.push((errors[key as keyof TrazaType] as { message?: string })?.message);
        }
    }

    useEffect(() => {
        async function fetchTraza() {
            setIsLoading(true);
            const trazaFound: TrazaType = await getTraza(String(params.id));
            if (trazaFound) {
                setTraza(trazaFound);

                const keys: string[] = Object.keys(trazaFound);

                for (const key of keys) {
                    setValue(key as Path<TrazaType>, trazaFound[key as keyof UpdateTrazaType]);
                }
            }
            setIsLoading(false);
        }

        fetchTraza().catch(console.error);
    }, [params.id, setValue]);

    return (
        <div className='h-[100%] content-center mt-3'>
            <Container>
                <Steps step={4} trazaId={params.id}/>
                <Header title='Placas'/>
                <form onSubmit={handleSubmit(onSubmit)} className='mt-5 w-full'>
                    <TextInput type='text' placeholder='Número de Tractor'
                               {...register('numeroTractor')}/>
                    <TextInput type='text' placeholder='Placas Tractor'
                               {...register('placasTractor')}/>
                    <TextInput type='text' placeholder='Autotanque 1'
                               {...register('autotanque1')}/>
                    <TextInput type='text' placeholder='Placas Autotanque 1'
                               {...register('placasAutotanque1')}/>
                    <TextInput type='text' placeholder='Autotanque 2'
                               {...register('autotanque2')}/>
                    <TextInput type='text' placeholder='Placas Autotanque 2'
                               {...register('placasAutotanque2')}/>
                    <TextInput type='text' placeholder='Autotanque 3'
                               {...register('autotanque3')}/>
                    <TextInput type='text' placeholder='Placas Autotanque 3'
                               {...register('placasAutotanque3')}/>
                    {
                        isLoading
                            ? (<Spinner styles='m-auto pb-10.5 grid'/>)
                            : <>
                                <Button type={'submit'} label='Guardar' onClick={handleClick}/>
                                <Button type='reset' label='Cancelar' onClick={handleReset}
                                        styles={'bg-black text-md ml-6'}/>
                            </>
                    }
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
