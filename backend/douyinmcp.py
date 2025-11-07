#!/usr/bin/env python3
"""
Streamable-HTTP MCP Server + Douyin Tools
"""


import re
import json
import requests
import tempfile
from pathlib import Path
from fastmcp import FastMCP

# 创建 MCP 服务器实例
mcp = FastMCP("streamable-http-server")

# -------------------- 通用配置 --------------------
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/121.0.2277.107 Version/17.0 Mobile/15E148 Safari/604.1'
}


# -------------------- Douyin 工具类 --------------------
class DouyinProcessor:
    """抖音视频处理器"""
    
    def __init__(self):
        self.temp_dir = Path(tempfile.mkdtemp())

    
    def __del__(self):
        import shutil
        if hasattr(self, 'temp_dir') and self.temp_dir.exists():
            shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def parse_share_url(self, share_text: str) -> dict:
        urls = re.findall(r'http[s]?://[^\s]+', share_text)
        if not urls:
            raise ValueError("未找到有效的分享链接")
        share_url = urls[0]
        resp = requests.get(share_url, headers=HEADERS)
        video_id = resp.url.split("?")[0].strip("/").split("/")[-1]
        share_url = f'https://www.iesdouyin.com/share/video/{video_id}'
        response = requests.get(share_url, headers=HEADERS)
        response.raise_for_status()
        pattern = re.compile(r"window\._ROUTER_DATA\s*=\s*(.*?)</script>", flags=re.DOTALL)
        find_res = pattern.search(response.text)
        if not find_res or not find_res.group(1):
            raise ValueError("从HTML中解析视频信息失败")
        json_data = json.loads(find_res.group(1).strip())
        VIDEO_ID_PAGE_KEY = "video_(id)/page"
        NOTE_ID_PAGE_KEY = "note_(id)/page"
        if VIDEO_ID_PAGE_KEY in json_data["loaderData"]:
            original_video_info = json_data["loaderData"][VIDEO_ID_PAGE_KEY]["videoInfoRes"]
        elif NOTE_ID_PAGE_KEY in json_data["loaderData"]:
            original_video_info = json_data["loaderData"][NOTE_ID_PAGE_KEY]["videoInfoRes"]
        else:
            raise Exception("无法从JSON中解析视频或图集信息")
        data = original_video_info["item_list"][0]
        video_url = data["video"]["play_addr"]["url_list"][0].replace("playwm", "play")
        desc = data.get("desc", "").strip() or f"douyin_{video_id}"
        desc = re.sub(r'[\\/:*?"<>|]', '_', desc)
        return {"url": video_url, "title": desc, "video_id": video_id}
    

# -------------------- MCP 工具函数 --------------------
@mcp.tool()
def get_douyin_download_link(share_link: str) -> str:
    try:
        processor = DouyinProcessor()
        video_info = processor.parse_share_url(share_link)
        return json.dumps({
            "status": "success",
            "video_id": video_info["video_id"],
            "title": video_info["title"],
            "download_url": video_info["url"]
        }, ensure_ascii=False, indent=2)
    except Exception as e:
        return json.dumps({"status": "error", "error": str(e)}, ensure_ascii=False, indent=2)




# -------------------- 启动 MCP --------------------
if __name__ == "__main__":
    mcp.run(transport="http", host="0.0.0.0", port=18060)