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

// 所有智能体数据
export const agentData = [...popularAgents];

// AI助手列表
export const aiAssistants = agentConfigs.map(config => ({
  id: config.id,
  name: config.name,
  avatar: config.avatar
}));

// 功能标签 - 更广泛的应用场景
export const functionTags = [
  '智能助手', '内容创作', '数据分析', '学习辅导', '工作效率',
  '创意设计', '语音交互', '图像识别', '知识问答', '生活服务',
];