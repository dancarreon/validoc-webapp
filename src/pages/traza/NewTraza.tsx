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

export const NewTraza = () => {

    const [tads, setTads] = useState<DropdownElement[]>([]);
    const [claves, setClaves] = useState<DropdownElement[]>([]);
    const [razones, setRazones] = useState<DropdownElement[]>([]);
    const [productos, setProductos] = useState<DropdownElement[]>([]);
    const [totalLitros, setTotalLitros] = useState<number>(0);
    const [cap1, setCap1] = useState<string>('');
    const [cap2, setCap2] = useState<string>('');
    const [cap3, setCap3] = useState<string>('');

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

    const calcLitros = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value) {
            if (e.target.name === 'cap1') {
                setCap1(value);
            } else if (e.target.name === 'cap2') {
                setCap2(value);
            } else if (e.target.name === 'cap3') {
                setCap3(value);
            }
        }
    }

    useEffect(() => {

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

        fetchTads();
        fetchClaves();
        fetchRazones();
        fetchProductos();
        calcTotal();

    }, [cap1, cap2, cap3]);

    return (
        <div className='h-[100%] content-center mt-3'>
            <Container>
                <div className='bg-[#3F3F3F] rounded-t-lg mb-0'>
                    <Steps step={1}/>
                    <Header title='Datos Nacional'/>
                </div>
                <form onSubmit={e => e.preventDefault()} className='mt-5'>
                    <Dropdown elements={tads} placeholder='TAD Dirección'/>
                    <Dropdown elements={claves} placeholder='Clave Concentradora'/>
                    <Dropdown elements={razones} placeholder='Razón Social Comercial'/>
                    <Dropdown elements={productos} placeholder='Producto'/>
                    <TextInput type='text' placeholder='Cap. Autotanque 1' onChange={calcLitros} value={String(cap1)}
                               name={'cap1'}/>
                    <TextInput type='text' placeholder='Cap. Autotanque 2' onChange={calcLitros} value={String(cap2)}
                               name={'cap2'}/>
                    <TextInput type='text' placeholder='Cap. Autotanque 3' onChange={calcLitros} value={String(cap3)}
                               name={'cap3'}/>
                    <TextInput type='text' placeholder='Litros Totales' value={String(totalLitros)} readOnly={true}/>
                    <TextInput type='text' placeholder='Precio/Lt Cliente' name='precioLitro'/>
                    <TextInput type='text' placeholder='Destino Mun/Estado' name='destino'/>
                    <Button label='Guardar'/>
                </form>
            </Container>
        </div>
    )
}
