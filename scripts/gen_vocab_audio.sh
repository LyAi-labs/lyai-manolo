#!/usr/bin/env bash
# Cron diario: drena los audios de vocabulario pendientes (voz Kore, free tier).
# Idempotente: solo genera los .ogg que faltan; se detiene solo al topar cuota.
set -a
. /opt/lyai/app/lyai-manolo/.env   # GEMINI_API_KEY (gitignored)
set +a
cd /opt/lyai/app/lyai-manolo
echo "--- $(date -u +%Y-%m-%dT%H:%M:%SZ) ---"
/usr/bin/python3 scripts/gen_vocab_audio.py 40
