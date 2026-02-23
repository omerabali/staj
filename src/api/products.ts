import type { RawProduct } from '../types/product';
import productsData from '../data/products.json';

// In-memory array'i kopyalıyoruz, böylece "düzenleme" çalıştığında değişiklikleri simüle edebiliriz.
let mockDatabase: RawProduct[] = [...productsData] as RawProduct[];

const DELAY_MS = 800; // API simülasyonu için 800ms bekleme süresi

// Sadece HAM veriyi döneceğiz. Normalizasyon kısmını UI (React Query) tetikleyecek.
export const getProducts = async (): Promise<RawProduct[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...mockDatabase]);
        }, DELAY_MS);
    });
};

export const getProductById = async (id: string): Promise<RawProduct | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const product = mockDatabase.find((p) => p.id === id);
            resolve(product);
        }, DELAY_MS);
    });
};

export const updateProduct = async (id: string, updates: Partial<RawProduct>): Promise<RawProduct> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockDatabase.findIndex((p) => p.id === id);
            if (index === -1) {
                reject(new Error(`Product with ${id} not found.`));
                return;
            }

            // Mevcut verinin üstüne yeni gelen verileri yazıyoruz.
            const updatedProduct: RawProduct = {
                ...mockDatabase[index],
                ...updates,
            };

            mockDatabase[index] = updatedProduct;
            resolve(updatedProduct);
        }, DELAY_MS);
    });
};
