import {SubHeaderProps} from "../../components/SubHeader.tsx";

export const getOrderAndSort = (subheaderProps: SubHeaderProps[]): object[] => {
    const orderAndSort: object[] = [{}]
    subheaderProps.forEach((prop, index) => {
        orderAndSort[index] = {[prop.dbProperty]: prop.sort};
    });
    return orderAndSort;
}
