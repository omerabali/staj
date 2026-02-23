import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductById } from '../../api/products';
import { normalizeProduct } from '../../utils/normalizeProduct';

export const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState<'normalized' | 'raw'>('normalized');

    const { data: rawProduct, isLoading, isError } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProductById(id!),
        enabled: !!id,
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading product details...</div>;
    if (isError) return <div className="p-8 text-center text-red-500">Error fetching product.</div>;
    if (!rawProduct) return <div className="p-8 text-center text-gray-500">Product not found.</div>;

    const normalized = normalizeProduct(rawProduct);

    return (
        <div className="bg-white p-6 rounded shadow-sm max-w-4xl mx-auto">
            {/* Header & Back Button */}
            <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">Product Details</h2>
                <Link to="/products" className="text-sm text-blue-500 hover:text-blue-700 font-medium">
                    &larr; Back to Products
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b mb-6">
                <button
                    onClick={() => setActiveTab('normalized')}
                    className={`py-2 px-4 transition-colors font-medium border-b-2 ${activeTab === 'normalized' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Normalized View
                </button>
                <button
                    onClick={() => setActiveTab('raw')}
                    className={`py-2 px-4 transition-colors font-medium border-b-2 ${activeTab === 'raw' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Raw JSON View
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
                {activeTab === 'normalized' ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Name</p>
                                <p className="font-semibold text-lg text-gray-800">{normalized.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Price</p>
                                <p className="font-semibold text-lg text-gray-800">${normalized.price.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Stock</p>
                                <p className={`font-semibold text-lg ${normalized.stock <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                                    {normalized.stock}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Category</p>
                                <p className="font-semibold text-lg text-gray-800">{normalized.category}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Updated At</p>
                                <p className="font-semibold text-gray-800">
                                    {normalized.updatedAt ? new Date(normalized.updatedAt).toLocaleDateString() : 'Invalid/No Date'}
                                </p>
                            </div>
                        </div>

                        {/* Glitch Report Section */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                Glitch Report
                                <span className={`text-xs px-2 py-1 rounded-full text-white ${normalized.glitchScore > 40 ? 'bg-red-500' : normalized.glitchScore > 0 ? 'bg-orange-500' : 'bg-green-500'}`}>
                                    Score: {normalized.glitchScore}
                                </span>
                            </h3>

                            {normalized.glitchReport.length === 0 ? (
                                <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded">
                                    ✅ This product data is perfectly clean. No glitches found!
                                </div>
                            ) : (
                                <ul className="space-y-2">
                                    {normalized.glitchReport.map((issue, index) => (
                                        <li key={index} className="flex flex-col p-3 bg-red-50 border border-red-100 rounded">
                                            <span className="font-bold text-red-700 capitalize text-sm mb-1">
                                                Issue in {issue.field}:
                                            </span>
                                            <span className="text-gray-700 text-sm">{issue.message}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex justify-end">
                            <Link
                                to={`/products/${normalized.id}/edit`}
                                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded font-medium transition"
                            >
                                Edit Product
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                        <pre className="text-emerald-400 text-sm font-mono">
                            {JSON.stringify(rawProduct, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};
