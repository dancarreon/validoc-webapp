import {NewProps, PageNewTemplate} from "../../templates/PageNewTemplate.tsx";
import {createTad} from "../../../api/tads-api.ts";
import {Tad, TadSchema, TadType} from "../../../api/types/tad-types.ts";
import {useEffect, useState} from "react";
import {getAllStates, getTotalStates} from "../../../api/states-api.ts";
import {DropdownElement} from "../../../components/CustomDropdown.tsx";

const newProps = {
    title: 'Nuevo TAD',
    createRecord: createTad,
    createZodSchema: TadSchema,
    objectInstance: new Tad({}),
    lists: [],
} as NewProps<TadType>

export const NewTad = () => {

    const [states, setStates] = useState<DropdownElement[]>([]);

    const fetchStates = async () => {
        const total = await getTotalStates();
        const estados = await getAllStates(0, total);

        if (estados) {
            const dropdownStates = estados.map((estado) => {
                return {
                    id: estado.id,
                    name: estado.name,
                } as DropdownElement;
            });
            setStates(dropdownStates);
        }
    }

    useEffect(() => {
        fetchStates();
    }, []);

    newProps.lists = states;

    return (
        <PageNewTemplate props={newProps}/>
    )
}
