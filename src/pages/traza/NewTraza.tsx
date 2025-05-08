import {Container} from "../../components/Container.tsx";
import {TextInput} from "../../components/TextInput.tsx";
import {Button} from "../../components/Button.tsx";
import {Steps} from "../../components/Steps.tsx";
import {Header} from "../../components/Header.tsx";
import {Dropdown, DropdownElement} from "../../components/Dropdown.tsx";
import {useEffect, useState} from "react";
import {getAllTads, getTotalTads, PAGE_SIZE} from "../../api/tads-api.ts";
import {getAllClaves, getTotalClaves} from "../../api/claves-api.ts";
import {getAllRazones, getTotalRazones} from "../../api/razones-api.ts";
import {getAllProducts, getTotalProducts} from "../../api/product-api.ts";
import {Path, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {TrazaSchema, TrazaType} from "../../api/types/traza-types.ts";
import {Toast} from "../../components/Toast.tsx";
import {Alert} from "../../components/Alert.tsx";
import {Spinner} from "../../components/Spinner.tsx";
import {useNavigate, useParams} from "react-router";
import {createTraza, getTraza, updateTraza} from "../../api/trazas-api.ts";

export const NewTraza = () => {

    const [show, setShow] = useState(false)
    const [showErrors, setShowErrors] = useState(false)
    const [message, setMessage] = useState('')
    const [tads, setTads] = useState<DropdownElement[]>([]);
    const [claves, setClaves] = useState<DropdownElement[]>([]);
    const [razones, setRazones] = useState<DropdownElement[]>([]);
    const [productos, setProductos] = useState<DropdownElement[]>([]);
    const [totalLitros, setTotalLitros] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [traza, setTraza] = useState<TrazaType | null>(null);
    const navigate = useNavigate();
    const params = useParams();

    let isAdmin = false;

    if (window.location.pathname.includes("admin")) {
        isAdmin = true;
    }

    const path: string = isAdmin ? "/admin" : "/user";

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: {errors},
    } = useForm({
        resolver: zodResolver(TrazaSchema),
    });

    const cap1 = watch('capAutotanque1');
    const cap2 = watch('capAutotanque2');
    const cap3 = watch('capAutotanque3');

    const onSubmit: SubmitHandler<TrazaType> = async (recordData: TrazaType) => {
        if (traza === null) {
            setIsLoading(true);
            const newRecord: TrazaType = await createTraza(recordData);

            if (newRecord) {
                setTraza(newRecord);
                setShow(true);
                setMessage('Nueva Traza creada exitosamente')
                setTimeout(function () {
                    setShow(false);
                }, 5000);
            }
            setIsLoading(false);

            navigate(path + `/traza/${newRecord.id}`);
        } else {
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

    // TODO : abstract these methods since all of them are similar
    const fetchTads = async () => {
        const total = await getTotalTads();
        const tads = await getAllTads(0, total >= 10 ? total : PAGE_SIZE);

        if (tads) {
            const dropdownTads = tads.map((tad) => {
                return {
                    id: tad.id,
                    name: tad.ciudad + ' - ' + tad.estado?.name,
                } as DropdownElement;
            });
            setTads(dropdownTads);
        }
    }

    const fetchClaves = async () => {
        const total = await getTotalClaves();
        const claves = await getAllClaves(0, total >= 10 ? total : PAGE_SIZE);

        if (claves) {
            const dropdownClaves = claves.map((clave) => {
                return {
                    id: clave.id,
                    name: clave.clave + ' - ' + clave.name,
                } as DropdownElement;
            });
            setClaves(dropdownClaves);
        }
    }

    const fetchRazones = async () => {
        const total = await getTotalRazones();
        const razones = await getAllRazones(0, total >= 10 ? total : PAGE_SIZE);

        if (razones) {
            const dropdownRazones = razones.map((razon) => {
                return {
                    id: razon.id,
                    name: razon.name,
                } as DropdownElement;
            });
            setRazones(dropdownRazones);
        }
    }

    const fetchProductos = async () => {
        const total = await getTotalProducts();
        const productos = await getAllProducts(0, total >= 10 ? total : PAGE_SIZE);

        if (productos) {
            const dropdownProducts = productos.map((producto) => {
                return {
                    id: producto.id,
                    name: producto.clave + ' - ' + producto.descripcion,
                } as DropdownElement;
            });
            setProductos(dropdownProducts);
        }
    }

    let errorMap: (string | undefined)[] = [];

    if (errors) {
        for (const key in errors) {
            errorMap.push((errors[key as keyof TrazaType] as { message?: string })?.message);
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

    useEffect(() => {
        async function fetchTraza() {
            if (params.id) {
                setIsLoading(true);
                const traza = await getTraza(params.id);
                setTraza(traza);

                const keys: string[] = Object.keys(traza);
                for (const key of keys) {
                    setValue(key as Path<TrazaType>, traza[key as keyof TrazaType]);
                }
                setIsLoading(false);
            }
        }

        function calcTotal() {
            let total = 0;

            if (!isNaN(parseFloat(cap1))) {
                total += parseFloat(cap1);
            }
            if (!isNaN(parseFloat(cap2))) {
                total += parseFloat(cap2);
            }
            if (!isNaN(parseFloat(cap3))) {
                total += parseFloat(cap3);
            }

            setTotalLitros(Number(total.toFixed(2)));
        }

        calcTotal();

        fetchTads();
        fetchClaves();
        fetchRazones();
        fetchProductos();

        setTimeout(function () {
            if (params.id && traza === null) {
                fetchTraza();
            }
        }, 100);

    }, [cap1, cap2, cap3, params.id, setValue, traza]);

    return (
        <div className='h-[100%] content-center mt-3'>
            <Container>
                <div className='bg-[#3F3F3F] rounded-t-lg mb-0'>
                    <Steps step={1} trazaId={params.id}/>
                    <Header title='Datos Nacional'/>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className='mt-5'>
                    <Dropdown elements={tads} placeholder='TAD Dirección'
                              {...register('tadDireccionId')}/>
                    <Dropdown elements={claves} placeholder='Clave Concentradora'
                              {...register('claveConcentradoraId')}/>
                    <Dropdown elements={razones} placeholder='Razón Social Comercial'
                              {...register('razonSocialComercialId')}/>
                    <Dropdown elements={productos} placeholder='Producto'
                              {...register('productoId')}/>
                    <TextInput type='text' placeholder='Cap. Autotanque 1'
                               {...register('capAutotanque1')}/>
                    <TextInput type='text' placeholder='Cap. Autotanque 2'
                               {...register('capAutotanque2')}/>
                    <TextInput type='text' placeholder='Cap. Autotanque 3'
                               {...register('capAutotanque3')}/>
                    <TextInput type='text' placeholder='Litros Totales' value={String(totalLitros)} readOnly={true}
                               {...register('litrosTotales')}/>
                    <TextInput type='text' placeholder='Precio/Lt Cliente'
                               {...register('precioLitro')}/>
                    <TextInput type='text' placeholder='Destino Mun/Estado'
                               {...register('destino')}/>
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
