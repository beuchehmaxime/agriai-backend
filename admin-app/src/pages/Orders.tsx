import { useState, useEffect } from 'react';
import { useOrders, useUpdateOrderStatus, useDeleteOrder } from '../features/orders/hooks';
import type { Order } from '../features/orders/types';
import { Search, Eye, Trash2, X, Package, User, Calendar, DollarSign, Activity, ShoppingBag } from 'lucide-react';

const Orders = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input to prevent excessive API calls
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data: orders, isLoading } = useOrders(debouncedSearch);
    const updateStatusMutation = useUpdateOrderStatus();
    const deleteOrderMutation = useDeleteOrder();

    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

    const handleStatusChange = (id: string, newStatus: string) => {
        updateStatusMutation.mutate({ id, status: newStatus as Order['status'] });
        if (viewingOrder && viewingOrder.id === id) {
            setViewingOrder({ ...viewingOrder, status: newStatus as Order['status'] });
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you certain you want to delete this order? This action cannot be undone.')) {
            deleteOrderMutation.mutate(id);
            if (viewingOrder?.id === id) {
                setViewingOrder(null);
            }
        }
    };

    const statusColors: Record<string, string> = {
        PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
        PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
        SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
        DELIVERED: 'bg-green-50 text-green-700 border-green-200',
        CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage and track customer orders across the platform.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by Order ID or Customer Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">Order ID</th>
                                <th className="p-4 font-semibold">Customer</th>
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">Total</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">Loading orders...</td>
                                </tr>
                            ) : orders?.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Package size={16} className="text-gray-400" />
                                            <span className="text-sm font-mono font-medium text-gray-700">
                                                {order.id.substring(0, 8).toUpperCase()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{order.user?.name || 'Unknown User'}</div>
                                        <div className="text-xs text-gray-400">{order.user?.phoneNumber || 'No phone'}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400" />
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-gray-900">
                                        ${order.totalAmount.toFixed(2)}
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            disabled={updateStatusMutation.isPending}
                                            className={`text-xs font-semibold uppercase tracking-wider border rounded-lg px-2 py-1 outline-none transition-all focus:ring-2 ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="PROCESSING">Processing</option>
                                            <option value="SHIPPED">Shipped</option>
                                            <option value="DELIVERED">Delivered</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setViewingOrder(order)}
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(order.id)}
                                                disabled={deleteOrderMutation.isPending}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete Order"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && orders?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        {searchTerm ? 'No orders match your search criteria.' : 'No orders found in the system.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Order Details Modal */}
            {viewingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setViewingOrder(null)}></div>
                    <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Package className="text-green-600" size={24} />
                                    Order Summary
                                </h3>
                                <p className="text-sm font-mono text-gray-500 mt-1">ID: {viewingOrder.id}</p>
                            </div>
                            <button onClick={() => setViewingOrder(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto flex-1 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {/* Customer Info */}
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                                        <User size={16} className="text-green-600" /> Customer
                                    </h4>
                                    <p className="font-semibold text-gray-800">{viewingOrder.user?.name || 'Unknown User'}</p>
                                    <p className="text-sm text-gray-500 mt-1">{viewingOrder.user?.phoneNumber || 'No phone'}</p>
                                </div>

                                {/* Order Metadata */}
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                                        <Activity size={16} className="text-green-600" /> Activity
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm text-gray-600">
                                            <span>Date:</span>
                                            <span className="font-medium text-gray-900">{new Date(viewingOrder.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-600">
                                            <span>Status:</span>
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusColors[viewingOrder.status] || 'bg-gray-100 text-gray-700'}`}>
                                                {viewingOrder.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Financials */}
                                <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-green-900 mb-3 border-b border-green-200 pb-2">
                                        <DollarSign size={16} className="text-green-600" /> Financials
                                    </h4>
                                    <div className="flex flex-col items-center justify-center pt-2">
                                        <span className="text-xs text-green-700 font-semibold uppercase tracking-wider">Total Amount</span>
                                        <span className="text-3xl font-black text-green-600">${viewingOrder.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items Table */}
                            <div className="space-y-3">
                                <h4 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                    <ShoppingBag size={20} className="text-green-600" /> Purchased Items
                                </h4>
                                <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Unit Price</th>
                                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Qty</th>
                                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {viewingOrder.items?.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {item.product?.imageUrl ? (
                                                                <img src={item.product?.imageUrl} alt={item.product?.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                                    <Package size={16} className="text-gray-400" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">{item.product?.name || 'Unknown Product'}</p>
                                                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{item.product?.description}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">
                                                        ${item.price.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-4 text-center text-sm font-bold text-gray-900">
                                                        x{item.quantity}
                                                    </td>
                                                    <td className="px-4 py-4 text-right text-sm font-bold text-green-600">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!viewingOrder.items || viewingOrder.items.length === 0) && (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">No items found for this order.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot className="bg-gray-50 border-t border-gray-100">
                                            <tr>
                                                <td colSpan={3} className="px-4 py-4 text-right text-sm font-bold text-gray-700">Order Total:</td>
                                                <td className="px-4 py-4 text-right text-lg font-black text-green-600 whitespace-nowrap">
                                                    ${viewingOrder.totalAmount.toFixed(2)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
