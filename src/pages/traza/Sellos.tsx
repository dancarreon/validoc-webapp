import {Header} from "../../components/Header.tsx";
import {TextInput} from "../../components/TextInput.tsx";
import {Button} from "../../components/Button.tsx";
import {Container} from "../../components/Container.tsx";
import {Steps} from "../../components/Steps.tsx";
import {Dice} from "../../components/icons/Dice.tsx";
import {ButtonWithIcon} from "../../components/ButtonWithIcon.tsx";
import {getRandomTransportista} from "../../api/transportistas-api.ts";
import {Path, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {TrazaSchema, TrazaType, UpdateTrazaType} from "../../api/types/traza-types.ts";
import {getTraza, updateTraza} from "../../api/trazas-api.ts";
import {useEffect, useState} from "react";
import {Spinner} from "../../components/Spinner.tsx";
import {Toast} from "../../components/Toast.tsx";
import {Alert} from "../../components/Alert.tsx";
import {useNavigate, useParams} from "react-router";

export const Sellos = () => {

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

    const generaOperadores = async () => {
        const randomTransportista = await getRandomTransportista()
        if (randomTransportista) {
            setValue('nombreTransportista', randomTransportista.name + ' ' + randomTransportista.lastName);
        }

        const randomOperador = await getRandomTransportista()
        if (randomOperador) {
            setValue('nombreOperador', randomOperador.name + ' ' + randomOperador.lastName);
        }
    }

    function getDayHour() {
        const now: Date = new Date();
        const nowLocale = now.toLocaleString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
        setValue('fechaHoraPemex', nowLocale);
        setValue('fechaHoraTrasvase', nowLocale);
    }

    function generaSellos() {
        const randomSello = getRandomArbitrary(100000, 999999).toFixed(0);
        setValue('sello1Autotanque1', randomSello.toString());
        setValue('sello2Autotanque1', (parseInt(randomSello) + 1).toString());
        setValue('sello1Autotanque2', (parseInt(randomSello) + 2).toString());
        setValue('sello2Autotanque2', (parseInt(randomSello) + 3).toString());
    }

    function getRandomArbitrary(min: number, max: number) {
        return Math.random() * (max - min) + min;
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
            const traza: TrazaType = await getTraza(String(params.id));
            if (traza) {
                setTraza(traza);

                const keys: string[] = Object.keys(traza);
                for (const key of keys) {
                    setValue(key as Path<TrazaType>, traza[key as keyof UpdateTrazaType]);
                }
            }
            setIsLoading(false);
        }

        fetchTraza().catch(console.error);
    }, [params.id, setValue]);

    return (
        <div className='h-[100%] content-center mt-3'>
            <Container>
                <Steps step={2} trazaId={params.id}/>
                <Header title='Sellos'/>
                <div className='grid justify-center content-around h-40 pt-2 md:flex md:justify-between md:pt-5 md:px-4 md:h-15'>
                    <ButtonWithIcon styles='bg-black' title='Sellos' placeholder='Genera sellos aleatorios'
                                    onClick={generaSellos}>
                        <Dice/>
                    </ButtonWithIcon>
                    <ButtonWithIcon styles='bg-black flex' title='Operadores' placeholder='Genera operadores aleatorios'
                                    onClick={generaOperadores}>
                        <Dice/>
                    </ButtonWithIcon>
                    <ButtonWithIcon styles='bg-black flex' title='Fecha y Hora' placeholder='Genera fecha y hora'
                                    onClick={getDayHour}>
                        <Dice/>
                    </ButtonWithIcon>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className='mt-5 w-full'>
                    <TextInput type='text' placeholder='Sello 1 Autotanque 1'
                               {...register('sello1Autotanque1')}/>
                    <TextInput type='text' placeholder='Sello 2 Autotanque 1'
                               {...register('sello2Autotanque1')}/>
                    <TextInput type='text' placeholder='Sello 1 Autotanque 2'
                               {...register('sello1Autotanque2')}/>
                    <TextInput type='text' placeholder='Sello 2 Autotanque 2'
                               {...register('sello2Autotanque2')}/>
                    <TextInput type='text' placeholder='Nombre Transportista'
                               {...register('nombreTransportista')}/>
                    <TextInput type='text' placeholder='Nombre Operador TRV'
                               {...register('nombreOperador')}/>
                    <TextInput type='text' placeholder='Fecha y Hora PEMEX'
                               {...register('fechaHoraPemex')}/>
                    <TextInput type='text' placeholder='Fecha Trasvase MGC'
                               {...register('fechaHoraTrasvase')}/>
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
