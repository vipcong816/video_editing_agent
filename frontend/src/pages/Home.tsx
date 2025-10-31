import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Banner from "../components/Banner";
import CategoryTabs from "../components/CategoryTabs";
import AgentList from "../components/AgentList";
import { useTheme } from "../hooks/useTheme";
import { popularAgents, trendingAgents } from "../lib/mockData";
import { useAuth } from "../contexts/authContext";
import { authApiConfig, getRoleConfig, shouldShowElement } from "../lib/authConfig";
import { toast } from "sonner";

// 首页组件，根据用户登录状态显示不同内容
export default function Home() {
    // 使用主题Hook管理深色/浅色模式
    const {
        isDark
    } = useTheme();

    // 使用认证Hook获取用户认证状态和信息
    const {
        isAuthenticated,
        userInfo,
        setUserInfo
    } = useAuth();

    // 临时状态，用于编辑评价和内容
    const [tempEvaluation, setTempEvaluation] = useState("");
    const [tempContent, setTempContent] = useState("");
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [editingRequest, setEditingRequest] = useState<number | null>(null);

    // 日期格式化函数
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            // 格式化日期为本地时间显示
            return new Intl.DateTimeFormat("zh-CN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            }).format(date);
        } catch {
            return dateString; // 格式化失败时返回原始字符串
        }
    };

      const handleEditEvaluation = (requestId: number, currentEvaluation: string) => {
          setEditingRequest(requestId);
          setTempEvaluation(currentEvaluation);
      };

  const handleSaveEvaluation = async (requestId: number) => {
           try {
               const response = await fetch(authApiConfig.updateEvaluation.url, {
                   method: authApiConfig.updateEvaluation.method,
                   headers: {
                       "Content-Type": "application/json"
                   },
                  body: JSON.stringify({
                      username: userInfo.username,
                      id: requestId,
                      evaluation: tempEvaluation
                  })
              });

              if (!response.ok) {
                  throw new Error("更新失败");
              }

              const data = await response.json();

              setUserInfo({
                  ...userInfo,
                  editRequests: userInfo.editRequests?.map(req => req.id === requestId ? {
                      ...req,
                      evaluation: data.edit_request.evaluation
                  } : req)
              });

              setEditingRequest(null);
              setTempEvaluation("");
              toast.success("更新成功");
          } catch (error) {
              toast.error(error instanceof Error ? error.message : "更新失败，请稍后重试");
              console.error("Update evaluation error:", error);
          }
      };

      const handleCancelEdit = () => {
          setEditingRequest(null);
          setTempEvaluation("");
      };

      const handleStartEditContent = () => {
          if (userInfo.content && userInfo.content["需求提交"]) {
              setTempContent(userInfo.content["需求提交"]);
              setIsEditingContent(true);
          }
      };

  const handleSaveContent = async () => {
           try {
               const response = await fetch(authApiConfig.editAction.url, {
                   method: authApiConfig.editAction.method,
                   headers: {
                       "Content-Type": "application/json"
                   },
                  body: JSON.stringify({
                      user: userInfo.username,
                      content: tempContent
                  })
              });

              if (!response.ok) {
                  throw new Error("提交失败");
              }

              const data = await response.json();

              setUserInfo({
                  ...userInfo,
                  content: {
                      "需求提交": data.content
                  }
              });

              setIsEditingContent(false);
              setTempContent("");
              toast.success("提交成功");
          } catch (error) {
              toast.error(error instanceof Error ? error.message : "提交失败，请稍后重试");
              console.error("Submit content error:", error);
          }
      };

      const handleCancelContentEdit = () => {
          setIsEditingContent(false);
          setTempContent("");
      };

      return (
          <div
              className={`flex min-h-screen flex-col ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
              <Header />
              
              {!isAuthenticated ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                  <div
                      className="w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center mb-6">
                      <i className="fas fa-robot text-purple-500 text-6xl"></i>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    欢迎来到智能剪辑<span style={{fontSize: "1.5rem"}}>平台</span><br/>
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">
                    登录后即可体验我们的智能体服务，获取个性化的AI助手支持
                  </p>
                  <div className="flex flex-col gap-4 items-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                          <></>
                          <></>
                          <></>
                      </div>
                  </div>
                </div>
              ) : (
                <>
                  <Banner />
                  <CategoryTabs />
                  <div className="flex-1 p-6 overflow-y-auto">
                      {/* 添加装饰性图像元素 - 顶部 */}
                      <div className="relative mb-10 py-8 px-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full">
                          <img 
                            src="https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Abstract%20AI%20technology%20background%20with%20digital%20circuit%20lines%20and%20glowing%20purple%20blue%20particles&sign=c1c78eb85ff6888369db849ba4bdfc3d"
                            alt="AI Technology Background" 
                            className="w-full h-full object-cover opacity-20 dark:opacity-10"
                          />
                        </div>
                        <div className="relative z-10 text-center">
                          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">探索AI的无限可能</h2>
                          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            我们的智能体平台集成了最先进的AI技术，为您提供全方位的智能服务体验。从视频剪辑到内容创作，从图像处理到智能对话，满足您的各种需求。
                          </p>
                        </div>
                      </div>
                      
                       <AgentList title="热门" agents={popularAgents} showMore={true} />
                      
                      {/* 添加更多图像元素 - 底部装饰 */}
                      <div className="mt-12 mb-8 relative">
                        <img 
                          src="https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Team%20collaboration%20on%20AI%20projects%20with%20creative%20people%20working%20together&sign=299e8d1539983951b6d6edb469d238b4"
                          alt="Team Collaboration"
                          className="w-full h-64 object-cover rounded-xl shadow-lg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl flex items-end">
                          <div className="p-6 text-white">
                            <h3 className="text-xl font-bold mb-2">加入我们的创作者社区</h3>
                            <p className="text-white/80">与全球创作者一起分享经验，探索AI技术的新边界</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-10">
                           <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                               {getRoleConfig(userInfo.role).name === "剪辑师" ? "编辑工作台" : "个人中心"}
                           </h2>
                           
                           {shouldShowElement(userInfo.role, 'showEditHistory') && userInfo.editRequests && userInfo.editRequests.length > 0 && (
                             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                               <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">编辑请求列表</h3>
                              <div className="space-y-4">
                                  {userInfo.editRequests.map(request => (
                                    <div
                                      key={request.id}
                                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                                      <div className="flex justify-between items-start mb-2">
                                          <div>
                                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">用户：</span>
                                              <span className="text-sm text-gray-800 dark:text-white">{request.username}</span>
                                          </div>
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                              {formatDate(request.created_at)}
                                          </span>
                                      </div>
                                      <div className="mb-3">
                                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">内容：</p>
                                          <p className="text-sm text-gray-800 dark:text-white whitespace-pre-wrap">{request.content}</p>
                                      </div>
                                      <div>
                                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">评价：</p>
                                          {editingRequest === request.id ? (
                                            <div className="space-y-2">
                                              <textarea
                                                  value={tempEvaluation}
                                                  onChange={e => setTempEvaluation(e.target.value)}
                                                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
                                                  placeholder="请输入评价内容" />
                                              <div className="flex justify-end gap-2">
                                                  <button
                                                      onClick={handleCancelEdit}
                                                      className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">取消
                                                  </button>
                                                  <button
                                                      onClick={() => handleSaveEvaluation(request.id)}
                                                      className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">保存
                                                  </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="flex justify-between items-start">
                                              <p className="text-sm text-gray-800 dark:text-white whitespace-pre-wrap">{request.evaluation}</p>
                                              <button
                                                  onClick={() => handleEditEvaluation(request.id, request.evaluation)}
                                                  className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors ml-2">编辑
                                              </button>
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                          
                          {shouldShowElement(userInfo.role, 'showRequestForm') && userInfo.content && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                              <div className="flex justify-between items-center mb-4">
                                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">需求提交</h3>
                                  {shouldShowElement(userInfo.role, 'showContentEditor') && !isEditingContent && (
                                    <button
                                      onClick={handleStartEditContent}
                                     className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">编辑
                                   </button>
                                 )}
                              </div>
                              {isEditingContent ? (
                                <div className="space-y-3">
                                  <textarea
                                      value={tempContent}
                                      onChange={e => setTempContent(e.target.value)}
                                      className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]"
                                      placeholder="请输入您的需求" />
                                  <div className="flex justify-end gap-2">
                                      <button
                                          onClick={handleCancelContentEdit}
                                          className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">取消
                                      </button>
                                      <button
                                          onClick={handleSaveContent}
                                          className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">提交
                                      </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                  <p className="text-gray-800 dark:text-white whitespace-pre-wrap">
                                      {userInfo.content["需求提交"] || "暂无需求提交"}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {(shouldShowElement(userInfo.role, 'showEditHistory') && (!userInfo.editRequests || userInfo.editRequests.length === 0) || 
                             shouldShowElement(userInfo.role, 'showRequestForm') && !userInfo.content) && (
                             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
                               <div
                                   className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                   <i className="fas fa-inbox text-gray-400 text-xl"></i>
                               </div>
                               <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                                   {getRoleConfig(userInfo.role).name === "剪辑师" ? "暂无编辑请求" : "暂无需求提交"}
                               </h3>
                              <p className="text-gray-600 dark:text-gray-400">
                                  {userInfo.role === "editor" ? "当有新的编辑请求时，将会显示在这里" : "点击\"编辑\"按钮提交您的需求"}
                              </p>
                            </div>
                          )}
                      </div>
                  </div>
                </>
              )}
          </div>
      );
  }