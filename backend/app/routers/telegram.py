"""Webhook de Telegram: recibe el toque de los botones Confirmar/Rechazar.

Seguridad doble: secreto en la ruta + cabecera X-Telegram-Bot-Api-Secret-Token
(la fija setWebhook), y además el callback solo se acepta si viene del chat_id
de Manolo o de Ignacio. Sin dependencia de auth JWT (Telegram no la trae).
"""
from fastapi import APIRouter, Request, Header, HTTPException

from ..database import SessionLocal
from ..models import Booking
from ..config import settings
from .. import tg

router = APIRouter(tags=["telegram"])


@router.post("/tg/webhook/{secret}")
async def tg_webhook(
    secret: str,
    request: Request,
    x_telegram_bot_api_secret_token: str = Header(default=""),
):
    expected = settings.TG_WEBHOOK_SECRET
    if not expected or secret != expected or x_telegram_bot_api_secret_token != expected:
        raise HTTPException(status_code=403, detail="forbidden")

    update = await request.json()
    cb = update.get("callback_query")
    if not cb:
        return {"ok": True}  # ignoramos mensajes normales

    allowed = {str(settings.TG_MANOLO_CHAT_ID), str(settings.TG_IGNACIO_CHAT_ID)}
    from_id = str(cb.get("from", {}).get("id", ""))
    msg = cb.get("message", {}) or {}
    chat_id = msg.get("chat", {}).get("id")
    message_id = msg.get("message_id")
    action, _, sid = (cb.get("data", "") or "").partition(":")

    if from_id not in allowed:
        tg.answer_callback(cb["id"], "No autorizado")
        return {"ok": True}

    db = SessionLocal()
    try:
        booking = db.get(Booking, int(sid)) if sid.isdigit() else None
        if not booking:
            tg.answer_callback(cb["id"], "Reserva no encontrada")
            return {"ok": True}
        who = booking.user.name if booking.user else "alumno/a"
        when = booking.when_label or f"{booking.date} · {booking.time}"

        if action == "confirm":
            booking.status = "confirmed"
            db.commit()
            tg.answer_callback(cb["id"], "✅ Confirmada")
            tg.edit_message(chat_id, message_id,
                            f"✅ Confirmada · {who} · {when}\nLa alumna ya tiene acceso al aula.")
        elif action == "reject":
            booking.status = "rejected"
            db.commit()
            tg.answer_callback(cb["id"], "❌ Rechazada")
            tg.edit_message(chat_id, message_id, f"❌ Rechazada · {who} · {when}")
        else:
            tg.answer_callback(cb["id"], "Acción desconocida")
    finally:
        db.close()
    return {"ok": True}
