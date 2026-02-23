import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getProductById, updateProduct } from '../../api/products';
import { normalizeProduct } from '../../utils/normalizeProduct';

// --- Zod Schema for Validation ---
const productSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    price: z.number().min(0, 'Price cannot be negative'),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    category: z.string().min(2, 'Category is required'),
});

type ProductFormData = z.infer<typeof productSchema>;

export const EditProduct = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: rawProduct, isLoading, isError } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProductById(id!),
        enabled: !!id,
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
    });

    // Effect to populate form when data is loaded (normalized)
    useEffect(() => {
        if (rawProduct) {
            const normalized = normalizeProduct(rawProduct);
            reset({
                name: normalized.name,
                price: normalized.price,
                stock: normalized.stock,
                category: normalized.category,
            });
        }
    }, [rawProduct, reset]);

    // Mutation for updating data
    const updateMutation = useMutation({
        mutationFn: (data: ProductFormData) => updateProduct(id!, data),
        onSuccess: (updatedRaw) => {
            // Create local Audit Log mapping on console (as required by case)
            const auditLog = {
                timestamp: new Date().toISOString(),
                productId: id,
                action: 'UPDATE',
                newRawData: updatedRaw,
            };
            console.log('--- AUDIT LOG ---', JSON.stringify(auditLog, null, 2));

            // Refresh both list and detail queries so user sees immediate changes
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', id] });

            // Navigate back to details or table
            navigate(`/products/${id}`);
        },
    });

    const onSubmit = (data: ProductFormData) => {
        updateMutation.mutate(data);
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading form data...</div>;
    if (isError) return <div className="p-8 text-center text-red-500">Error loading product data.</div>;
    if (!rawProduct) return <div className="p-8 text-center text-gray-500">Product not found.</div>;

    return (
        <div className="bg-white p-6 rounded shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
                <div className="flex gap-4">
                    <Link to={`/products/${id}`} className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                        Cancel
                    </Link>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                        {...register('name')}
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                            }`}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                {/* Price & Stock Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            {...register('price', { valueAsNumber: true })}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                        />
                        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                        <input
                            type="number"
                            {...register('stock', { valueAsNumber: true })}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.stock ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                        />
                        {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
                    </div>
                </div>

                {/* Category Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                        {...register('category')}
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                            }`}
                    />
                    {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
                </div>

                {/* Action Buttons */}
                <div className="pt-6 flex justify-end gap-3 border-t">
                    <Link
                        to={`/products/${id}`}
                        className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded font-medium transition"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting || updateMutation.isPending}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition flex items-center justify-center min-w-[120px]"
                    >
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {updateMutation.isError && (
                    <p className="text-red-500 text-sm mt-2 text-right">Failed to update product.</p>
                )}
            </form>
        </div>
    );
};
