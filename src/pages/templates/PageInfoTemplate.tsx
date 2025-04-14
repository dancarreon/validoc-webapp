import {Container} from "../../components/Container.tsx";
import {Header} from "../../components/Header.tsx";
import {Spinner} from "../../components/Spinner.tsx";
import {Toast} from "../../components/Toast.tsx";
import {Alert} from "../../components/Alert.tsx";
import {ChangeEvent, useEffect, useState} from "react";
import {useParams} from "react-router";
import {StatusType} from "../../api/types/user-types.ts";
import {Path, PathValue, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {ZodType} from "zod";
import {CheckInput} from "../../components/CheckInput.tsx";
import {TextInput} from "../../components/TextInput.tsx";
import {Button} from "../../components/Button.tsx";

export type InfoProps<T> = {
    getRecord: (recordId: string) => Promise<T>;
    updateRecord: (recordId: string, record: T) => Promise<T>;
    updateZodSchema: ZodType;
};

export const PageInfoTemplate = <T extends object>({props}: { props: InfoProps<T> }) => {

    const [show, setShow] = useState(false)
    const [showErrors, setShowErrors] = useState(false)
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(true);

    const params = useParams();

    const [record, setRecord] = useState<T>({} as T);

    const {
        register,
        handleSubmit,
        setValue,
        formState: {errors},
    } = useForm<T>({
        resolver: zodResolver(props.updateZodSchema),
    });

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

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.name === 'status') {
            e.target.value = (e.target.checked ? StatusType.ACTIVE.valueOf() : StatusType.INACTIVE.valueOf());
        }
        setRecord({...record, [e.target.name]: e.target.value});
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
            errorMap.push((errors[key as keyof T] as { message?: string })?.message);
        }
    }

    useEffect(() => {
        async function fetchUser() {
            const record = await props.getRecord(String(params.id));
            if (record) {
                setRecord(record);
                setIsLoading(false);

                const keys: string[] = Object.keys(record);
                for (const key of keys) {
                    setValue(key as Path<T>, record[key as keyof T] as PathValue<T, Path<T>>);
                }
            }
        }

        fetchUser().catch(console.error);
    }, [params.id, setValue]);

    let isActive: boolean = false;
    if ("status" in record) {
        isActive = record.status === StatusType.ACTIVE.valueOf();
    }

    return (
        <div className='h-[100%] content-center mt-3'>
            {params.id !== '' ? (
                <Container>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Header title={"name" in record ? (record.name as string | undefined) : ''}>
                            <CheckInput label='Activo' name='status' checked={isActive} onChange={handleChange}/>
                        </Header>
                        <div className='mt-5'>
                            {
                                Object.keys(record).map((key) => {
                                    if (key !== 'status') {
                                        return (
                                            <TextInput key={key} placeholder={key} {...register(key as Path<T>)}/>
                                        )
                                    }
                                })
                            }
                            {isLoading ? (<Spinner styles='m-auto pb-10.5 grid'/>) : (
                                <>
                                    <Button type='submit' label='Guardar' onClick={handleClick}/>
                                    <Button type='reset' label='Cancelar' onClick={handleReset}
                                            styles={'bg-black text-md ml-6'}/>
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
