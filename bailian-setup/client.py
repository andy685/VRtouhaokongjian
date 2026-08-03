"""
阿里云百炼 OpenAI 兼容客户端
用法:
  1. 安装依赖: pip install openai python-dotenv
  2. 在 .env 中配置 DASHSCOPE_API_KEY
  3. 运行: python client.py
  4. 想用自定义/微调模型: 改 config.json 里的 model 字段
"""
import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(HERE, "config.json"), encoding="utf-8") as f:
    cfg = json.load(f)


client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url=cfg["base_url"],
)


def chat(user_message: str, system: str = "你是一个有用的中文助手。") -> str:
    """发起一次对话调用，返回模型文本。

    百炼扩展参数（如 enable_search）需通过 extra_body 透传，
    标准 OpenAI SDK 不接受这些自定义字段。
    """
    kwargs = dict(
        model=cfg["model"],
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_message},
        ],
        temperature=cfg.get("temperature", 0.8),
        max_tokens=cfg.get("max_tokens", 2000),
    )
    if cfg.get("enable_search"):
        kwargs["extra_body"] = {"enable_search": True}
    resp = client.chat.completions.create(**kwargs)
    return resp.choices[0].message.content


if __name__ == "__main__":
    answer = chat("用一句话介绍阿里百炼平台")
    print(answer)
