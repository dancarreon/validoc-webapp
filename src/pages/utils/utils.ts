import {SubHeaderProps} from "../../components/SubHeader.tsx";

export const getOrderAndSort = (subheaderProps: SubHeaderProps[]): object[] => {
    const orderAndSort: object[] = [{}]
    subheaderProps.forEach((prop, index) => {
        orderAndSort[index] = {[prop.dbProperty]: prop.sort};
    });
    return orderAndSort;
}

/*
export const fetchDropdownRecords = async <T extends object>(
    {
        getTotalApi,
        getAllApi,
        id,
        name,
    }: {
        getTotalApi: (searchString?: string) => Promise<number>,
        getAllApi: (pageToGo?: number, PAGE_SIZE?: number, searchString?: string, orderAndSort?: object[]) => Promise<T[]>,
        id: string,
        name: string,
    }
) => {
    const total = await getTotalApi();
    const records = await getAllApi(0, total >= 10 ? total : PAGE_SIZE);

    if (records) {
        return records.map((record) => {
            return {
                id: (id in record) ? record[id] : record['id'],
                name: (name in record) ? record[name] : record['name'],
            } as DropdownElement;
        })
    }
}
*/
