# -*- coding: utf-8 -*-
"""
FastAPI 多功能服务端 (带日志系统)
包含：
1. 流式聊天接口 /chat
2. 非流式聊天接口 /chat_sync
3. 图文问答接口 /chat_image
4. 通用多媒体生成接口 /gen_media
5. 剪映工程自动生成接口 /chat_jianying
"""

import os
import json
import time
import shutil
import tempfile
import traceback
import logging
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from openai import OpenAI

# ========================
# 全局配置
# ========================
API_KEY = os.environ.get("BIGMODEL_API_KEY")
if not API_KEY:
    raise ValueError("环境变量 BIGMODEL_API_KEY 未设置，请在系统中配置 API Key。")
BASE_URL = "https://open.bigmodel.cn/api/paas/v4"
LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(LOG_DIR, exist_ok=True)

# 剪映工程根目录
JIAN_YING_PATH = r"D:\JianyingPro Drafts"
TEMP_DOWNLOAD_DIR = os.path.join(tempfile.gettempdir(), "jianying_downloads")
os.makedirs(TEMP_DOWNLOAD_DIR, exist_ok=True)
DOWNLOAD_BASE_URL = "http://127.0.0.1:8000/downloads"

# ========================
# 日志系统
# ========================
class AppLogger:
    def __init__(self, moduleName, logfile=None):
        self._logger = logging.getLogger(moduleName)
        fmt = "%(asctime)-15s %(levelname)s %(filename)s %(lineno)d %(message)s"
        formatter = logging.Formatter(fmt)
        self._logger.handlers.clear()

        if logfile:
            handler = logging.FileHandler(logfile, encoding="utf-8")
        else:
            handler = logging.StreamHandler()

        handler.setFormatter(formatter)
        self._logger.addHandler(handler)
        self._logger.setLevel(logging.INFO)

        self.info = self._logger.info
        self.error = self._logger.error
        self.warning = self._logger.warning
        self.debug = self._logger.debug


# 初始化日志器
chat_logger = AppLogger("chat", os.path.join(LOG_DIR, "chat.log"))
media_logger = AppLogger("media", os.path.join(LOG_DIR, "media.log"))
jianying_logger = AppLogger("jianying", os.path.join(LOG_DIR, "jianying.log"))

