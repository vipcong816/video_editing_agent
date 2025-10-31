import React, { createContext, useContext, useState, type ReactNode } from "react";

// 用户信息接口定义
interface UserInfo {
  username?: string;
  role?: string;
  editRequests?: Array<{
    id: number;
    username: string;
    content: string;
    evaluation: string;
    created_at: string;
  }>;
  content?: {
    '需求提交'?: string;
  };
}

// 认证上下文接口定义
interface AuthContextType {
  isAuthenticated: boolean; // 用户是否已认证
  userInfo: UserInfo; // 用户信息对象
  setIsAuthenticated: (value: boolean) => void; // 设置认证状态
  setUserInfo: (userInfo: UserInfo) => void; // 设置用户信息
  logout: () => void; // 登出函数
}

// 创建认证上下文，提供默认值
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userInfo: {},
  setIsAuthenticated: () => {},
  setUserInfo: () => {},
  logout: () => {},
});

// 认证提供者组件，管理全局认证状态
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 从localStorage中恢复认证状态（持久化登录）
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const authToken = localStorage.getItem('authToken');
    return !!authToken; // 检查是否存在认证令牌
  });

  const [userInfo, setUserInfo] = useState<UserInfo>({}); // 存储用户详细信息

  // 登出函数，清除认证状态和用户信息
  const logout = () => {
    setIsAuthenticated(false);
    setUserInfo({});
    localStorage.removeItem('authToken'); // 删除本地存储的认证令牌
  };

  // 提供认证上下文值给子组件
  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        isAuthenticated,
        userInfo,
        setIsAuthenticated,
        setUserInfo,
        logout,
      },
    },
    children
  );
};

// 自定义Hook，便于组件访问认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};