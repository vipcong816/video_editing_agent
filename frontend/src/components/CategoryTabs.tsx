import React, { useState } from "react";
import { cn } from "../lib/utils";

const categories = [
    "发现智能体",
    "热门",
    "人气飙升",
    "最新发布",
    "创作",
    "AI绘画",
    "角色",
    "智能专家",
    "娱乐",
    "职场",
    "命理",
    "情感",
    "学习",
    "其他"
];

const userCategories = ["最近使用", "已关注", "筛选"];

const CategoryTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState("发现智能体");

    return (
        <div
            className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
            <div className="flex items-center overflow-x-auto py-3 gap-5 no-scrollbar">
                {categories.map(category => <></>)}
                {}
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                {userCategories.map(category => <></>)}
            </div>
        </div>
    );
};

export default CategoryTabs;