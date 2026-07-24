"""Generación de texto con Gemini (flash, free tier). Devuelve JSON estructurado."""
import json
import urllib.request

from .config import settings


def generate_json(prompt: str) -> dict:
    key = settings.GEMINI_API_KEY
    if not key:
        raise RuntimeError("GEMINI_API_KEY no configurada")
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.GEMINI_MODEL}:generateContent?key={key}"
    )
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json"},
    }
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        d = json.loads(r.read().decode())
    return json.loads(d["candidates"][0]["content"]["parts"][0]["text"])
