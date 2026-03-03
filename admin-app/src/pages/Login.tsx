import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Sprout } from 'lucide-react';
import { useAuth } from '../features/auth/hooks';
import { authService } from '../features/auth/service';

const Login = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await authService.login(phoneNumber, password);
            console.log('Login Response:', response);

            // Expected backend payload structure: { success, message, data: { user, token } }
            if (response.success && response.data) {
                const { token, user } = response.data;
                if (user.userType !== 'ADMIN') {
                    setError('Unauthorized: Admin access required.');
                } else {
                    login(token, user);
                    navigate('/');
                }
            } else {
                setError(response.message || 'Login failed.');
            }
        } catch (err: any) {
            console.log(err);
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to login. Check credentials.');

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 px-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

            <div className="w-[90%] max-w-[420px] bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 z-10 border border-gray-100 relative mx-auto my-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex h-16 w-16 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-2xl shadow-lg items-center justify-center mb-4 text-white">
                        <Sprout size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">AgriAI Admin</h1>
                    <p className="text-gray-500">Sign in to manage the platform</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                        <AlertCircle size={20} className="shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="text"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                            placeholder="Enter phone number"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                            placeholder="Enter password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-green-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <span>Sign In</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
