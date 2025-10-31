import React from "react";
import { cn } from "../lib/utils";

const tags = [
    { id: 1, label: "智能剪辑", sublabel: "AI赋能视频创作" },
    { id: 2, label: "高效工作流", sublabel: "一键生成剪辑方案" },
    { id: 3, label: "专业效果", sublabel: "电影级剪辑品质" },
    { id: 4, label: "实时协作", sublabel: "多人在线编辑" }
];

const Banner: React.FC = () => {
    return (
        <div className="relative overflow-hidden">
            {/* 装饰性元素 - 剪辑相关图形 */}
            <div className="absolute -left-16 -top-16 w-64 h-64 bg-blue-200 dark:bg-blue-800/30 rounded-full blur-3xl"></div>
            <div className="absolute right-1/4 -top-20 w-80 h-80 bg-purple-200 dark:bg-purple-800/30 rounded-full blur-3xl"></div>
            <div className="absolute right-0 bottom-0 w-72 h-72 bg-pink-200 dark:bg-pink-800/30 rounded-full blur-3xl"></div>
            
            {/* 顶部装饰 - 剪辑轨道风格 */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent flex items-center">
                {[...Array(30)].map((_, i) => (
                    <div key={i} className="flex-1 h-0.5 bg-blue-500/30 mx-0.5 rounded-full"></div>
                ))}
            </div>
            
            <div className="h-60 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-between px-8 relative z-10">
                <div className="max-w-2xl">
                    {/* 剪辑相关的小图标装饰 */}
                    <div className="flex space-x-2 mb-4">
                        {['fa-film', 'fa-video', 'fa-cut', 'fa-magic', 'fa-sliders-h'].map((icon, i) => (
                            <div 
                                key={i} 
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-md"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <i className={`fas ${icon} text-white text-xs`}></i>
                            </div>
                        ))}
                    </div>
                    
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-3 relative inline-block">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">超给力的</span> AI剪辑平台
                        <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                    </h1>
                    
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                        智能剪辑助手，<span className="text-red-500 font-bold">免费使用</span>，为您提供专业的视频剪辑解决方案
                    </p>
                    
                    {/* 标签区域 */}
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <div 
                                key={tag.id} 
                                className="px-3 py-1 bg-white dark:bg-gray-800/70 rounded-full shadow-sm flex items-center gap-1 text-xs"
                            >
                                <span className="text-gray-800 dark:text-white font-medium">{tag.label}</span>
                                <span className="text-gray-500 dark:text-gray-400">{tag.sublabel}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="relative w-80 h-60">
                    {/* 装饰性圆形 */}
                    <div className="absolute inset-0 border-4 border-dashed border-blue-300 dark:border-blue-700/50 rounded-full animate-spin-slow"></div>
                    <div className="absolute inset-4 border-2 border-dotted border-purple-300 dark:border-purple-700/50 rounded-full animate-spin-slow-reverse"></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                        <img
                            src="https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Professional%20video%20editing%20software%20interface%20with%20timeline%2C%20clips%2C%20and%20AI%20assistant%20feature&sign=699925b4fe6c93848909e5a2269cf7bc"
                            alt="AI剪辑平台"
                            className="max-h-full object-contain rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300" />
                    </div>
                    
                    {/* 装饰性标签 - 移除了"一键"、"效率"、"智能"相关标签 */}
                    <div className="absolute -top-4 left-10 bg-pink-500/80 text-white text-xs px-3 py-1 rounded-full transform -rotate-12 shadow-md">
                        专业剪辑
                    </div>
                    <div className="absolute -top-2 right-16 bg-blue-500/80 text-white text-xs px-3 py-1 rounded-full transform rotate-6 shadow-md">
                        创意无限
                    </div>
                    <div className="absolute -bottom-2 left-1/3 bg-purple-500/80 text-white text-xs px-3 py-1 rounded-full transform -rotate-3 shadow-md">
                        品质保障
                    </div>
                </div>
            </div>
            
            {/* 底部装饰 - 剪辑轨道风格 */}
            <div className="h-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400"></div>
        </div>
    );
};

export default Banner;