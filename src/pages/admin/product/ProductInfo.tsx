import React from 'react'
import {InfoProps, PageInfoTemplate} from "../../templates/PageInfoTemplate.tsx";
import {getProduct, updateProduct} from "../../../api/product-api.ts";
import {UpdateProductSchema, UpdateProductType} from "../../../api/types/product-types.ts";

const infoProps = {
    getRecord: getProduct,
    updateRecord: updateProduct,
    updateZodSchema: UpdateProductSchema,
} as InfoProps<UpdateProductType>

export const ProductInfo = () => {
    return (
        <PageInfoTemplate props={infoProps}/>
    )
}
