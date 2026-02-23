import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../../api/products';
import { normalizeProduct } from '../../utils/normalizeProduct';
import { Link } from 'react-router-dom';

type SortColumn = 'name' | 'price' | 'glitchScore';
type SortDirection = 'asc' | 'desc';

export const ProductsTable = () => {
    // --- States for Filtering ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStockStatus, setFilterStockStatus] = useState('All'); // 'All' | 'in-stock' | 'out-of-stock'
    const [glitchOnly, setGlitchOnly] = useState(false);

    // --- States for Sorting ---
    const [sortCol, setSortCol] = useState<SortColumn>('name');
    const [sortDir, setSortDir] = useState<SortDirection>('asc');

    // --- States for Pagination ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Reset pagination to page 1 when any filter or sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterCategory, filterStockStatus, glitchOnly, sortCol, sortDir]);

    // --- React Query Fetch ---
    const { data: rawProducts = [], isLoading, isError } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });

    // --- Pipeline 1: Map and Normalize ---
    const normalizedProducts = rawProducts.map(normalizeProduct);

    // Extract unique categories for filter dropdown dynamically
    const categories = ['All', ...new Set(normalizedProducts.map((p) => p.category))];

    // --- Pipeline 2: Filter ---
    let filteredData = normalizedProducts.filter((p) => {
        // 1. Search (name)
        if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

        // 2. Category
        if (filterCategory !== 'All' && p.category !== filterCategory) return false;

        // 3. Glitch Only
        if (glitchOnly && p.glitchScore === 0) return false;

        // 4. Stock Status
        if (filterStockStatus === 'in-stock' && p.stock <= 0) return false;
        if (filterStockStatus === 'out-of-stock' && p.stock > 0) return false;

        return true;
    });

    // --- Pipeline 3: Sort ---
    filteredData = [...filteredData].sort((a, b) => {
        let aVal = a[sortCol];
        let bVal = b[sortCol];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        } else {
            // Numbers (price, glitchScore)
            return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
        }
    });

    const toggleSort = (col: SortColumn) => {
        if (sortCol === col) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortCol(col);
            setSortDir('asc');
        }
    };

    // --- Calculate Pagination ---
    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading (simulating fetch)...</div>;
    if (isError) return <div className="p-8 text-center text-red-500">Error fetching products.</div>;

    return (
        <div className="bg-white p-6 rounded shadow-sm">
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between border-b pb-4">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-1/3"
                />

                <div className="flex flex-wrap gap-4">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {categories.map((c) => (
                            <option key={c} value={c}>
                                Category: {c}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filterStockStatus}
                        onChange={(e) => setFilterStockStatus(e.target.value)}
                        className="px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="All">Stock: All</option>
                        <option value="in-stock">In Stock</option>
                        <option value="out-of-stock">Out of Stock</option>
                    </select>

                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded border cursor-pointer hover:bg-gray-100 transition">
                        <input
                            type="checkbox"
                            checked={glitchOnly}
                            onChange={(e) => setGlitchOnly(e.target.checked)}
                            className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                        />
                        Glitched Only
                    </label>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm whitespace-nowrap border">
                    <thead className="bg-gray-100 uppercase text-xs font-semibold text-gray-600 border-b">
                        <tr>
                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-200" onClick={() => toggleSort('name')}>
                                Name {sortCol === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-200" onClick={() => toggleSort('price')}>
                                Price {sortCol === 'price' && (sortDir === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Updated At</th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-200" onClick={() => toggleSort('glitchScore')}>
                                Glitch Score {sortCol === 'glitchScore' && (sortDir === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-800">{product.name}</td>
                                    <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                                    <td className={`px-6 py-4 font-bold ${product.stock <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                                        {product.stock}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{product.category}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold ${product.glitchScore >= 50
                                                ? 'bg-red-100 text-red-700'
                                                : product.glitchScore > 0
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}
                                        >
                                            Score: {product.glitchScore}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center flex justify-center gap-3">
                                        <Link
                                            to={`/products/${product.id}`}
                                            className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded disabled:opacity-50 text-xs font-medium transition"
                                        >
                                            Detail
                                        </Link>
                                        <Link
                                            to={`/products/${product.id}/edit`}
                                            className="text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-xs font-medium transition"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                        Showing page <span className="font-bold">{currentPage}</span> of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 text-sm font-medium transition"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 text-sm font-medium transition"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
