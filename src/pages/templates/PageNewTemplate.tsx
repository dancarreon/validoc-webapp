import {Container} from "../../components/Container.tsx";
import {Header} from "../../components/Header.tsx";
import {CheckInput} from "../../components/CheckInput.tsx";
import {TextInput} from "../../components/TextInput.tsx";
import {Spinner} from "../../components/Spinner.tsx";
import {Button} from "../../components/Button.tsx";
import {Toast} from "../../components/Toast.tsx";
import {Alert} from "../../components/Alert.tsx";
import {Path, PathValue, SubmitHandler, useForm} from "react-hook-form";
import {ChangeEvent, useEffect, useState} from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {ZodType} from "zod";
import {useNavigate} from "react-router";
import {StatusType} from "../../api/types/status-type.ts";
import {DropdownSearch, DropdownElement} from "../../components/DropdownSearch.tsx";

export type NewProps<T> = {
	title: string;
	createRecord: (record: T) => Promise<T>;
	createZodSchema: ZodType;
	objectInstance: object;
	lists?: DropdownElement[];
};

export const PageNewTemplate = <T extends object>({props}: { props: NewProps<T> }) => {

	const [show, setShow] = useState(false)
	const [showErrors, setShowErrors] = useState(false)
	const [message, setMessage] = useState('')
	const [form, setForm] = useState<T>({} as T);
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		formState: {errors},
		setValue,
		watch,
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

	const handleReset = () => {
		navigate(-1);
	}

	if (errors) {
		for (const key in errors) {
			errorMap.push((errors[key as keyof T] as { message?: string })?.message);
		}
	}

	useEffect(() => {
		if (props.objectInstance) {
			for (const key in props.objectInstance) {
				if ('status' in props.objectInstance && key === 'status') {
					setValue(key as Path<T>, (
							props.objectInstance[key] === StatusType.ACTIVE.valueOf()
								? StatusType.ACTIVE.valueOf()
								: StatusType.INACTIVE.valueOf()
						) as PathValue<T, Path<T>>
					);
				}
			}
		}
	})

	return (
		<div className='h-[100%] content-center mt-3 w-full rounded-t'>
			<Container>
				<form onSubmit={handleSubmit(onSubmit)} className='w-full'>
					<Header title={props.title}>
						<CheckInput label='Activo' name='status' onChange={handleChange}/>
					</Header>
					<div className='mt-10'>
						{
							Object.keys(props.objectInstance).map((key) => {
								if (key !== 'status') {
									if (key.includes('Id')) {
										return (
											<DropdownSearch key={key}
															options={props.lists || []}
															placeholder={key}
															value={watch(key as Path<T>)}
															{...register(key as Path<T>)}
															onChange={(value: string) => setValue(key as Path<T>, value as PathValue<T, Path<T>>)}/>
										)
									} else {
										return (
											<TextInput key={key} placeholder={key} {...register(key as Path<T>)}/>
										)
									}
								}
							})
						}
						{
							isLoading
								? (<Spinner styles='m-auto pb-10.5 grid'/>)
								: <>
									<Button type={'submit'} label='Guardar' onClick={handleClick}/>
									<Button type='reset' label='Cancelar' onClick={handleReset}
											styles={'bg-black text-md ml-6'}/>
								</>
						}
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
