import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApiConfig, registrationConfig } from "../lib/authConfig";

const RegisterModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [group, setGroup] = useState("剪辑师"); // 默认选择剪辑师
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 表单验证
    if (!username.trim()) {
      toast.error("请输入用户名");
      return;
    }
    
    if (!password.trim() || password.length < 6) {
      toast.error("密码长度不能少于6位");
      return;
    }
    
    if (!email.trim()) {
      toast.error("请输入邮箱");
      return;
    }
    
    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("请输入有效的邮箱地址");
      return;
    }

    setIsLoading(true);

       try {
       const response = await fetch(authApiConfig.register.url, {
         method: authApiConfig.register.method,
         headers: {
                    "Content-Type": "application/json"
                },
                // 超时处理会在服务端配置中处理，这里不设置具体的abort signal
                // signal: AbortSignal.timeout(authApiConfig.register.timeoutMs)
         body: JSON.stringify({
           username,
           password,
           email,
           group
         }),
         signal: AbortSignal.timeout(authApiConfig.register.timeoutMs)
       });

      if (!response.ok) {
        throw new Error("注册失败，请检查信息是否正确");
      }

      const data = await response.json();
      
      if (data.message === "注册成功") {
        toast.success("注册成功，请登录");
        onClose();
        // 可以选择是否自动跳转到登录页面或登录模态框
      } else {
        throw new Error(data.message || "注册失败");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "注册失败，请稍后重试");
      console.error("Register error:", error);
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
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">用户注册</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                用户名
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                密码
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                邮箱
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label
                htmlFor="group"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                角色
              </label>
              <select
                id="group"
                value={group}
                onChange={e => setGroup(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="剪辑师">剪辑师</option>
                <option value="用户">用户</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${isLoading ? "bg-purple-400 text-white cursor-not-allowed" : "bg-purple-600 text-white hover:bg-purple-700"}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i>注册中...
                </div>
              ) : (
                "注册"
              )}
            </button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">已有账号？</span>
            <button
              onClick={() => {
                onClose();
                // 这里可以添加打开登录模态框的逻辑，如果需要
              }}
              className="text-purple-600 dark:text-purple-400 ml-1 hover:underline"
            >
              立即登录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;