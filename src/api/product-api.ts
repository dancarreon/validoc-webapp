import {CreateProductType, ProductType, UpdateProductType} from "./types/product-types.ts";

const API_URL = import.meta.env.VITE_API_URL;
export const PAGE_SIZE = 10;

export const createProduct = async (product?: CreateProductType): Promise<ProductType> => {
    return await fetch(API_URL + '/productos', {
        method: "POST",
        body: JSON.stringify(product),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while creating product');
        return null;
    });
};

export const getAllProducts = async (page?: number, size?: number, search?: string | undefined, orderAndSort?: object[]): Promise<ProductType[]> => {
    const URI = `/productos`;
    const queryParams: string = `?page=${page ? page : 0}&size=${size ? size : PAGE_SIZE}&search=${search ? search : ''}&orderAndSort=${orderAndSort ? encodeURIComponent(JSON.stringify(orderAndSort)) : ''}`;

    return await fetch(API_URL + URI + queryParams, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while getting all products');
        return null;
    });
};

export const getTotalProducts = async (search?: string | undefined): Promise<number> => {
    return await fetch(API_URL + `/totals/productos${(search !== '' && search !== undefined) ? `?search=${search}` : ''}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while getting total products');
        return null;
    });
};

export const getProduct = async (productId: string): Promise<ProductType> => {
    return await fetch(API_URL + '/productos/' + productId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while getting product');
        return null;
    });
};

export const updateProduct = async (productId: string, product: UpdateProductType): Promise<ProductType> => {
    return await fetch(API_URL + '/productos/' + productId, {
        method: "PATCH",
        body: JSON.stringify(product),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log('An error occurred while updating product');
        return null;
    });
};
