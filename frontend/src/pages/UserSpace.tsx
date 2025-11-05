import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Send, Loader2, RefreshCw, X, Smile, Paperclip, Mic, MessageSquarePlus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { getAgentConfigById, generateProjectName } from '@/lib/agentConfig';

// 消息接口定义
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  isStreaming?: boolean;
  imageUrl?: string; // 用户上传的图片URL
  mediaUrl?: string; // 生成的媒体URL
  mediaType?: 'image' | 'video'; // 媒体类型
  downloadUrl?: string; // 下载链接
}

// 处理Markdown内容格式化，确保各种格式能被正确识别和渲染
const processMarkdownContent = (content: string): string => {
  // 处理标题格式，确保类似####3.这样的格式能被正确识别
  let processed = content
    // 确保标题后有空格
    .replace(/^(#{1,6})(\d*\.)(?!\s)/gm, '$1 $2 ');
    
  // 处理表格格式，确保表格能正确显示
  if (processed.includes('|')) {
    // 确保表格前后有换行，以便正确解析
    processed = processed.replace(
      /([^\n])(\|.*\|)([^\n])/g, 
      '$1\n$2\n$3'
    );
    
    // 尝试为缺失的表格分隔行插入分隔符
    const tableRows = processed.match(/(\|.*\|[\r\n]+)+/g);
    if (tableRows) {
      tableRows.forEach(table => {const lines = table.split('\n').filter(line => line.trim());
        if (lines.length >= 2) {
          // 检查第二行是否为分隔行
          const isSeparator = /^(\|\s*-+\s*)+\|$/.test(lines[1]) || lines[1].includes('|:-');
          if (!isSeparator) {
            // 计算表头单元格数量
            const headerCells = Math.max(0, lines[0].split('|').length - 2);
            // 创建默认分隔行
            const separatorLine = '|' + ':---|'.repeat(headerCells);
            // 插入分隔行
            const fixedTable = [lines[0], separatorLine, ...lines.slice(1)].join('\n');
            processed = processed.replace(table, fixedTable);
          }
        }
      });
    }
  }
  
  return processed;
};

  // 格式化消息历史为API需要的格式，最多保留三轮对话
  const formatMessagesForAPI = (messages: Message[]): Array<{ role: string; content: string }> => {
    // 最多保留三轮对话（每轮包含用户和助手的消息）
    const maxMessages = 6; // 3轮对话 * 2条消息/轮
    const recentMessages = messages.slice(-maxMessages);
    
    return recentMessages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
  };

   // 为小红书MCP智能体特殊处理消息格式
  const formatXiaohongshuMessage = (message: string, agentId: string): string => {
    // 如果是小红书MCP智能体，确保消息格式正确
    if (agentId === 'agent-xiaohongshu') {
      // 如果消息已经包含"xiaohongshu-mcp"，则直接返回
      if (message.includes('xiaohongshu-mcp')) {
        return message;
      }
      // 否则添加必要的前缀
      return message;
    }
    return message;
  };

// 智能体聊天页面组件
export default function Chat() {
  // 获取URL参数和导航功能
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 状态管理
  const [agentConfig, setAgentConfig] = useState(getAgentConfigById(id || ''));
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // 选中的图片
  const [isUploading, setIsUploading] = useState(false); // 图片上传状态
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image'); // 媒体类型选择
  const messagesEndRef = useRef<HTMLDivElement>(null); // 用于自动滚动到最新消息
  const abortControllerRef = useRef<AbortController | null>(null); // 用于取消请求

  // 根据URL参数加载对应的智能体配置
  useEffect(() => {
    if (!id) {
      navigate('/'); // 如果没有ID参数，导航回首页
      return;
    }
    
    const config = getAgentConfigById(id);
    if (!config) {
      navigate('/'); // 如果找不到对应的智能体，导航回首页
      return;
    }
    
    setAgentConfig(config);
    setMessages([]); // 重置消息列表
    
    // 重置媒体类型为配置中的默认值
    if (config.response.mediaType) {
      setMediaType(config.response.mediaType);
    }
  }, [id, navigate]);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 清理函数，组件卸载时取消所有未完成的请求
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 新建对话
  const handleNewChat = () => {
    setMessages([]); // 清空消息列表
    setInput(''); // 清空输入框
    setError(null); // 清空错误状态
    setSelectedImage(null); // 清空选中的图片
    
    // 如果有正在进行的请求，取消它
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setIsLoading(false);
    
    // 重置媒体类型为配置中的默认值
    if (agentConfig?.response.mediaType) {
      setMediaType(agentConfig.response.mediaType);
    }
  };

  // 处理发送消息
  const handleSendMessage = async () => {
    if (!agentConfig || (!input.trim() && !selectedImage) || isLoading) return;
    
    // 清空错误状态
    setError(null);
    
    // 添加用户消息到消息列表
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input.trim() || '请分析这张图片',
      sender: 'user',
      timestamp: new Date(),
      imageUrl: selectedImage // 如果有选中的图片，添加到消息中
    };
    
    // 更新消息列表
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // 清空输入框和选中的图片
    const userInput = input.trim();
    setInput('');
    setSelectedImage(null);
    
    // 设置加载状态
    setIsLoading(true);
    
    // 创建AI响应消息的初始状态
    const aiMessageId = `agent-${Date.now()}`;
    const aiMessage: Message = {
      id: aiMessageId,
      content: '',
      sender: 'agent',
      timestamp: new Date(),
      isStreaming: agentConfig.response.type === 'streaming' // 根据配置决定是否使用流式响应
    };
    
    // 添加AI消息到消息列表
    setMessages(prev => [...prev, aiMessage]);
    
    try {
      // 创建新的AbortController用于取消请求
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;
      
      // 获取智能体配置的URL或使用默认值
      const apiUrl = agentConfig.server.url || 'https://faoz1548337.vicp.fun/chat';
      
      // 为不同媒体类型设置不同的超时时间
      const timeoutMs = agentConfig.response.type === 'media' && mediaType === 'video' 
        ? 600000 // 视频生成设为10分钟
        : agentConfig.server.timeoutMs || 30000; // 其他情况设为30秒或配置的值
      
      // 创建超时Promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(
          agentConfig.response.type === 'media' && mediaType === 'video' 
            ? '视频生成超时，请稍后再试' 
            : '请求超时'
        )), timeoutMs);
      });
      
      // 构建消息历史，最多保留三轮对话
      const messagesHistory = formatMessagesForAPI(updatedMessages);
      
      // 根据智能体类型准备请求体数据
      let requestBody;
      
      switch (agentConfig.response.type) {
        case 'media':
          // 媒体生成智能体的请求体
          requestBody = JSON.stringify({ 
            prompt: userInput, 
            class: mediaType 
          });
          break;
          
        case 'jianying':
          // 自动剪辑智能体的请求体
          requestBody = JSON.stringify({ 
            messages: messagesHistory, 
            project_name: userInput || generateProjectName() 
          });
          break;
          
        default:
          // 其他类型智能体的请求体
          if (agentConfig.response.supportsImageUpload && selectedImage) {
            // 支持图片上传的智能体
            requestBody = JSON.stringify({ 
              text: userInput, 
              image_url: selectedImage 
            });
          } else {
            // 普通聊天智能体
            requestBody = JSON.stringify({ messages: messagesHistory });
            
            // 为小红书MCP智能体特殊处理请求
            if (agentConfig.id === 'agent-xiaohongshu') {
              // 使用指定的请求格式
              requestBody = JSON.stringify({ message: "查看登录情况使用 xiaohongshu-mcp。" });
            }
          }
      }
      
      // 同时处理fetch请求和超时
      const response: Response = await Promise.race([
        fetch(apiUrl, {
          method: agentConfig.server.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: requestBody,
          signal, // 用于取消请求
        }),
        timeoutPromise // 处理超时情况
      ]) as Response;
      
      // 检查响应状态
      if (!response.ok) {
        // 为常见状态码提供更具体的错误信息
        let errorMsg = `HTTP error! status: ${response.status}`;
        if (response.status === 403) errorMsg = '服务器拒绝访问，请检查权限';
        if (response.status === 404) errorMsg = '未找到聊天服务端点';
        if (response.status === 500) errorMsg = '服务器内部错误';
        if (response.status === 503) errorMsg = '服务暂时不可用，请稍后再试';
        throw new Error(errorMsg);
      }
      
      // 根据响应类型处理响应数据
      switch (agentConfig.response.type) {
        case 'media':
          // 处理媒体生成智能体的响应
          try {
            // 为视频生成添加特殊的加载提示
            if (mediaType === 'video') {
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { ...msg, content: '视频生成中，请稍候...这可能需要1-2分钟时间', isStreaming: true } 
                    : msg
                )
              );
            }
            
            const data = await response.json();
            
            // 验证响应数据格式
            if (data && data.url && data.type) {
              const content = `已为您${data.type === 'image' ? '成功生成图片' : '成功生成视频'}，点击下方链接下载`;
              const mediaUrl = data.url;
              const mediaType = data.type === 'image' ? 'image' : 'video';
              
              // 更新消息，包含媒体信息
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { ...msg, content, isStreaming: false, mediaUrl, mediaType } 
                    : msg
                )
              );
            } else {throw new Error('无效的媒体响应格式');
            }
          } catch (jsonError) {
            console.error('解析媒体响应失败:', jsonError);
            // 更新AI消息为错误状态
            setMessages(prev => 
              prev.map(msg => 
                msg.id === aiMessageId 
                  ? { ...msg, content: '生成媒体时解析响应失败，请重试。', isStreaming: false } 
                  : msg
              )
            );
          }
          break;
          
        case 'jianying':
          // 处理自动剪辑智能体的响应
          try {
            const data = await response.json();
            
            // 验证响应数据格式
            if (data) {
              // 提取content和download_url
              const content = data.content || '剪映项目已生成，请点击下方链接下载';
              const downloadUrl = data.download_url;
              
              // 更新消息，包含下载链接
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { ...msg, content, isStreaming: false, downloadUrl } 
                    : msg
                )
              );
            } else {
              throw new Error('无效的自动剪辑响应格式');
            }
          } catch (jsonError) {
            console.error('解析媒体响应失败:', jsonError);
            // 更新AI消息为错误状态
            setMessages(prev => 
              prev.map(msg => 
                msg.id === aiMessageId 
                  ? { ...msg, content: '生成媒体时解析响应失败，请重试。', isStreaming: false } 
                  : msg
              )
            );
          }
          break;
          
        case 'synchronous':
           // 处理同步API响应
           const data = await response.json();
           
           // 处理小红书MCP智能体的特殊响应格式
           if (agentConfig.id === 'agent-xiaohongshu') {
             // 直接使用output字段作为内容
             const content = data.output || '抱歉，没有收到有效的响应。';
             
             // 更新消息
             setMessages(prev => 
               prev.map(msg => 
                 msg.id === aiMessageId 
                   ? { ...msg, content, isStreaming: false } 
                   : msg
               )
             );
           } else {
             // 处理普通同步响应
             const content = data.response || '抱歉，没有收到有效的响应。';
             
             // 更新消息
             setMessages(prev => 
               prev.map(msg => 
                 msg.id === aiMessageId 
                   ? { ...msg, content, isStreaming: false } 
                   : msg
               )
             );
           }
          

          break;
          
        case 'streaming':
          // 处理流式 SSE 响应
          if (!response.body) {
            throw new Error('No response body');
          }
          
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let accumulatedContent = '';
          let buffer = ''; // 保存未完整的事件
          const retryDelay = 2000;
          let retryCount = 0;
          const maxRetries = 3;

          // 完成流处理的函数
          const finalizeStream = (doneFlag = false) => {
            // 当流结束或遇到 DONE 时把 isStreaming 设为 false
            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg
              )
            );
            if (!accumulatedContent && !doneFlag) {
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === aiMessageId ? { ...msg, content: '抱歉，没有收到有效的响应。' } : msg
                )
              );
            }
          };

          // 处理SSE事件的函数
          const handleSseEvent = (rawEvent: string) => {
            try {
              // 取出所有以 data: 开头的行并去掉前缀
              const lines = rawEvent.split(/\r?\n/);
              const dataLines = lines
                .filter(l => l.startsWith('data:'))
                .map(l => l.replace(/^data:\s?/, ''));

              if (dataLines.length === 0) return;

              // 不再 .trim() 整体，保留事件中原始的换行符，只有判断 DONE 时用 trim
              const eventData = dataLines.join('\n');

              // 结束标志（用 trim 判断以容错空白）
              if (eventData.trim() === '[DONE]') {
                finalizeStream(true);
                return '[DONE]';
              }

              // 后端示例直接发送 delta 文本（非 JSON），但可能包含转义的换行 \\n
              // 还原转义换行为真实换行
              let newText = '';

              try {
                const parsed = JSON.parse(eventData);
                // 兼容不同字段名
                newText = parsed.text ?? parsed.content ?? parsed.delta ?? '';
                if (typeof newText !== 'string') newText = JSON.stringify(parsed);
              } catch {
                // 不是 JSON，降级为原始字符串（并把转义换行还原）
                newText = eventData.replace(/\\n/g, '\n');
              }

              // 累加内容并更新显示（非常重要：保留换行以便 Markdown 能正确解析）
              if (newText) {
                accumulatedContent += newText;
                const display = processMarkdownContent(accumulatedContent);

                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === aiMessageId ? { ...msg, content: display } : msg
                  )
                );
              }
              return null;
            } catch (e) {
              console.error('handleSseEvent error:', e);
              return null;
            }
          };

          // 读取并按 SSE 事件分片处理
          const processStream = async () => {
            while (true) {
              try {
                const { done, value } = await reader.read();
                if (done) {
                  // 处理 buffer 中残留的事件
                  if (buffer) {
                    const r = handleSseEvent(buffer);
                    buffer = '';
                    if (r === '[DONE]') break;
                  }
                  break;
                }

                buffer += decoder.decode(value, { stream: true });

                // SSE 事件以双换行分隔（也支持 \r\n\r\n）
                const parts = buffer.split(/\r?\n\r?\n/);
                buffer = parts.pop() || '';

                for (const rawEvent of parts) {
                  const res = handleSseEvent(rawEvent);
                  if (res === '[DONE]') {
                    // 如果收到 DONE，则结束处理循环（后端已经发送结束）
                    return;
                  }
                }
              } catch (readErr: any) {
                if (readErr.name === 'AbortError') {
                  // 用户取消
                  finalizeStream();
                  return;
                }
                // 其他错误重试
                if (retryCount < maxRetries) {
                  retryCount++;
                  setError(`读取数据失败，正在重试(${retryCount}/${maxRetries})...`);
                  await new Promise(r => setTimeout(r, retryDelay));
                  continue;
                } else {
                  throw readErr;
                }
              }
            }
          };

          await processStream();

          // 最终确保流完成时把 isStreaming 设为 false
          finalizeStream();
          break;
      }
      
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error sending message:', err);
        
        // 为媒体生成智能体添加专门的错误处理
        if (agentConfig.response.type === 'media') {
          const errorMsg = err.message.includes('视频生成超时') 
            ? '视频生成超时，这是正常现象。视频生成通常需要1-2分钟，请稍后再试' 
            : '生成媒体失败，请重试';
            
          setError(errorMsg);
          
          // 更新AI消息为错误状态
          setMessages(prev => 
            prev.map(msg => 
              msg.id === aiMessageId 
                ? { 
                    ...msg, 
                    content: errorMsg === '视频生成超时，这是正常现象。视频生成通常需要1-2分钟，请稍后再试' 
                      ? errorMsg 
                      : '抱歉，生成媒体时遇到问题。请检查您的网络连接或稍后再试。', 
                    isStreaming: false 
                  } 
                : msg
            )
          );
        } else {
          let errorMessage = '发送消息失败，请重试';
          let userFriendlyMessage = '抱歉，我暂时无法响应您的请求。请稍后重试。';
          
          // 根据不同错误类型提供不同的错误消息
          if (err instanceof TypeError && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
            errorMessage = '网络连接错误，请检查您的网络设置';
            userFriendlyMessage = '网络连接似乎有问题，请检查您的网络设置后重试。';
          } else if (err.message.includes('404')) {
            errorMessage = 'API端点未找到 (404)';
            userFriendlyMessage = '服务暂时不可用，请稍后再试。';
          } else if (err.message.includes('500')) {
            errorMessage = '服务器内部错误 (500)';
            userFriendlyMessage = '服务器暂时遇到问题，请稍后再试。';
          } else if (err.message.includes('CORS')) {
            errorMessage = '跨域资源共享错误';
            userFriendlyMessage = '连接安全限制，请联系系统管理员。';
          } else if (err.message.includes('请求超时')) {
            errorMessage = '请求超时';
            userFriendlyMessage = '请求超时，请稍后再试。';
          }

          setError(errorMessage);
          
          // 更新AI消息为错误状态
          setMessages(prev => 
            prev.map(msg => 
              msg.id === aiMessageId 
                ? { ...msg, content: userFriendlyMessage, isStreaming: false } 
                : msg
            )
          );
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 处理重新连接
  const handleReconnect = () => {
    if (messages.length > 0 && messages[messages.length - 1].sender === 'agent') {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage.isStreaming) {
        setMessages(prev => prev.slice(0, -1));
      }
    }
    setError(null);
    handleSendMessage();
  };

  // 处理取消加载
  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    
    // 移除最后一条AI消息（如果正在流式传输）
    if (messages.length > 0 && messages[messages.length - 1].sender === 'agent') {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.isStreaming) {
        setMessages(prev => prev.slice(0, -1));
      }
    }
  };

  // 处理键盘回车发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !agentConfig?.response.supportsImageUpload) return;
    
    setIsUploading(true);
    
    // 在实际应用中，这里应该上传图片到服务器并获取URL
    // 这里为了演示，我们使用FileReader来获取本地预览URL
    const file = e.target.files[0];
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      setIsUploading(false);
      return;
    }
    
    // 检查文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB');
      setIsUploading(false);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('图片读取失败，请重试');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // 加载中状态显示
  if (!agentConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
          <p className="text-gray-600">加载智能体中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-200 py-3 px-4 shadow-sm z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                <img 
                  src={agentConfig.avatar} 
                  alt={agentConfig.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="font-bold text-gray-800 text-lg">{agentConfig.name}</h1>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                  <span className="text-xs text-gray-500">在线</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600">
              <Smile className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600">
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 消息区域 */}
      <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 欢迎消息 */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Smile className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">你好！我是{agentConfig.name}</h2>
              <p className="text-gray-600 max-w-md">{agentConfig.description}</p>
              <p className="text-gray-500 text-sm mt-4">开始输入消息与我交流吧</p>
            </div>
          )}

          {/* 消息列表 */}
          {messages.map((message) => (
            <div 
              key={message.id}
              className={cn(
                "flex flex-col",
                message.sender === "user" ? "items-end" : "items-start"
              )}
            >
              <div 
                className={cn(
                  "max-w-[80%] p-4 rounded-2xl shadow-sm",
                  message.sender === "user" 
                    ? "bg-purple-600 text-white rounded-tr-none" 
                    : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                )}
              >
                {/* 显示用户上传的图片 */}
                {message.imageUrl && message.sender === 'user' && (
                  <div className="mb-3 rounded-lg overflow-hidden">
                    <img 
                      src={message.imageUrl} 
                      alt="用户上传的图片" 
                      className="w-full h-auto max-h-80 object-contain"
                    />
                  </div>
                )}
                
                {/* 根据发送者显示不同的消息内容 */}
                {message.sender === 'agent' ? (
                  // AI消息使用ReactMarkdown渲染支持Markdown格式
                  <ReactMarkdown 
                    className={cn(
                      "prose dark:prose-invert max-w-none text-base",
                      message.isStreaming ? "animate-pulse" : ""
                    )}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {processMarkdownContent(message.content) || "正在思考..."}
                  </ReactMarkdown>
                ) : (
                  // 用户消息直接显示纯文本
                  <p className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </p>
                )}
                
                {/* 显示媒体下载链接 */}
                {message.mediaUrl && (
                  <div className="mt-3">
                    <a 
                      href={message.mediaUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors"
                    >
                      <i className="fas fa-download mr-2"></i>
                      下载{message.mediaType === 'image' ? '图片' : '视频'}
                    </a>
                    
                    {/* 预览生成的媒体 */}
                    <div className="mt-3">
                      {message.mediaType === 'image' ? (
                        <img 
                          src={message.mediaUrl} 
                          alt="生成的图片" 
                          className="max-w-full h-auto rounded-lg border border-gray-200"
                        />
                      ) : (
                        <video 
                          controls 
                          src={message.mediaUrl} 
                          className="max-w-full h-auto rounded-lg border border-gray-200"
                        />
                      )}
                    </div>
                  </div>
                )}
                
                {/* 显示剪映项目下载链接 */}
                {message.downloadUrl && (
                  <div className="mt-3">
                    <a 
                      href={message.downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors"
                    >
                      <i className="fas fa-download mr-2"></i>
                      下载剪映项目
                    </a>
                  </div>
                )}
                
                {/* 加载中指示器 */}
                {message.isStreaming && message.sender === "agent" && (
                  <div className="flex items-center mt-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500 mr-2" />
                    <span className="text-xs text-gray-400">
                      {agentConfig.response.type === 'media' && mediaType === 'video' 
                        ? '视频生成中，可能需要1-2分钟...' 
                        : 'AI正在思考...'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <X className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
              <button 
                onClick={handleReconnect}
                className="text-xs text-purple-600 hover:underline flex items-center"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                重试
              </button>
            </div>
          )}

          {/* 滚动锚点 - 用于自动滚动到最新消息 */}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 输入区域 */}
      <footer className="bg-white border-t border-gray-200 p-3 shadow-inner">
        <div className="max-w-2xl mx-auto">
          {/* 选中的图片预览 - 放在左侧 */}
          {selectedImage && (
            <div className="mb-3 ml-2">
              <div className="inline-block bg-white rounded-lg shadow-lg p-2 border border-gray-200 max-w-[200px]">
                <div className="relative">
                  <img 
                    src={selectedImage} 
                    alt="预览" 
                    className="w-full h-auto max-h-32 object-contain"
                  />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center"
                    aria-label="删除图片"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={agentConfig.ui.placeholder}
                className="w-full p-3 pr-12 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none min-h-[50px] max-h-[150px]"
              />
              
              {/* 输入框图标 */}
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Smile className="w-5 h-5" />
                </button>
                
                {/* 图片上传按钮 - 只对支持图片上传的智能体显示 */}
                {agentConfig.response.supportsImageUpload && (
                  <label className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
                    <Paperclip className="w-5 h-5" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                      disabled={isUploading || isLoading}
                    />
                  </label>
                )}
                
                {/* 媒体类型选择 - 只对生成媒体助手显示 */}
                {agentConfig.response.type === 'media' && (
                  <div className="flex items-center ml-2">
                    <span className="text-xs text-gray-500 mr-2">生成:</span>
                    <button
                      onClick={() => setMediaType('image')}
                      className={`px-2 py-1 text-xs rounded-md ${mediaType === 'image' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'} transition-colors mr-1`}
                    >
                      图片
                    </button>
                    <button
                      onClick={() => setMediaType('video')}
                      className={`px-2 py-1 text-xs rounded-md ${mediaType === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'} transition-colors`}
                    >
                      视频
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* 停止输出按钮 - 只在加载时显示 */}
            {isLoading && (
              <button
                onClick={handleCancel}
                className="p-3 rounded-full shadow-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                aria-label="停止输出"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            
            {/* 新建对话按钮 */}
            <button 
              onClick={handleNewChat}
              className="p-3 rounded-full shadow-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              title="新建对话"
            >
              <MessageSquarePlus className="w-5 h-5" />
            </button>
            
            {/* 发送按钮 */}
            <button
              onClick={handleSendMessage}
              disabled={(!input.trim() && !selectedImage) || isLoading}
              className={cn(
                "p-3 rounded-full shadow-md transition-all duration-200",
                ((input.trim() || selectedImage) && !isLoading)
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <p className="text-xs text-gray-400 text-center mt-2">
            发送即表示您同意我们的服务条款和隐私政策
          </p>
        </div>
      </footer>
    </div>
  );
}