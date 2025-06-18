import {UpdateTadSchema, UpdateTadType} from "../../../api/types/tad-types.ts";
import {getTad, updateTad} from "../../../api/tads-api.ts";
import {InfoProps, PageInfoTemplate} from "../../templates/PageInfoTemplate.tsx";
import {useEffect, useState} from "react";
import {getAllStates, getTotalStates} from "../../../api/states-api.ts";
import {DropdownElement} from "../../../components/CustomDropdown.tsx";

const infoProps = {
    getRecord: getTad,
    updateRecord: updateTad,
    updateZodSchema: UpdateTadSchema,
} as InfoProps<UpdateTadType>;

export const TadInfo = () => {

    //TODO : Make this block of code reusable
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

    infoProps.lists = states;

    return (
        <PageInfoTemplate props={infoProps}/>
    );
};
