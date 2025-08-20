import {Container} from "../../components/Container.tsx";
import {Header} from "../../components/Header.tsx";
import {Spinner} from "../../components/Spinner.tsx";
import {Toast} from "../../components/Toast.tsx";
import {Alert} from "../../components/Alert.tsx";
import {ChangeEvent, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {Path, PathValue, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {ZodType} from "zod";
import {CheckInput} from "../../components/CheckInput.tsx";
import {TextInput} from "../../components/TextInput.tsx";
import {Button} from "../../components/Button.tsx";
import {StatusType} from "../../api/types/status-type.ts";
import {AreaText} from "../../components/AreaText.tsx";
import {DropdownSearch, DropdownElement} from "../../components/DropdownSearch.tsx";

export type InfoProps<T> = {
    getRecord: (recordId: string) => Promise<T>;
    updateRecord: (recordId: string, record: T) => Promise<T>;
    updateZodSchema: ZodType;
    lists?: DropdownElement[];
};

export const PageInfoTemplate = <T extends object>({props}: { props: InfoProps<T> }) => {

    const {
        register,
        handleSubmit,
        setValue,
        formState: {errors},
        watch,
    } = useForm<T>({
        resolver: zodResolver(props.updateZodSchema),
    });

    const [show, setShow] = useState(false)
    const [showErrors, setShowErrors] = useState(false)
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(true);

    const params = useParams();
    const navigate = useNavigate();

    const [record, setRecord] = useState<T>({} as T);
    const [isActive, setIsActive] = useState(false);

    let errorMap: (string | undefined)[] = [];

    const onSubmit: SubmitHandler<T> = async (record: T) => {
        setIsLoading(true);
        const updatedRecord = await props.updateRecord(params.id!, record);

        if (updatedRecord) {
            setShow(true);
            setMessage('Registro actualizado exitosamente')
            setTimeout(function () {
                setShow(false);
            }, 5000);
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    };

    const handleStatus = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.name === 'status') {
            e.target.value = (e.target.checked ? StatusType.ACTIVE.valueOf() : StatusType.INACTIVE.valueOf());
            setValue('status' as Path<T>, e.target.value as PathValue<T, Path<T>>);
            setIsActive(e.target.checked);
        }
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
        navigate(-1);
    }

    if (errors) {
        for (const key in errors) {
            errorMap.push((errors[key as keyof T] as { message?: string })?.message);
        }
    }

    useEffect(() => {
        async function fetchRecord() {
            setIsLoading(true);
            const record: T = await props.getRecord(String(params.id));
            if (record) {
                setRecord(record);

                if ("status" in record) {
                    setIsActive(record.status === StatusType.ACTIVE.valueOf());
                }

                const keys: string[] = Object.keys(record);

                console.log(Object.keys(record));

                for (const key of keys) {
                    setValue(key as Path<T>, record[key as keyof T] as PathValue<T, Path<T>>);
                }
                setIsLoading(false);
            }
        }

        fetchRecord().catch(console.error);
    }, [params.id, props, setValue]);

    return (
        <div className='h-[100%] content-center mt-3 w-full'>
            {params.id !== '' ? (
                <Container>
                    <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
                        <Header title={"name" in record ? (record.name as string | undefined) : ''}>
                            <CheckInput label='Activo' name='status' checked={isActive} onChange={handleStatus}/>
                        </Header>
                        <div className='mt-10'>
                            {
                                Object.keys(record).map((key) => {
                                    if (key === 'id') {
                                        return (
                                            <TextInput type='hidden' key={key}
                                                       placeholder={key} {...register(key as Path<T>)}/>
                                        )
                                    } else if (key.includes('Id')) {
                                        return (
                                            <DropdownSearch
                                                key={key}
                                                placeholder={key}
                                                value={watch(key as Path<T>)}
                                                onChange={(value) => setValue(key as Path<T>, value as PathValue<T, Path<T>>)}
                                                options={props.lists || []}
                                            />
                                        )
                                    } else if (key === 'direccion') {
                                        return (
                                            <AreaText key={key} placeholder={key} {...register(key as Path<T>)}/>
                                        )
                                    } else if (key === 'generated') {
                                        return (
                                            <CheckInput label={'Auto-generado'} name={key} checked={true}
                                                        style='text-right pr-4 -mt-[10]'/>
                                        )
                                    } else if (key !== 'status' && key !== 'id') {
                                        return (
                                            <TextInput key={key}
                                                       placeholder={key} {...register(key as Path<T>)}/>
                                        )
                                    }
                                })
                            }
                            {isLoading ? (<Spinner styles='m-auto pb-10.5 grid'/>) : (
                                <div className='my-3'>
                                    <Button type='submit' label='Guardar' onClick={handleClick}/>
                                    <Button type='reset' label='Cancelar' onClick={handleReset}
                                            styles={'bg-black text-md ml-6'}/>
                                </div>
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
                            <Header title='No se encontró el registro'/>
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
