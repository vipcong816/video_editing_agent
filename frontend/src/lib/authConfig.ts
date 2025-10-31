/**
 * 认证系统配置
 * 包含登录、注册、用户角色权限等相关配置
 */

// 认证API端点配置
export const authApiConfig = {
  login: {
    url: 'http://192.168.42.175:8000/login/',
    method: 'POST',
    timeoutMs: 600000, // 10分钟
  },
  register: {
    url: 'http://192.168.42.175:8000/registerapi/',
    method: 'POST',
    timeoutMs: 600000, // 10分钟
  },
  logout: {
    url: 'http://192.168.42.175:8000/logout/',
    method: 'POST',
    timeoutMs: 600000, // 10分钟
  },
  updateEvaluation: {
    url: 'http://192.168.42.175:8000/update_evaluation/',
    method: 'POST',
    timeoutMs: 600000, // 10分钟
  },
  editAction: {
    url: 'http://192.168.42.175:8000/edit_action/',
    method: 'POST',
    timeoutMs: 600000, // 10分钟
  },
};

// 用户角色定义
export type UserRole = 'user' | 'editor' | 'admin';

// 用户角色配置
export const roleConfig = {
  // 普通用户
  user: {
    name: '用户',
    description: '普通用户角色，可以使用智能体和提交需求',
    permissions: {
      useAgents: true,
      submitRequests: true,
      viewDashboard: true,
      editOwnContent: true,
    },
    availableFeatures: [
      '智能体聊天',
      '需求提交',
      '个人中心',
    ],
    interfaceElements: {
      showRequestForm: true,
      showEditHistory: false,
      showContentEditor: true,
    },
  },
  // 编辑用户
  editor: {
    name: '剪辑师',
    description: '编辑角色，可以处理用户提交的请求和进行内容编辑',
    permissions: {
      useAgents: true,
      submitRequests: false,
      viewDashboard: true,
      manageRequests: true,
      editEvaluations: true,
    },
    availableFeatures: [
      '智能体聊天',
      '编辑工作台',
      '请求管理',
      '评价编辑',
    ],
    interfaceElements: {
      showRequestForm: false,
      showEditHistory: true,
      showContentEditor: false,
    },
  },
  // 管理员用户
  admin: {
    name: '管理员',
    description: '系统管理员，可以访问所有功能和管理用户',
    permissions: {
      useAgents: true,
      submitRequests: true,
      viewDashboard: true,
      manageRequests: true,
      editEvaluations: true,
      manageUsers: true,
      configureSystem: true,
    },
    availableFeatures: [
      '所有功能',
      '用户管理',
      '系统配置',
    ],
    interfaceElements: {
      showRequestForm: true,
      showEditHistory: true,
      showContentEditor: true,
      showUserManagement: true,
    },
  },
};

// 注册表单配置
export const registrationConfig = {
  fields: [
    {
      name: 'username',
      label: '用户名',
      required: true,
      minLength: 3,
      maxLength: 20,
      placeholder: '请输入用户名',
    },
    {
      name: 'password',
      label: '密码',
      required: true,
      minLength: 6,
      maxLength: 20,
      placeholder: '请输入密码',
      type: 'password',
    },
    {
      name: 'email',
      label: '邮箱',
      required: true,
      placeholder: '请输入邮箱',
      type: 'email',
      validation: (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
      errorMessage: '请输入有效的邮箱地址',
    },
    {
      name: 'group',
      label: '角色',
      required: true,
      type: 'select',
      options: [
        { value: '剪辑师', label: '剪辑师' },
        { value: '用户', label: '用户' },
      ],
      defaultValue: '剪辑师',
    },
  ],
};

// 登录表单配置
export const loginConfig = {
  fields: [
    {
      name: 'username',
      label: '用户名',
      required: true,
      placeholder: '请输入用户名',
    },
    {
      name: 'password',
      label: '密码',
      required: true,
      placeholder: '请输入密码',
      type: 'password',
    },
  ],
  rememberMe: {
    enabled: true,
    label: '记住我',
  },
};

// 获取角色配置
export const getRoleConfig = (role: UserRole | string | undefined) => {
  if (!role) return roleConfig.user;
  
  // 处理中文角色名称映射
  const roleMap: Record<string, UserRole> = {
    '用户': 'user',
    '剪辑师': 'editor',
    '管理员': 'admin',
  };
  
  const normalizedRole = roleMap[role] || (role as UserRole);
  
  return roleConfig[normalizedRole] || roleConfig.user;
};

// 检查用户是否有特定权限
export const hasPermission = (role: UserRole | string | undefined, permission: string): boolean => {
  const config = getRoleConfig(role);
  return config.permissions[permission as keyof typeof config.permissions] || false;
};

// 获取用户可用功能列表
export const getUserFeatures = (role: UserRole | string | undefined) => {
  const config = getRoleConfig(role);
  return config.availableFeatures;
};

// 检查界面元素是否应该显示
export const shouldShowElement = (role: UserRole | string | undefined, element: string): boolean => {
  const config = getRoleConfig(role);
  return config.interfaceElements[element as keyof typeof config.interfaceElements] || false;
};