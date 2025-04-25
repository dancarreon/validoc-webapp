import {Header} from "../../components/Header.tsx";
import {TextInput} from "../../components/TextInput.tsx";
import {Button} from "../../components/Button.tsx";
import {Container} from "../../components/Container.tsx";
import {Steps} from "../../components/Steps.tsx";
import {Dice} from "../../components/icons/Dice.tsx";
import {ButtonWithIcon} from "../../components/ButtonWithIcon.tsx";
import {useState} from "react";
import {getRandomTransportista} from "../../api/transportistas-api.ts";

export const Stamps = () => {

    const [transportista, setTransportista] = useState<string>('');
    const [operador, setOperador] = useState<string>('');
    const [dayHour, setDayHour] = useState<string>('');
    const [sellos, setSellos] = useState<string[]>(['', '', '', '']);

    const generaOperadores = async () => {
        const randomTransportista = await getRandomTransportista()
        if (randomTransportista) {
            setTransportista(randomTransportista.name + ' ' + randomTransportista.lastName);
        }

        const randomOperador = await getRandomTransportista()
        if (randomOperador) {
            setOperador(randomOperador.name + ' ' + randomOperador.lastName);
        }
    }

    function getDayHour() {
        const now: Date = new Date();
        setDayHour(now.toLocaleString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }));
    }

    function generaSellos() {
        setSellos([]);
        const randomSello = getRandomArbitrary(100000, 999999).toFixed(0);
        for (let i = 0; i < 4; i++) {
            setSellos(prev => [...prev, (randomSello + i).toString()]);
        }
    }

    function getRandomArbitrary(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    function setSellosManual(e: React.ChangeEvent<HTMLInputElement>) {
        const sellosManual: string[] = sellos;
        for (let i = 0; i < 4; i++) {
            if (e.target.name.includes('s1a1')) {
                sellosManual[0] = e.target.value;
            } else if (e.target.name.includes('s2a1')) {
                sellosManual[1] = e.target.value;
            } else if (e.target.name.includes('s1a2')) {
                sellosManual[2] = e.target.value;
            } else if (e.target.name.includes('s2a2')) {
                sellosManual[3] = e.target.value;
            }
        }
        setSellos(sellosManual);
    }

    return (
        <div className='h-[100%] content-center mt-3'>
            <Container>
                <Steps step={2}/>
                <Header title='Sellos'/>
                <div className='flex justify-between pt-5 px-4'>
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
                <form onSubmit={e => e.preventDefault()} className='mt-0'>
                    <TextInput type='text' placeholder='Sello 1 Autotanque 1' name='s1a1' value={sellos[0]}
                               onChange={e => setSellosManual(e)}/>
                    <TextInput type='text' placeholder='Sello 2 Autotanque 1' name='s2a1' value={sellos[1]}
                               onChange={e => setSellosManual(e)}/>
                    <TextInput type='text' placeholder='Sello 1 Autotanque 2' name='s1a2' value={sellos[2]}
                               onChange={e => setSellosManual(e)}/>
                    <TextInput type='text' placeholder='Sello 2 Autotanque 2' name='s2a2' value={sellos[3]}
                               onChange={e => setSellosManual(e)}/>
                    <TextInput type='text' placeholder='Nombre Transportista' name='nombreTransportista'
                               value={transportista}
                               onChange={e => setTransportista(e.target.value)}/>
                    <TextInput type='text' placeholder='Nombre Operador TRV' name='nombreOperador' value={operador}
                               onChange={e => setOperador(e.target.value)}/>
                    <TextInput type='text' placeholder='Fecha y Hora PEMEX' name='fechaHoraPemex' value={dayHour}
                               onChange={e => setDayHour(e.target.value)}/>
                    <TextInput type='text' placeholder='Fecha Trasvase MGC' name='fechaHoraTrasvase' value={dayHour}
                               onChange={e => setDayHour(e.target.value)}/>
                    <Button label='Guardar'/>
                </form>
            </Container>
        </div>
    )
}
