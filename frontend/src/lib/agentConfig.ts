// 智能体配置接口定义
export interface AgentConfig {
  // 基本信息
  id: string;
  name: string;
  description: string;
  creator: string;
  views: string;
  avatar: string;
  externalUrl?: string; // 外部链接
  
  // 服务端配置
  server: {
    url: string; // API端点
    method?: 'GET' | 'POST'; // 请求方法
    timeoutMs?: number; // 超时时间
  };
  
  // 响应方式配置
  response: {
    type: 'streaming' | 'synchronous' | 'media' | 'jianying'; // 响应类型
    mediaType?: 'image' | 'video'; // 媒体类型（仅当type为media时有效）
    supportsImageUpload?: boolean; // 是否支持图片上传
    requiresProjectName?: boolean; // 是否需要生成项目名称
  };
  
  // UI配置
  ui: {
    placeholder: string; // 输入框占位符
    welcomeMessage?: string; // 欢迎消息
  };
}

// 所有智能体的配置数组
export const agentConfigs: AgentConfig[] = [
  // {
  //   id: 'agent-1',
  //   name: '智能剪辑',
  //   description: '专业视频剪辑助手，为你提供精准的剪辑建议和视频制作方案',
  //   creator: '视频制作团队',
  //   views: '2544',
  //   avatar: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Video%20editing%20software%20interface%20with%20timeline%20and%20media%20clips%20for%20AI%20editing%20assistant&sign=acc597e2b464177c155f57296a729ab7',
  //   server: {
  //     url: 'http://127.0.0.1:8001/chat',
  //     method: 'POST',
  //     timeoutMs: 30000
  //   },
  //   response: {
  //     type: 'streaming',
  //     supportsImageUpload: false
  //   },
  //   ui: {
  //     placeholder: '输入消息...',
  //     welcomeMessage: '你好！我是智能剪辑助手，专业视频剪辑助手，为你提供精准的剪辑建议和视频制作方案。'
  //   }
  // },
  {
    id: 'agent-xiaohongshu',
    name: '小红书mcp',
    description: '小红书智能助手，帮您管理小红书账号和内容',
    creator: '平台技术团队',
    views: '1234',
    avatar: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Xiaohongshu%20social%20media%20platform%20icon%20with%20red%20color%20theme&sign=761b8c71f4b280d179dcee39d492dcaa',
    server: {
      url: 'http://127.0.0.1:5678/webhook/bf2365d6-fd8d-48d9-9f38-5afce0034df9',
      method: 'POST',
      timeoutMs: 30000
    },
    response: {
      type: 'synchronous',
      supportsImageUpload: false
    },
    ui: {
      placeholder: '请输入命令，例如"查看登录情况使用 xiaohongshu-mcp"',
      welcomeMessage: '欢迎使用小红书智能助手！您可以使用我来管理您的小红书账号和内容。'
    }
  },
  // {
  //   id: 'agent-vision',
  //   name: '视觉问答助手',
  //   description: '上传图片并提问，让AI分析图片内容并给出详细回答',
  //   creator: 'AI视觉团队',
  //   views: '1890',
  //   avatar: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=AI%20vision%20assistant%20with%20image%20analysis%20capabilities&sign=1b4d3333c20879a16c878f4eb3c8bdde',
  //   server: {
  //     url: 'http://127.0.0.1:8001/chat_image',
  //     method: 'POST',
  //     timeoutMs: 30000
  //   },
  //   response: {
  //     type: 'streaming',
  //     supportsImageUpload: true
  //   },
  //   ui: {
  //     placeholder: '上传图片并输入问题...'
  //   }
  // },
  // {
  //   id: 'agent-media',
  //   name: '生成媒体助手',
  //   description: '根据提示词生成图片或视频，并提供下载功能',
  //   creator: '媒体生成团队',
  //   views: '1567',
  //   avatar: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=AI%20media%20generation%20with%20images%20and%20videos%20creation%20capabilities&sign=0df53e9cc6abeb7d7ffb2012e0e8fc92',
  //   server: {
  //     url: 'http://127.0.0.1:8001/gen_media',
  //     method: 'POST',
  //     timeoutMs: 180000 // 视频生成需要更长时间，设置为3分钟
  //   },
  //   response: {
  //     type: 'media',
  //     mediaType: 'image', // 默认生成图片
  //     supportsImageUpload: false
  //   },
  //   ui: {
  //     placeholder: '输入您想要生成的图片或视频的描述...'
  //   }
  // },
  // {
  //   id: 'agent-jianying',
  //   name: '自动剪辑',
  //   description: '自动生成剪映项目，快速创建专业视频剪辑方案',
  //   creator: '视频工具团队',
  //   views: '1200',
  //   avatar: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Automatic%20video%20editing%20software%20interface%20with%20editing%20tools%20and%20project%20generation&sign=0b4fdafe3be10f9febba54bd7baa0bdb',
  //   server: {
  //     url: 'http://127.0.0.1:8001/chat_jianying',
  //     method: 'POST',
  //     timeoutMs: 600000 // 10分钟
  //   },
  //   response: {
  //     type: 'jianying',
  //     supportsImageUpload: false,
  //     requiresProjectName: true
  //   },
  //   ui: {
  //     placeholder: '输入您想要生成的剪映项目描述...'
  //   }
  // }
];

// 根据ID获取智能体配置的工具函数
export const getAgentConfigById = (id: string): AgentConfig | undefined => {
  return agentConfigs.find(config => config.id === id);
};

// 获取所有智能体配置的工具函数
export const getAllAgentConfigs = (): AgentConfig[] => {
  return agentConfigs;
};

// 生成随机的项目名称（用于自动剪辑智能体）
export const generateProjectName = (): string => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000);
  return `project_${timestamp}_${randomNum}`;
};