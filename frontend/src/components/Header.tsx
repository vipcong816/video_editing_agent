import React, { useState } from 'react';
import { useAuth } from '../contexts/authContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { authApiConfig } from '../lib/authConfig';

// 应用顶部导航栏组件
const Header: React.FC = () => {
  // 获取认证状态和用户信息
  const { isAuthenticated, logout, userInfo } = useAuth();
  // 控制登录和注册模态框的显示状态
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  
  // 处理用户退出登录
  const handleLogout = async () => {
    try {
      // 发送退出登录请求到服务器
      const response = await fetch(authApiConfig.logout.url, {
        method: authApiConfig.logout.method,
        headers: {
          'Content-Type': 'application/json',
        },
  signal: AbortSignal.timeout(600000) // 设置请求超时为10分钟
      });
      
      if (!response.ok) {
        throw new Error('退出失败');
      }
      
      const data = await response.json();
      logout(); // 调用AuthContext中的logout方法清除本地状态
      toast.success(data.message || '退出成功'); // 显示成功提示
    } catch (error) {
      // 显示错误提示
      toast.error(error instanceof Error ? error.message : '退出失败，请稍后重试');
      console.error('Logout error:', error);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex justify-between items-center sticky top-0 z-10">
      {/* 左侧功能按钮 */}
      <div className="flex items-center gap-4">
        <button className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
          <i className="fas fa-bell text-lg"></i> {/* 通知按钮 */}
        </button>
        <button className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
          <i className="fas fa-cog text-lg"></i> {/* 设置按钮 */}
        </button>
      </div>
      
      {/* 右侧用户信息和操作 */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          // 已登录状态：显示退出按钮和用户头像
          <div className="flex items-center gap-2">
            {/* 退出登录按钮 - 放在头像左侧，紧贴着 */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-full transition-colors"
              title="退出登录"
            >
              <i className="fas fa-sign-out-alt text-xs"></i>
              <span>退出</span>
            </button>
            
            {/* 用户头像和用户名 */}
            <div className="flex items-center gap-1.5 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-red-400 transition-colors">
                <img 
                  src={`https://via.placeholder.com/32?text=${userInfo.username?.charAt(0).toUpperCase()}`} 
                  alt={userInfo.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-white">{userInfo.username}</span>
            </div>
          </div>
        ) : (
          // 未登录状态：显示注册和登录按钮
          <>
            <button 
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              注册
            </button>
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="px-4 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              登录
            </button>
          </>
        )}
      </div>
      
      {/* 登录模态框 */}
      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} />
      )}
      
      {/* 注册模态框 */}
      {isRegisterModalOpen && (
        <RegisterModal onClose={() => setIsRegisterModalOpen(false)} />
      )}
    </div>
  );
};

export default Header;