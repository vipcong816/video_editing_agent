import { agentConfigs } from './agentConfig';

export interface Agent {
  id: string;
  name: string;
  description: string;
  creator: string;
  views: string;
  avatar: string;
  externalUrl?: string; // 新增字段，用于外部链接
}

// 从配置文件中导出智能体数据
export const agentsData: Agent[] = agentConfigs.map(config => ({
  id: config.id,
  name: config.name,
  description: config.description,
  creator: config.creator,
  views: config.views,
  avatar: config.avatar,
  externalUrl: config.externalUrl
}));