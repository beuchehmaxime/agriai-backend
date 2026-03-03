import { useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Eye, Tag } from 'lucide-react';
import { useCategories } from '../features/categories/hooks';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../features/products/hooks';
import type { Product } from '../features/products/types';

const Products = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', price: '0', stockQuantity: '0', categoryId: '', diseaseTags: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const { data: products, isLoading } = useProducts();
    const { data: categories } = useCategories();

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingProduct(null);
        setFormData({ name: '', description: '', price: '0', stockQuantity: '0', categoryId: '', diseaseTags: '' });
        setImageFile(null);
    };

    const closeViewModal = () => {
        setViewingProduct(null);
    };

    const createMutation = useCreateProduct(closeEditModal);
    const updateMutation = useUpdateProduct(closeEditModal);
    const deleteMutation = useDeleteProduct();

    const openEditModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price.toString(),
                stockQuantity: product.stockQuantity.toString(),
                categoryId: product.categoryId,
                diseaseTags: product.diseaseTags?.join(', ') || ''
            });
            setImageFile(null);
        } else {
            setEditingProduct(null);
            setFormData({ name: '', description: '', price: '0', stockQuantity: '0', categoryId: categories?.[0]?.id || '', diseaseTags: '' });
            setImageFile(null);
        }
        setIsEditModalOpen(true);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const payload = new FormData();
        payload.append('name', formData.name);
        payload.append('description', formData.description);
        payload.append('price', formData.price);
        payload.append('stockQuantity', formData.stockQuantity);
        payload.append('categoryId', formData.categoryId);
        if (formData.diseaseTags) {
            payload.append('diseaseTags', formData.diseaseTags);
        }
        if (imageFile) {
            payload.append('image', imageFile);
        }

        if (editingProduct) {
            updateMutation.mutate({ id: editingProduct.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading products...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage shop inventory, tags, and details.</p>
                </div>
                <button
                    onClick={() => openEditModal()}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-md shadow-green-500/20 transition-all font-medium"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">Product</th>
                                <th className="p-4 font-semibold">Category</th>
                                <th className="p-4 font-semibold">Tags</th>
                                <th className="p-4 font-semibold">Price</th>
                                <th className="p-4 font-semibold">Stock</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products?.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100 border border-gray-200" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                                                    <ImageIcon size={20} />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-gray-900">{product.name}</p>
                                                <p className="text-xs text-gray-500 max-w-[200px] truncate">{product.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{product.category?.name || 'Unknown'}</span>
                                    </td>
                                    <td className="p-4">
                                        {product.diseaseTags && product.diseaseTags.length > 0 ? (
                                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                {product.diseaseTags.slice(0, 2).map((tag, idx) => (
                                                    <span key={idx} className="bg-green-50 text-green-700 border border-green-200 text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {product.diseaseTags.length > 2 && (
                                                    <span className="text-xs text-gray-400">+{product.diseaseTags.length - 2}</span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">No tags</span>
                                        )}
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">
                                        ${product.price.toFixed(2)}
                                    </td>
                                    <td className="p-4">
                                        <span className={`font-medium ${product.stockQuantity > 10 ? 'text-green-600' : product.stockQuantity > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                                            {product.stockQuantity} in stock
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => setViewingProduct(product)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="View Details">
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => openEditModal(product)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Product">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Product">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">No products found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Details Modal */}
            {viewingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={closeViewModal}></div>
                    <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Eye size={18} className="text-green-600" /> Product Details
                            </h3>
                            <button onClick={closeViewModal} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                {viewingProduct.imageUrl ? (
                                    <img src={viewingProduct.imageUrl} alt={viewingProduct.name} className="w-full aspect-square object-cover rounded-2xl shadow-sm border border-gray-100" />
                                ) : (
                                    <div className="w-full aspect-square rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-gray-400 gap-3">
                                        <ImageIcon size={48} strokeWidth={1} />
                                        <span className="text-sm font-medium">No Image Uploaded</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{viewingProduct.name}</h2>
                                    <span className="inline-block mt-2 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">
                                        {viewingProduct.category?.name || 'Uncategorized'}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-3xl font-bold text-green-600">${viewingProduct.price.toFixed(2)}</p>
                                    <p className={`text-sm font-medium mt-1 ${viewingProduct.stockQuantity > 10 ? 'text-green-600' : viewingProduct.stockQuantity > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                                        {viewingProduct.stockQuantity} items in stock
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-gray-900 border-b pb-1">Description</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                        {viewingProduct.description}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-gray-900 border-b pb-1 flex items-center gap-1">
                                        <Tag size={14} /> Disease Tags
                                    </h4>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {viewingProduct.diseaseTags && viewingProduct.diseaseTags.length > 0 ? (
                                            viewingProduct.diseaseTags.map((tag, idx) => (
                                                <span key={idx} className="bg-green-50 text-green-700 border border-green-200 text-xs px-3 py-1 rounded-full font-medium">
                                                    {tag}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 text-sm italic">No disease tags assigned to this product.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit / Create Form Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={closeEditModal}></div>
                    <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingProduct ? 'Edit Product' : 'Create Product'}
                            </h3>
                            <button onClick={closeEditModal} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text" required value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        rows={3} required value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                    <input
                                        type="number" step="0.01" required value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                    <input
                                        type="number" required value={formData.stockQuantity}
                                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Disease Tags</label>
                                    <input
                                        type="text" value={formData.diseaseTags}
                                        onChange={(e) => setFormData({ ...formData, diseaseTags: e.target.value })}
                                        placeholder="e.g. Mildew, Blight, Rot"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    />
                                    <p className="text-xs text-gray-500 mt-1 pl-1">Separate multiple tags with commas.</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        required value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-white"
                                    >
                                        <option value="" disabled>Select a category</option>
                                        {categories?.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                                    <input
                                        type="file" accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3 mt-4 border-t border-gray-100">
                                <button type="button" onClick={closeEditModal} className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-md shadow-green-500/20 transition-all disabled:opacity-70 font-medium">
                                    {editingProduct ? 'Save Changes' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
