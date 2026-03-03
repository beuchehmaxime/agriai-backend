import { useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Edit2, Trash2, X, Check, X as XIcon } from 'lucide-react';
import { useTips, useCreateTip, useUpdateTip, useUpdateTipStatus, useDeleteTip } from '../features/tips/hooks';
import type { Tip } from '../features/tips/types';
import { useAuth } from '../features/auth/hooks';

const Tips = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTip, setEditingTip] = useState<Tip | null>(null);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const { data: tips, isLoading } = useTips();

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTip(null);
        setFormData({ title: '', content: '' });
        setImageFile(null);
    };

    const createMutation = useCreateTip(closeModal);
    const updateMutation = useUpdateTip(closeModal);
    const statusMutation = useUpdateTipStatus();
    const deleteMutation = useDeleteTip();

    const openModal = (tip?: Tip) => {
        if (tip) {
            setEditingTip(tip);
            setFormData({ title: tip.title, content: tip.content });
            setImageFile(null);
        } else {
            setEditingTip(null);
            setFormData({ title: '', content: '' });
            setImageFile(null);
        }
        setIsModalOpen(true);
    };



    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const payload = new FormData();
        payload.append('title', formData.title);
        payload.append('content', formData.content);
        if (imageFile) {
            payload.append('image', imageFile);
        }

        if (editingTip) {
            updateMutation.mutate({ id: editingTip.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this tip?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading tips...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Farming Tips</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage tips shared with farmers.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all font-medium"
                >
                    <Plus size={18} /> Add Tip
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tips?.map((tip) => (
                    <div key={tip.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-all">
                        {tip.imageUrl && (
                            <div className="h-48 w-full bg-gray-100">
                                <img src={tip.imageUrl} alt={tip.title} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{tip.title}</h3>
                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${tip.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                    tip.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                    {tip.status}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 font-medium mb-3">By {tip.author?.name || 'Unknown'} • {new Date(tip.createdAt).toLocaleDateString()}</p>
                            <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                                {tip.content}
                            </p>

                            {/* Admin specific controls */}
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <div className="flex gap-2">
                                    {(user?.userType === 'ADMIN' || user?.id === tip.authorId) && (
                                        <>
                                            <button onClick={() => openModal(tip)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(tip.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                                {user?.userType === 'ADMIN' && tip.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => statusMutation.mutate({ id: tip.id, status: 'REJECTED' })} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors shadow-sm" title="Reject">
                                            <XIcon size={16} className="stroke-[2.5]" />
                                        </button>
                                        <button onClick={() => statusMutation.mutate({ id: tip.id, status: 'APPROVED' })} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors shadow-sm" title="Approve">
                                            <Check size={16} className="stroke-[2.5]" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingTip ? 'Edit Tip' : 'Create Tip'}
                            </h3>
                            <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text" required value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                <textarea
                                    rows={8} required value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image (Optional)</label>
                                <input
                                    type="file" accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                                />
                            </div>
                            <div className="pt-4 flex gap-3 mt-4">
                                <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all disabled:opacity-70 font-medium">
                                    {editingTip ? 'Save Changes' : 'Create Tip'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tips;
