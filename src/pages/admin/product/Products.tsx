import {PageListTemplate, PageProps} from "../../templates/PageListTemplate.tsx";
import {ModelType} from "../../../api/types/model-types.ts";
import {SubHeaderProps} from "../../../components/SubHeader.tsx";
import {getAllProducts, getTotalProducts} from "../../../api/product-api.ts";
import {ProductType} from "../../../api/types/product-types.ts";
import {ListType} from "../../../components/List.tsx";

const pageProps = {
    title: 'Productos',
    isUser: false,
    newRecordPath: '/admin/nuevo-producto',
    listType: {model: ModelType.PRODUCT, elements: []} as ListType<ProductType>,
    subheaderProps: [
        {title: 'ID', dbProperty: 'idProducto', sort: 'asc'},
        {title: 'Nombre', dbProperty: 'name', sort: 'asc'},
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
