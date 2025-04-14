import {Container} from "../../components/Container.tsx";
import {Header} from "../../components/Header.tsx";
import {CheckInput} from "../../components/CheckInput.tsx";
import {TextInput} from "../../components/TextInput.tsx";
import {Spinner} from "../../components/Spinner.tsx";
import {Button} from "../../components/Button.tsx";
import {Toast} from "../../components/Toast.tsx";
import {Alert} from "../../components/Alert.tsx";
import {Path, SubmitHandler, useForm} from "react-hook-form";
import {ChangeEvent, useState} from "react";
import {StatusType} from "../../api/types/user-types.ts";
import {zodResolver} from "@hookform/resolvers/zod";
import {record, ZodType} from "zod";

export type NewProps<T> = {
    createRecord: (record: T) => Promise<T>;
    createZodSchema: ZodType;
};

export const PageNewTemplate = <T extends object>({props}: { props: NewProps<T> }) => {

    const [show, setShow] = useState(false)
    const [showErrors, setShowErrors] = useState(false)
    const [message, setMessage] = useState('')
    const [form, setForm] = useState<T>({} as T);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<T>({
        resolver: zodResolver(props.createZodSchema),
    });

    let errorMap: (string | undefined)[] = [];

    const onSubmit: SubmitHandler<T> = async (recordData: T) => {

        setIsLoading(true);
        const newRecord: T = await props.createRecord(recordData);

        if (newRecord) {
            setShow(true);
            setMessage('Nuevo Registro creado exitosamente')
            setTimeout(function () {
                setShow(false);
            }, 5000);
        }
        setIsLoading(false);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.name === 'status') {
            e.target.value = (e.target.checked ? StatusType.ACTIVE.valueOf() : StatusType.INACTIVE.valueOf());
        }
        setForm({...form, [e.target.name]: e.target.value as string});
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
            errorMap.push((errors[key as keyof T] as { message?: string })?.message);
        }
    }

    /* TODO: find how to extract properties from Interface or Type
    type properties = Array<keyof T>;
    const properties: properties = Object.keys(record) as properties;

    const keys: string[] = Object.keys(newRecord);
    for (const key of keys) {
        console.log(newRecord);
        console.log(key);
    }
    */

    return (
        <div className='h-[100%] content-center mt-3'>
            <Container>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Header title='Nuevo Usuario'>
                        <CheckInput label='Activo' name='status' onChange={handleChange}/>
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
                        {isLoading ? (<Spinner styles='m-auto pb-10.5 grid'/>) :
                            <Button type={'submit'} label='Guardar' onClick={handleClick}/>}
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
