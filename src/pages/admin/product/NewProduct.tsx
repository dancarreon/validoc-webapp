import {NewProps, PageNewTemplate} from "../../templates/PageNewTemplate.tsx";
import {createProduct} from "../../../api/product-api.ts";
import {CreateProductSchema, Product, ProductType} from "../../../api/types/product-types.ts";

const newProps = {
    title: 'Nuevo Producto',
    createRecord: createProduct,
    createZodSchema: CreateProductSchema,
    objectInstance: new Product({}),
} as NewProps<ProductType>

export const NewProduct = () => {
    return (
        <PageNewTemplate props={newProps}/>
    )
}
