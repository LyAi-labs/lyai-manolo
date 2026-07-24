"""Telegram (bot @LyAipa) — avisos de reserva + edición tras confirmar.

Outbound por urllib (mismo patrón que gemini.py). El token se lee del fichero
montado (single source con el resto de LyAi) o de env TG_BOT_TOKEN. Si no hay
token/chat_id configurados, las funciones no hacen nada (no rompen la reserva).
"""
import json
import urllib.request
from pathlib import Path

from .config import settings


def _token() -> str:
    if settings.TG_BOT_TOKEN:
        return settings.TG_BOT_TOKEN.strip()
    p = settings.TG_BOT_TOKEN_FILE
    try:
        if p and Path(p).exists():
            return Path(p).read_text().strip()
    except Exception:
        pass
    return ""


def _call(method: str, payload: dict) -> dict | None:
    token = _token()
    if not token:
        return None
    url = f"https://api.telegram.org/bot{token}/{method}"
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read().decode())
    except Exception:
        return None


def _recipients() -> list[str]:
    return [c for c in (settings.TG_MANOLO_CHAT_ID, settings.TG_IGNACIO_CHAT_ID) if c]


def notify_new_booking(booking, student_name: str) -> None:
    """Avisa a Manolo (y copia a Ignacio) con botones Confirmar/Rechazar."""
    ct = booking.class_type.name if booking.class_type else ""
    when = booking.when_label or f"{booking.date} · {booking.time}"
    text = (
        "🔔 Nueva reserva\n\n"
        f"👤 {student_name}\n"
        f"📅 {when}\n"
        f"🎓 {ct} {booking.level or ''}".rstrip()
    )
    kb = {"inline_keyboard": [[
        {"text": "✅ Confirmar", "callback_data": f"confirm:{booking.id}"},
        {"text": "❌ Rechazar", "callback_data": f"reject:{booking.id}"},
    ]]}
    for chat in _recipients():
        _call("sendMessage", {"chat_id": chat, "text": text, "reply_markup": kb})


def answer_callback(callback_id: str, text: str) -> None:
    _call("answerCallbackQuery", {"callback_query_id": callback_id, "text": text})


def edit_message(chat_id, message_id, text: str) -> None:
    """Reescribe el mensaje y retira los botones (se pasa reply_markup vacío)."""
    _call("editMessageText", {
        "chat_id": chat_id, "message_id": message_id, "text": text,
        "reply_markup": {"inline_keyboard": []},
    })
