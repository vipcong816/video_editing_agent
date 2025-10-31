import { agentConfigs } from './agentConfig';

// 从配置文件中导出热门智能体
export const popularAgents = agentConfigs.map(config => ({
  id: config.id,
  name: config.name,
  description: config.description,
  creator: config.creator,
  views: config.views,
  avatar: config.avatar,
  externalUrl: config.externalUrl
}));

// 只保留自动剪辑智能体
export const trendingAgents = agentConfigs
  .filter(config => config.name === '自动剪辑')
  .map(config => ({
    id: config.id,
    name: config.name,
    description: config.description,
    creator: config.creator,
    views: config.views,
    avatar: config.avatar,
    externalUrl: config.externalUrl
  }));

// 所有智能体数据
export const agentData = [...popularAgents];

// AI助手列表
export const aiAssistants = agentConfigs.map(config => ({
  id: config.id,
  name: config.name,
  avatar: config.avatar
}));

// 功能标签
export const functionTags = [
  'PPT制作', '语音创作', 'AI搜索', '数学设计', '学习研究',
  '市场调研', '办公写作', '网站开发', '自媒体创作', '营销策划',
];