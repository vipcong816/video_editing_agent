# log_viewer.py
import re
import pandas as pd
import streamlit as st
import plotly.express as px
import os

# ----------------------
# 页面标题
# ----------------------
st.set_page_config(page_title="日志可视化", layout="wide")
st.title("🧩 Python 日志可视化工具")

# ----------------------
# 侧边栏 - 文件选择
# ----------------------
st.sidebar.header("日志文件选择")

log_dir = "logs"  # 可修改为你的日志目录
uploaded_file = st.sidebar.file_uploader("上传日志文件", type=["log", "txt"])
log_file = None

if uploaded_file is not None:
    log_file = uploaded_file
else:
    if os.path.exists(log_dir):
        log_files = [f for f in os.listdir(log_dir) if f.endswith(".log") or f.endswith(".txt")]
        if log_files:
            selected_log = st.sidebar.selectbox("或选择现有日志文件", log_files)
            log_file = os.path.join(log_dir, selected_log)
        else:
            st.sidebar.warning("日志目录中未找到日志文件。")
    else:
        st.sidebar.warning(f"日志目录 {log_dir} 不存在。")

if not log_file:
    st.info("请先上传或选择一个日志文件。")
    st.stop()

# ----------------------
# 日志解析正则（适配新日志格式）
# 示例行：
# 2025-10-20 14:54:16,219 INFO server.py 220 生成任务: 星球大战, 类型: image
# ----------------------
pattern = re.compile(
    r"(?P<time>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d+)\s+"
    r"(?P<level>\w+)\s+"
    r"(?P<module>[\w\.]+)\s+"
    r"(?P<line>\d+)\s+"
    r"(?P<message>.*)"
)

# ----------------------
# 读取并解析日志
# ----------------------
data = []

try:
    # 上传文件情况
    if not isinstance(log_file, str):
        content = log_file.read()
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            text = content.decode("gbk", errors="ignore")
        lines = text.splitlines()
    else:
        with open(log_file, "r", encoding="utf-8") as f:
            lines = f.readlines()

    # 解析日志
    for line in lines:
        match = pattern.search(line)
        if match:
            data.append(match.groupdict())

except Exception as e:
    st.error(f"读取日志文件失败：{e}")
    st.stop()

if not data:
    st.error("日志解析失败，请检查日志格式！")
    st.stop()

# ----------------------
# 构建 DataFrame
# ----------------------
df = pd.DataFrame(data)
df['time'] = pd.to_datetime(df['time'], errors='coerce')
df = df.dropna(subset=['time'])
df['line'] = df['line'].astype(int)

# ----------------------
# 侧边栏筛选
# ----------------------
st.sidebar.header("筛选条件")

levels = st.sidebar.multiselect("日志级别", options=df['level'].unique(), default=list(df['level'].unique()))
modules = st.sidebar.multiselect("模块", options=df['module'].unique(), default=list(df['module'].unique()))

start_time = st.sidebar.date_input("开始日期", df['time'].min().date())
end_time = st.sidebar.date_input("结束日期", df['time'].max().date())
keyword = st.sidebar.text_input("搜索关键词")

# ----------------------
# 数据过滤
# ----------------------
filtered_df = df[
    (df['level'].isin(levels)) &
    (df['module'].isin(modules)) &
    (df['time'].dt.date >= start_time) &
    (df['time'].dt.date <= end_time)
]

if keyword:
    filtered_df = filtered_df[filtered_df['message'].str.contains(keyword, case=False, na=False)]

# ----------------------
# 展示数据表格
# ----------------------
st.subheader("📋 日志表格")
st.dataframe(filtered_df, use_container_width=True)

# ----------------------
# 日志数量随时间变化
# ----------------------
st.subheader("📈 日志数量随时间变化")
if not filtered_df.empty:
    df_count = filtered_df.set_index('time').resample('T').size()
    fig = px.line(df_count, title="日志数量随时间变化", labels={"value": "数量", "time": "时间"})
    st.plotly_chart(fig, use_container_width=True)
else:
    st.info("没有符合筛选条件的日志数据")

# ----------------------
# 日志级别分布
# ----------------------
st.subheader("📊 日志级别分布")
if not filtered_df.empty:
    level_count = filtered_df['level'].value_counts().reset_index()
    level_count.columns = ["level", "count"]
    fig2 = px.bar(level_count, x="level", y="count", title="日志级别分布", text="count")
    st.plotly_chart(fig2, use_container_width=True)
else:
    st.info("没有符合筛选条件的日志数据")
