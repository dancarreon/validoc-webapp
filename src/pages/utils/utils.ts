import {SubHeaderProps} from "../../components/SubHeader.tsx";

export const getOrderAndSort = (subheaderProps: SubHeaderProps[]): object[] => {
    const orderAndSort: object[] = [{}]
    subheaderProps.forEach((prop, index) => {
        orderAndSort[index] = {[prop.dbProperty]: prop.sort};
    });
    return orderAndSort;
}

/*export type FetchDropdownProps<T> = {
    getTotalApi: (searchString?: string) => Promise<number>,
    getAllApi: (pageToGo?: number, PAGE_SIZE?: number, searchString?: string, orderAndSort?: object[]) => Promise<T[]>,
}

export const fetchDropdownRecords = async <T extends object>(
    {props}: { props: FetchDropdownProps<T> }
): Promise<DropdownElement[]> => {
    const total = await props.getTotalApi();
    const records = await props.getAllApi(0, total >= 10 ? total : PAGE_SIZE);

    if (records && records.length > 0) {
        return records.map((record) => {
            return {
                id: ('id' in record) ? record.id : '',
                name: ('name' in record) ? record.name : '',
            } as DropdownElement;
        });
    }

    return [];
}*/