# ========================
# FastAPI 初始化
# ========================
app = FastAPI(title="Multi-Service FastAPI Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(base_url=BASE_URL, api_key=API_KEY)

# ========================
# 1. 流式聊天接口
# ========================
@app.post("/chat")
async def chat(request: Request):
    """
    流式聊天接口
    CMD 示例：
    curl -N -X POST "http://127.0.0.1:8000/chat" ^
         -H "Content-Type: application/json" ^
         -d "{\"messages\":[{\"role\":\"user\",\"content\":\"你好\"}]}"
    """
    body = await request.json()
    messages = body.get("messages", [])
    chat_logger.info(f"请求消息: {messages}")

    if not messages:
        return JSONResponse({"error": "messages不能为空"}, status_code=400)

    def stream_content():
        try:
            res = client.chat.completions.create(
                model="GLM-4.5-Flash",
                messages=messages,
                stream=True,
                extra_body={"thinking": {"type": "disabled"},
                            "chat_template_kwargs": {"enable_thinking": False}},
            )

            for chunk in res:
                delta = getattr(chunk.choices[0].delta, "content", None)
                if delta:
                    payload = json.dumps({"text": delta}, ensure_ascii=False)
                    yield f"data: {payload}\n\n"

            yield "data: [DONE]\n\n"
        except Exception as e:
            chat_logger.error(traceback.format_exc())
            yield f"data: [ERROR] {str(e)}\n\n"

    return StreamingResponse(stream_content(), media_type="text/event-stream")


# ========================
# 2. 非流式聊天接口
# ========================
@app.post("/chat_sync")
async def chat_sync(request: Request):
    """
    非流式聊天接口
    CMD 示例：
    curl -X POST "http://127.0.0.1:8000/chat_sync" ^
         -H "Content-Type: application/json" ^
         -d "{\"messages\":[{\"role\":\"user\",\"content\":\"你好\"}]}"
    """
    body = await request.json()
    messages = body.get("messages", [])
    chat_logger.info(f"非流式消息: {messages}")

    if not messages:
        return JSONResponse({"error": "messages不能为空"}, status_code=400)

    try:
        res = client.chat.completions.create(
            model="GLM-4.5-Flash",
            messages=messages,
            stream=False,
            extra_body={"thinking": {"type": "disabled"},
                        "chat_template_kwargs": {"enable_thinking": False}},
        )
        content = res.choices[0].message.content
        chat_logger.info(f"返回内容: {content}")
        return JSONResponse({"response": content})
    except Exception as e:
        chat_logger.error(traceback.format_exc())
        return JSONResponse({"error": str(e)}, status_code=500)


# ========================
# 3. 图文问答接口
# ========================
@app.post("/chat_image")
async def chat_image(request: Request):
    """
    图文问答接口
    CMD 示例：
    curl -N -X POST "http://127.0.0.1:8000/chat_image" ^
         -H "Content-Type: application/json" ^
         -d "{\"text\":\"图片上有什么?\",\"image_url\":\"https://example.com/test.png\"}"
    """
    body = await request.json()
    text = body.get("text")
    image_url = body.get("image_url")
    chat_logger.info(f"图文请求: text={text}, image={image_url}")

    if not text or not image_url:
        return JSONResponse({"error": "text和image_url不能为空"}, status_code=400)

    def stream_content():
        try:
            response = client.chat.completions.create(
                model="GLM-4V-Flash",
                messages=[{"role": "user", "content": [
                    {"type": "image_url", "image_url": {"url": image_url}},
                    {"type": "text", "text": text},
                ]}],
                stream=True,
            )
            for chunk in response:
                delta = getattr(chunk.choices[0].delta, "content", None)
                if delta:
                    payload = json.dumps({"text": delta}, ensure_ascii=False)
                    yield f"data: {payload}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            chat_logger.error(traceback.format_exc())
            yield f"data: [ERROR] {str(e)}\n\n"

    return StreamingResponse(stream_content(), media_type="text/event-stream")


# ========================
# 4. 通用多媒体生成接口
# ========================
@app.post("/gen_media")
async def gen_media(request: Request):
    """
    通用图像/视频生成接口
    CMD 示例：
    curl -X POST "http://127.0.0.1:8000/gen_media" ^
         -H "Content-Type: application/json" ^
         -d "{\"prompt\":\"星际穿越 黑洞\",\"class\":\"image\"}"
    """
    body = await request.json()
    prompt = body.get("prompt")
    media_class = body.get("class")
    media_logger.info(f"生成任务: {prompt}, 类型: {media_class}")

    if not prompt or not media_class:
        return JSONResponse({"error": "prompt 和 class 不能为空"}, status_code=400)

    try:
        if media_class.lower() == "image":
            completion = client.images.generate(
                model="Cogview-3-Flash",
                prompt=prompt,
                size="1024x1024",
            )
            url = completion.data[0].url
            media_logger.info(f"生成图像: {url}")
            return JSONResponse({"type": "image", "url": url})

        elif media_class.lower() == "video":
            from zai import ZhipuAiClient
            zclient = ZhipuAiClient(api_key=API_KEY)
            response = zclient.videos.generations(
                model="CogVideoX-Flash",
                prompt=prompt,
                quality="quality",
                with_audio=True,
                size="1920x1080",
                fps=30,
                watermark_enabled=False,
            )

            video_id = response.id
            media_logger.info(f"视频任务开始 ID: {video_id}")

            timeout, interval, elapsed = 300, 5, 0
            while elapsed < timeout:
                result = zclient.videos.retrieve_videos_result(id=video_id)
                status = getattr(result, "task_status", None)
                media_logger.info(f"任务状态: {status}")

                if status == "SUCCESS":
                    url = result.video_result[0].url
                    media_logger.info(f"视频生成成功: {url}")
                    return JSONResponse({"type": "video", "url": url})
                elif status in ("FAILURE", "FAILED"):
                    return JSONResponse({"error": "视频生成失败"}, status_code=500)
                time.sleep(interval)
                elapsed += interval

            return JSONResponse({"error": "超时，视频生成未完成"}, status_code=504)
        else:
            return JSONResponse({"error": "class 必须为 image 或 video"}, status_code=400)

    except Exception as e:
        media_logger.error(traceback.format_exc())
        return JSONResponse({"error": f"生成异常: {str(e)}"}, status_code=500)


# ========================
# 5. 剪映工程生成接口
# ========================
import pyJianYingDraft as draft
from pyJianYingDraft import IntroType, TransitionType, FilterType, MaskType, trange, tim
import pyttsx3
from pydub import AudioSegment
app.mount("/downloads", StaticFiles(directory=TEMP_DOWNLOAD_DIR), name="downloads")

@app.post("/chat_jianying")
async def chat_jianying(request: Request):
    """
    剪映工程自动生成接口（固定素材本地化）
    CMD 示例：
    curl -X POST "http://127.0.0.1:8000/chat_jianying" ^
         -H "Content-Type: application/json" ^
         -d "{\"project_name\":\"demo_three\"}"
    """
    try:
        body = await request.json()
        project_name = body.get("project_name", "demo_three")
        jianying_logger.info(f"生成项目: {project_name}")

        client = OpenAI(base_url=BASE_URL, api_key=API_KEY)
        # ========== 一、路径设置 ==========
        draft_root = r"D:\JianyingPro Drafts"
        draft_name = "demo_three_dynamic"
        draft_folder = draft.DraftFolder(draft_root)
        
        # 素材源文件夹（确保这里有真实视频文件）
        material_src = os.path.join(os.path.dirname(__file__), "material")
        assert os.path.exists(material_src), f"未找到素材文件夹: {material_src}"
        
        jianying_logger.info(project_name)
        context=project_name
        query = f"""
        请
        根据 {context}
        生成
        三段文本，用于视频示例，每段一句话。
        要求：
        1. 输出 JSON 数组。
        示例输出：
        [
            "欢迎使用 pyJianYingDraft！",
            "这是一个自动生成的视频示例。",
            "如果对你有帮助，请给个 Star 支持一下！"
        ]
        """
        jianying_logger.info(query)
        messages = [
            {"role": "user", "content": query}
        ]
        
        res = client.chat.completions.create(
            model="GLM-4.5-Flash",
            messages=messages,
            stream=False,
            extra_body={
                "thinking": {"type": "disabled"},
                "chat_template_kwargs": {"enable_thinking": False}
            },
        )
        
        content = res.choices[0].message.content.strip()
        
        # 去掉可能的 ```json 或 ``` 代码块标记
        if content.startswith("```"):
            content = "\n".join(content.split("\n")[1:])  # 去掉第一行 ```
        if content.endswith("```"):
            content = "\n".join(content.split("\n")[:-1])  # 去掉最后一行 ```
        
        # 尝试解析 JSON
        try:
            texts = json.loads(content)
        except json.JSONDecodeError:
            # 如果还不行，则按行拆分有效行
            lines = [line.strip() for line in content.split("\n") if line.strip() and not line.strip().startswith("[") and not line.strip().startswith("]")]
            texts = [line.rstrip(",").strip() for line in lines]
        
        jianying_logger.info(texts)
        
        
        # ========== 初始化客户端 ==========
        from zai import ZhipuAiClient
        import time
        import requests
        zclient = ZhipuAiClient(api_key=API_KEY)
        
        # ========== 生成视频 ==========
        for idx, prompt in enumerate(texts, start=1):
            jianying_logger.info(f"开始生成第 {idx} 个视频，prompt: {prompt}")
            try:
                response = zclient.videos.generations(
                    model="CogVideoX-Flash",
                    prompt=prompt,
                    quality="quality",  # 可根据需要修改
                    with_audio=True,
                    size="1920x1080",
                    fps=30,
                    watermark_enabled=False,
                )
        
                video_id = response.id
                jianying_logger.info(f"视频任务开始 ID: {video_id}")
        
                # 等待生成完成
                timeout, interval, elapsed = 300, 5, 0
                video_url = None
                while elapsed < timeout:
                    result = zclient.videos.retrieve_videos_result(id=video_id)
                    status = getattr(result, "task_status", None)
                    jianying_logger.info(f"任务状态: {status}")
        
                    if status == "SUCCESS":
                        video_url = result.video_result[0].url
                        jianying_logger.info(f"视频生成成功: {video_url}")
                        break
                    elif status in ("FAILURE", "FAILED"):
                        jianying_logger.info(f"视频生成失败, prompt: {prompt}")
                        break
        
                    time.sleep(interval)
                    elapsed += interval
        
                if video_url:
                    # 下载视频到 material_src
                    video_path = os.path.join(material_src, f"video{idx}.mp4")
                    r = requests.get(video_url, stream=True)
                    with open(video_path, "wb") as f:
                        for chunk in r.iter_content(chunk_size=8192):
                            f.write(chunk)
                    jianying_logger.info(f"视频保存成功: {video_path}")
        
            except Exception as e:
                jianying_logger.info(f"生成视频出现异常: {e}")
                
        # ========== 二、创建草稿 ==========
        script = draft_folder.create_draft(draft_name, 1920, 1080, allow_replace=True)
        
        # 获取草稿路径
        draft_path = None
        for attr in ["path", "folder", "draft_path"]:
            draft_path = getattr(script, attr, None)
            if draft_path:
                break
        if draft_path is None:
            draft_path = os.path.join(draft_root, draft_name)
        
        jianying_logger.info(f"草稿路径: {draft_path}")
        
        # 草稿内部素材目录
        material_dst = os.path.join(draft_path, "material")
        os.makedirs(material_dst, exist_ok=True)
        
        # 拷贝素材

        for filename in os.listdir(material_src):
            src_file = os.path.join(material_src, filename)
            dst_file = os.path.join(material_dst, filename)
            if os.path.isfile(src_file):
                shutil.copy2(src_file, dst_file)
        jianying_logger.info(f"✅ 素材已复制到草稿目录: {material_dst}")
        
        # 视频素材路径
        video_files = [
            os.path.join(material_dst, "video1.mp4"),
            os.path.join(material_dst, "video2.mp4"),
            os.path.join(material_dst, "video3.mp4"),
        ]
        for vf in video_files:
            assert os.path.exists(vf), f"视频文件不存在: {vf}"
        # ========== 四、生成三段音频（TTS） ==========
        AudioSegment.converter = r".\ffmpeg\bin\ffmpeg.exe"  # 修改为本地 ffmpeg 路径
        
        def generate_audio(text: str, filename: str) -> str:
            wav_file = filename.replace(".mp3", ".wav")
            engine = pyttsx3.init()
            engine.save_to_file(text, wav_file)
            engine.runAndWait()
            audio = AudioSegment.from_wav(wav_file)
            audio.export(filename, format="mp3")
            return filename
        
        audio_files = [
            generate_audio(texts[0], os.path.join(material_dst, "audio1.mp3")),
            generate_audio(texts[1], os.path.join(material_dst, "audio2.mp3")),
            generate_audio(texts[2], os.path.join(material_dst, "audio3.mp3")),
        ]
        
        # ========== 五、添加轨道和拼接内容 ==========
        script.add_track(draft.TrackType.audio).add_track(draft.TrackType.video).add_track(draft.TrackType.text)
        audio1_path = generate_audio(texts[0], os.path.join(material_dst, "audio1.mp3"))
        audio2_path = generate_audio(texts[1], os.path.join(material_dst, "audio2.mp3"))
        audio3_path = generate_audio(texts[2], os.path.join(material_dst, "audio3.mp3"))
        # 视频素材路径
        video1_path = os.path.join(material_dst, "video1.mp4")
        video2_path = os.path.join(material_dst, "video2.mp4")
        video3_path = os.path.join(material_dst, "video3.mp4")
        
        # 视频段
        video1 = draft.VideoSegment(video1_path, trange("0s", "5s"))
        video1.add_transition(TransitionType.叠化)
        video1.add_filter(FilterType.冬漫, intensity=50.0)
        script.add_segment(video1)
        
        video2 = draft.VideoSegment(video2_path, trange(video1.end, tim("5s")))
        video2.add_background_filling("blur", 0.5)
        video2.add_mask(MaskType.爱心, center_x=0.5, center_y=0.5, size=0.5, rotation=0.0, feather=0.0, invert=False)
        video2.add_transition(TransitionType.闪黑)
        script.add_segment(video2)
        
        video3 = draft.VideoSegment(video3_path, trange(video2.end, tim("5s")))
        script.add_segment(video3)
        
        # 音频段
        audio1 = draft.AudioSegment(audio1_path, trange("0s", "3s"), volume=0.6)
        audio1.add_fade("1s", "0.5s")
        script.add_segment(audio1)
        
        audio2 = draft.AudioSegment(audio2_path, trange(video1.end, tim("3s")), volume=0.6)
        script.add_segment(audio2)
        
        audio3 = draft.AudioSegment(audio3_path, trange(video2.end, tim("3s")), volume=0.6)
        script.add_segment(audio3)
        
        # 文字段
        text1 = draft.TextSegment(
            texts[0],
            trange("0s", "5s"),
            font=draft.FontType.文轩体,
            clip_settings=draft.ClipSettings(transform_y=-0.8)
        )
        text1.add_animation(draft.TextIntro.向上滑动, duration=tim("1s"))
        text1.add_animation(draft.TextOutro.右上弹出, duration=tim("1s"))
        script.add_segment(text1)
        
        text2 = draft.TextSegment(
            texts[1],
            trange(video1.end, tim("5s")),
            font=draft.FontType.文轩体,
            clip_settings=draft.ClipSettings(transform_y=-0.8)
        )
        script.add_segment(text2)
        
        text3 = draft.TextSegment(
            texts[2],
            trange(video2.end, tim("5s")),
            font=draft.FontType.文轩体,
            clip_settings=draft.ClipSettings(transform_y=-0.8)
        )
        text3.add_animation(draft.TextLoopAnim.色差故障)
        script.add_segment(text3)
        
        # ========== 六、保存草稿 ==========
        script.save()
        jianying_logger.info(f"✅ 草稿已保存: {draft_path}")
        
        # ========== 七、修正 JSON 素材路径 ==========
        draft_json_path = os.path.join(draft_path, "draft_content.json")
        if os.path.exists(draft_json_path):
            with open(draft_json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        
            def fix_path(obj):
                if isinstance(obj, dict):
                    for k, v in obj.items():
                        if k == "path" and isinstance(v, str) and v.strip():
                            filename = os.path.basename(v)
                            new_path = os.path.join(material_dst, filename)
                            obj[k] = new_path.replace("\\", "\\\\")
                        elif isinstance(v, (dict, list)):
                            fix_path(v)
                elif isinstance(obj, list):
                    for item in obj:
                        fix_path(item)
        
            fix_path(data)
            with open(draft_json_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
            jianying_logger.info(f"✅ 草稿 JSON 素材路径已更新: {material_dst}")
        else:
            jianying_logger.info("⚠️ 未找到 draft_content.json 文件")
        
        jianying_logger.info("🎬 全流程执行完毕！")




        # ========== 六、生成 ZIP ==========
        zip_path = os.path.join(TEMP_DOWNLOAD_DIR, f"{draft_name}.zip")
        if os.path.exists(zip_path):
            os.remove(zip_path)
        shutil.make_archive(zip_path.replace(".zip", ""), "zip", draft_path)

        url = f"{DOWNLOAD_BASE_URL}/{os.path.basename(zip_path)}"
        jianying_logger.info(f"生成完成: {url}")
        return JSONResponse({"download_url": url})

    except Exception as e:
        jianying_logger.error(traceback.format_exc())
        return JSONResponse({"error": str(e)}, status_code=500)



# ========================
# 启动入口
# ========================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8001,  workers=8, reload=True)
