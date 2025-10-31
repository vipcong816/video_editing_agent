import React, { useEffect } from 'react';
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 检查是否已登录
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      toast.error('请先登录');
    } else {
      // 已登录状态下重定向到首页，因为功能已集成到首页
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return null;
};

export default Dashboard;