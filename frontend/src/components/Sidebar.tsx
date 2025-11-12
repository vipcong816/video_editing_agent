import React from "react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

const navItems = [{
    id: "create",
    label: "+ 创建智能体",
    isPrimary: true,
    icon: "fa-plus-circle"
}, {
    id: "store",
    label: "智能体商店",
    icon: "fa-store"
}, {
    id: "create-center",
    label: "创作中心",
    icon: "fa-palette"
}];

const personalItems = [{
    id: "my-agents",
    label: "我的智能体",
    icon: "fa-robot"
}, {
    id: "my-creations",
    label: "我的创作",
    icon: "fa-film"
}, {
    id: "my-knowledge",
    label: "我的知识库",
    icon: "fa-book"
}, {
    id: "my-workflow",
    label: "我的工作流",
    icon: "fa-project-diagram"
}, {
    id: "my-earnings",
    label: "我的收益",
    icon: "fa-chart-line"
}];

const serviceItems = [{
    id: "growth",
    label: "成长中心",
    icon: "fa-rocket"
}, {
    id: "wenxin",
    label: "文心中心",
    icon: "fa-brain"
}, {
    id: "messages",
    label: "消息中心",
    icon: "fa-envelope",
    badge: "99+"
}, {
    id: "community",
    label: "社区中心",
    icon: "fa-users"
}, {
    id: "official-group",
    label: "官方社群",
    icon: "fa-users-cog"
}, {
    id: "customer-service",
    label: "智能客服",
    icon: "fa-headset"
}];

const Sidebar: React.FC = () => {
    return (
        <div className="w-56 h-screen bg-white dark:bg-gray-800 shadow-lg flex flex-col p-4 relative overflow-hidden">
            {/* 背景装饰 - 通用图形元素 */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-50 dark:bg-purple-900/10 rounded-full blur-3xl"></div>
            
            {/* 科技感装饰元素 - 顶部 */}
            <div className="absolute top-0 left-0 w-full flex justify-around pt-2 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                ))}
            </div>
            
            <div className="mb-8 relative z-10">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center">
                        <span className="text-white font-bold">文</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">智能应用平台</h1>
                </div>
                
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">主要功能</h2>
                <div className="space-y-1">
                    {navItems.map(item => (
                        <Link
                            key={item.id}
                            to="#"
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                                item.isPrimary ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 font-medium" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            )}
                        >
                            <i className={`fas ${item.icon} text-sm`}></i>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
                
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3 mt-6">个人中心</h2>
                <div className="space-y-1">
                    {personalItems.map(item => (
                        <Link
                            key={item.id}
                            to="#"
                            className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <i className={`fas ${item.icon} text-sm`}></i>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
                
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3 mt-6">服务支持</h2>
                <div className="space-y-1">
                    {serviceItems.map(item => (
                        <Link
                            key={item.id}
                            to="#"
                            className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <i className={`fas ${item.icon} text-sm`}></i>
                            <span>{item.label}</span>
                            {item.badge && (
                                <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
            
            {/* 科技感装饰元素 - 底部 */}
            <div className="absolute bottom-20 left-0 w-full flex justify-around pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-gradient-to-r from-purple-400 to-pink-500" style={{ opacity: 0.7 - i * 0.1 }}></div>
                ))}
            </div>
            
            <div className="mt-auto relative z-10">
                <Link
                    to="/user-space"
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors group"
                >
                    <div className="w-5 h-5 rounded-md bg-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i className="fas fa-th-large text-white text-xs"></i>
                    </div>
                    <span>应用空间</span>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;