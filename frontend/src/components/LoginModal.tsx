import React, { useState } from "react";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApiConfig, loginConfig } from "../lib/authConfig";

const LoginModal: React.FC<{
    onClose: () => void;
}> = (
    {
        onClose
    }
) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const {
        setIsAuthenticated,
        setUserInfo
    } = useAuth();

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            toast.error("请输入用户名和密码");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(authApiConfig.login.url, {
                method: authApiConfig.login.method,
                headers: {
                    "Content-Type": "application/json"
                },
                // 超时处理会在服务端配置中处理，这里不设置具体的abort signal
                // signal: AbortSignal.timeout(authApiConfig.login.timeoutMs)
                body: JSON.stringify({
                    username,
                    password
                }),
                signal: AbortSignal.timeout(authApiConfig.login.timeoutMs)
            });

            if (!response.ok) {
                throw new Error("登录失败，请检查用户名和密码");
            }

            const data = await response.json();
            setIsAuthenticated(true);

            setUserInfo({
                username: data.username,
                role: data.role,
                editRequests: data.edit_requests || [],
                content: data.content || null
            });

            localStorage.setItem("authToken", JSON.stringify({
                username: data.username,
                role: data.role,
                timestamp: new Date().getTime()
            }));

            toast.success("登录成功");
            onClose();
            navigate("/");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "登录失败，请稍后重试");
            console.error("Login error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleOverlayClick}>
            <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">用户登录</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">用户名
                                              </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="请输入用户名"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                autoFocus />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">密码
                                              </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="请输入密码"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${isLoading ? "bg-purple-400 text-white cursor-not-allowed" : "bg-purple-600 text-white hover:bg-purple-700"}`}>
                            {isLoading ? <div className="flex items-center justify-center">
                                <i className="fas fa-spinner fa-spin mr-2"></i>登录中...
                                                </div> : "登录"}
                        </button>
                    </form>
                    <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        <></>
                        <></>
                        <></>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;