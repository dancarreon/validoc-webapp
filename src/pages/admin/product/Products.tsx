import React from 'react'
import {PageListTemplate, PageProps} from "../../templates/PageListTemplate.tsx";
import {ListType} from "../../../components/List.tsx";
import {UserType} from "../../../api/types/user-types.ts";
import {ModelType} from "../../../api/types/model-types.ts";
import {SubHeaderProps} from "../../../components/SubHeader.tsx";
import {getAllProducts, getTotalProducts} from "../../../api/product-api.ts";

const listType: ListType<UserType> = {model: ModelType.PRODUCT, elements: []};

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
} as PageProps<UserType>;

export const Products = () => {
    return (
        <PageListTemplate props={pageProps}/>
    )
}
