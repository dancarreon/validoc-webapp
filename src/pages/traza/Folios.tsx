import {Header} from "../../components/Header.tsx";
import {TextInput} from "../../components/TextInput.tsx";
import {Button} from "../../components/Button.tsx";
import {Container} from "../../components/Container.tsx";
import {Steps} from "../../components/Steps.tsx";
import {useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {TrazaSchema, TrazaType, UpdateTrazaType} from "../../api/types/traza-types.ts";
import {getTraza, updateTraza} from "../../api/trazas-api.ts";
import {Path, SubmitHandler, useForm} from "react-hook-form";
import {Spinner} from "../../components/Spinner.tsx";
import {Toast} from "../../components/Toast.tsx";
import {Alert} from "../../components/Alert.tsx";
import {zodResolver} from "@hookform/resolvers/zod";
import {ButtonWithIcon} from "../../components/ButtonWithIcon.tsx";
import {Dice} from "../../components/icons/Dice.tsx";

export const Folios = () => {

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

    function generaFolioFiscal(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

        // Define the pattern for the license key parts
        const pattern = [8, 4, 4, 4, 12];

        const parts = pattern.map(length => {
            let part = '';
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * chars.length);
                part += chars[randomIndex];
            }
            return part;
        });

        return parts.join('-');
    }

    function generaFoliosAleatorios() {
        if (traza?.capAutotanque1 ?? 0 > 0) {
            setValue('folioFiscalPemex1', generaFolioFiscal());
        }
        if (traza?.capAutotanque2 ?? 0 > 0) {
            console.log(traza?.capAutotanque2);
            setValue('folioFiscalPemex2', generaFolioFiscal());
        }
        if (traza?.capAutotanque3 ?? 0 > 0) {
            setValue('folioFiscalPemex3', generaFolioFiscal());
        }
        setValue('folioFiscalRemisionNacional', generaFolioFiscal());
    }

    useEffect(() => {
        async function fetchTraza() {
            setIsLoading(true);
            const trazaFound: TrazaType = await getTraza(String(params.id));
            if (trazaFound) {
                setTraza(trazaFound);

                const keys: string[] = Object.keys(trazaFound);

                for (const key of keys) {
                    if (key === 'folioPemex1' && trazaFound['sello1Autotanque1'] !== null) {
                        setValue('folioPemex1', trazaFound['sello1Autotanque1']);
                    } else if (key === 'folioPemex2') {
                        setValue('folioPemex2', trazaFound['sello2Autotanque2']);
                    } else if (key === 'folioPemex3') {
                        setValue('folioPemex3', trazaFound['sello1Autotanque1']);
                    } else if (key === 'folioRemisionNacional' && trazaFound['sello1Autotanque1'] !== null) {
                        setValue('folioRemisionNacional', trazaFound['sello1Autotanque1']);
                    } else if (key === 'folioTrasvase' && trazaFound['sello1Autotanque1'] !== null) {
                        setValue('folioTrasvase', trazaFound['sello1Autotanque1']);
                    } else {
                        setValue(key as Path<TrazaType>, trazaFound[key as keyof UpdateTrazaType]);
                    }
                }
            }
            setIsLoading(false);
        }

        fetchTraza().catch(console.error);
    }, [params.id, setValue]);

    return (
        <div className='h-[100%] content-center mt-3'>
            <Container>
                <Steps step={3} trazaId={params.id}/>
                <Header title='Folios'/>
                <div className='flex justify-between pt-5 px-4'>
                    <ButtonWithIcon styles='bg-black' title='Folios Fiscales' placeholder='Genera Folios aleatorios'
                                    onClick={generaFoliosAleatorios}>
                        <Dice/>
                    </ButtonWithIcon>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className='mt-5'>
                    <TextInput type='text' placeholder='Folio PEMEX 1'
                               {...register('folioPemex1')}/>
                    <TextInput type='text' placeholder='Folio PEMEX 2'
                               {...register('folioPemex2')}/>
                    <TextInput type='text' placeholder='Folio PEMEX 3'
                               {...register('folioPemex3')}/>
                    <TextInput type='text' placeholder='Folio Fiscal PEMEX 1'
                               {...register('folioFiscalPemex1')}/>
                    <TextInput type='text' placeholder='Folio Fiscal PEMEX 2'
                               {...register('folioFiscalPemex2')}/>
                    <TextInput type='text' placeholder='Folio Fiscal PEMEX 3'
                               {...register('folioFiscalPemex3')}/>
                    <TextInput type='text' placeholder='Folio Remisión Nacional'
                               {...register('folioRemisionNacional')}/>
                    <TextInput type='text' placeholder='Folio Fiscal Remisión Nacional'
                               {...register('folioFiscalRemisionNacional')}/>
                    <TextInput type='text' placeholder='Folio Trasvase'
                               {...register('folioTrasvase')}/>
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
