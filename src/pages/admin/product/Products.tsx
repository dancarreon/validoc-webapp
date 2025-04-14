import {PageListTemplate, PageProps} from "../../templates/PageListTemplate.tsx";
import {ListType} from "../../../components/List.tsx";
import {ModelType} from "../../../api/types/model-types.ts";
import {SubHeaderProps} from "../../../components/SubHeader.tsx";
import {getAllProducts, getTotalProducts} from "../../../api/product-api.ts";
import {ProductType} from "../../../api/types/product-types.ts";

const listType: ListType<ProductType> = {model: ModelType.PRODUCT, elements: []};

const pageProps = {
    title: 'Productos',
    isUser: false,
    newRecordPath: '/admin/nuevo-producto',
    listType: listType,
    subheaderProps: [
        {title: 'Clave', dbProperty: 'clave', sort: 'asc'},
        {title: 'Status', dbProperty: 'status', sort: 'asc'}
    ] as SubHeaderProps[],
    searchApi: getAllProducts,
    getTotalApi: getTotalProducts,
    getAllApi: getAllProducts,
} as PageProps<ProductType>;

export const Products = () => {
    return (
        <PageListTemplate props={pageProps}/>
    )
}
