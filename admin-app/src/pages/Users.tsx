import { useState } from 'react';
import { useUsers, useUpdateUser, useUpdateUserPassword } from '../features/users/hooks';
import type { User, UpdateUserDto } from '../features/users/types';
import { Edit2, Key, X, Check, AlertCircle } from 'lucide-react';

const Users = () => {
    const { data: users, isLoading, error: usersError } = useUsers();
    const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
    const { mutate: updatePassword, isPending: isUpdatingPassword } = useUpdateUserPassword();

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Form States
    const [editFormData, setEditFormData] = useState<UpdateUserDto>({});
    const [newPassword, setNewPassword] = useState('');
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading users...</div>;
    if (usersError) return <div className="p-8 text-center text-red-500">Error loading users.</div>;

    const openEditModal = (user: User) => {
        setUpdateError('');
        setUpdateSuccess('');
        setSelectedUser(user);
        setEditFormData({
            name: user.name || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber,
            userType: user.userType,
        });
        setNewPassword('');
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedUser(null);
    };

    const handleUpdateUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setUpdateError('');
        setUpdateSuccess('');

        updateUser(
            { id: selectedUser.id, data: editFormData },
            {
                onSuccess: () => {
                    setUpdateSuccess('User details updated successfully.');
                    setTimeout(closeEditModal, 1500);
                },
                onError: (err: any) => {
                    setUpdateError(err.response?.data?.message || 'Failed to update user.');
                }
            }
        );
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !newPassword) return;
        setUpdateError('');
        setUpdateSuccess('');

        updatePassword(
            { id: selectedUser.id, password: newPassword },
            {
                onSuccess: () => {
                    setUpdateSuccess('Password updated successfully.');
                    setNewPassword('');
                },
                onError: (err: any) => {
                    setUpdateError(err.response?.data?.message || 'Failed to update password.');
                }
            }
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage platform farmers, agronomists, and admins.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">Name</th>
                                <th className="p-4 font-semibold">Phone / Email</th>
                                <th className="p-4 font-semibold">Role</th>
                                <th className="p-4 font-semibold">Joined</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users?.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-900 font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-100 to-green-200 text-green-700 font-bold flex items-center justify-center text-xs">
                                                {user.name?.charAt(0) || 'U'}
                                            </div>
                                            {user.name || 'Unnamed User'}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        <div className="text-sm">{user.phoneNumber}</div>
                                        <div className="text-xs text-gray-400">{user.email || 'No email'}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${user.userType === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            user.userType === 'AGRONOMIST' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-green-50 text-green-700 border-green-200'
                                            }`}>
                                            {user.userType}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500 text-sm">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Edit User"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit User Modal */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
                                <p className="text-sm text-gray-500 mt-1">ID: {selectedUser.id}</p>
                            </div>
                            <button onClick={closeEditModal} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-8">
                            {updateError && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100">
                                    <AlertCircle size={18} />
                                    <span className="text-sm font-medium">{updateError}</span>
                                </div>
                            )}
                            {updateSuccess && (
                                <div className="p-4 bg-green-50 text-green-600 rounded-xl flex items-center gap-3 border border-green-100">
                                    <Check size={18} />
                                    <span className="text-sm font-medium">{updateSuccess}</span>
                                </div>
                            )}

                            <form onSubmit={handleUpdateUser} className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 uppercase tracking-wider">Profile Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                                        <input
                                            type="text"
                                            value={editFormData.name || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                            placeholder="Enter name"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={editFormData.phoneNumber || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                            placeholder="Phone number"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                                        <input
                                            type="email"
                                            value={editFormData.email || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                            placeholder="Email address"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Role</label>
                                        <select
                                            value={editFormData.userType}
                                            onChange={(e) => setEditFormData({ ...editFormData, userType: e.target.value as any })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                        >
                                            <option value="FARMER">Farmer</option>
                                            <option value="AGRONOMIST">Agronomist</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-sm"
                                    >
                                        {isUpdating ? 'Saving...' : 'Save Profile Changes'}
                                    </button>
                                </div>
                            </form>

                            <form onSubmit={handleUpdatePassword} className="space-y-4 pt-4 mt-6 border-t border-gray-100">
                                <div className="flex items-center gap-2 border-b pb-2">
                                    <Key size={16} className="text-gray-400" />
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Security</h3>
                                </div>

                                <div className="flex gap-4 items-end">
                                    <div className="space-y-1.5 flex-1">
                                        <label className="text-sm font-medium text-gray-700">New Password</label>
                                        <input
                                            type="text"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                                            placeholder="Enter new password to override"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isUpdatingPassword || !newPassword.trim()}
                                        className="px-6 py-2.5 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors border border-red-100"
                                    >
                                        {isUpdatingPassword ? 'Updating...' : 'Override Password'}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500">Warning: Overriding the password will instantly invalidate the user's current credentials.</p>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
