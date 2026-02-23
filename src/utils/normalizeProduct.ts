import type { RawProduct, Product, GlitchIssue } from '../types/product';

export function normalizeProduct(raw: RawProduct): Product {
    const issues: GlitchIssue[] = [];
    let score = 0;

    // 1. Name Normalization
    let name = raw.name;
    if (!name || typeof name !== 'string' || name.trim() === '') {
        name = 'Unknown Product';
        score += 20;
        issues.push({ field: 'name', message: 'Name is empty or invalid.' });
    }

    // 2. Price Normalization
    let price = 0;
    if (typeof raw.price === 'string') {
        // string -> replace comma with dot -> parse
        const parsedPrice = parseFloat(raw.price.replace(',', '.'));
        if (isNaN(parsedPrice)) {
            score += 30;
            issues.push({ field: 'price', message: `Could not parse price string: ${raw.price}` });
        } else {
            price = parsedPrice;
            score += 10; // minor penalty for string format
            issues.push({ field: 'price', message: 'Price was a string format instead of a number.' });
        }
    } else if (typeof raw.price === 'number') {
        price = raw.price;
    } else {
        score += 30;
        issues.push({ field: 'price', message: 'Price is missing or totally invalid.' });
    }

    // 3. Stock Normalization
    let stock = raw.stock;
    if (typeof stock !== 'number' || isNaN(stock)) {
        stock = 0;
        score += 20;
        issues.push({ field: 'stock', message: 'Stock is invalid.' });
    } else if (stock < 0) {
        stock = 0; // Negative stock means out of stock/invalid config
        score += 20;
        issues.push({ field: 'stock', message: 'Stock was negative.' });
    }

    // 4. Category Normalization
    let category = 'Uncategorized';
    if (Array.isArray(raw.category)) {
        category = raw.category.length > 0 ? raw.category[0] : 'Uncategorized';
        score += 10;
        issues.push({ field: 'category', message: 'Category was an array instead of a string.' });
    } else if (typeof raw.category === 'string') {
        category = raw.category;
    } else {
        score += 15;
        issues.push({ field: 'category', message: 'Category was null or invalid.' });
    }

    // 5. UpdatedAt Normalization
    let updatedAt: string | null = raw.updatedAt;
    const dateObj = new Date(raw.updatedAt);
    if (isNaN(dateObj.getTime())) {
        updatedAt = null; // or new Date().toISOString()
        score += 20;
        issues.push({ field: 'updatedAt', message: 'Date format is invalid.' });
    }

    // Bound the maximum score to 100
    const finalScore = Math.min(score, 100);

    return {
        id: raw.id,
        name,
        price,
        stock,
        category,
        updatedAt,
        glitchScore: finalScore,
        glitchReport: issues,
    };
}
