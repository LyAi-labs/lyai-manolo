#!/usr/bin/env python3
"""Genera audio de vocabulario francés (Gemini TTS, voz Kore, GRATIS) para Aula Francés.

Uso (host):  GEMINI_API_KEY=... python3 scripts/gen_vocab_audio.py [LIMIT]
Lee el currículo, genera un .ogg por palabra que falte y lo deja en
/var/www/manolo.lyai.fr/audio/vocab/<slug>.ogg (servido por manolo-nginx).
Nombre determinista (md5 del francés) = mismo que devuelve /api/lessons/{id}/vocab.
Free tier ~100 req/día/modelo → fallback entre modelos si uno topa cuota.
"""
import sys, os, json, base64, struct, subprocess, time
import urllib.request, urllib.error

sys.path.insert(0, "/opt/lyai/app/lyai-manolo/backend/app")
from curriculum import CURRICULUM, audio_slug  # noqa: E402

KEY = os.environ.get("GEMINI_API_KEY")
AUDIO_DIR = "/var/www/manolo.lyai.fr/audio/vocab"
RATE = 24000
VOICE = "Kore"
MODELS = ["gemini-2.5-flash-preview-tts", "gemini-2.5-pro-preview-tts", "gemini-3.1-flash-tts-preview"]
STYLE = ("Voix d'une professeure de français, chaleureuse et claire. Prononce lentement et "
         "distinctement, pour un débutant hispanophone. Dis uniquement, en français :")
_mi = [0]  # índice de modelo (avanza al topar cuota)


def wav_header(n, rate):
    return (b"RIFF" + struct.pack("<I", 36 + n) + b"WAVEfmt " +
            struct.pack("<IHHIIHH", 16, 1, 1, rate, rate * 2, 2, 16) +
            b"data" + struct.pack("<I", n))


def gen(fr, path):
    body = {
        "contents": [{"parts": [{"text": f"{STYLE} «{fr}»"}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE}}},
        },
    }
    data = json.dumps(body).encode()
    while _mi[0] < len(MODELS):
        model = MODELS[_mi[0]]
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={KEY}"
        try:
            req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=120) as r:
                d = json.loads(r.read().decode())
            if "candidates" not in d:
                err = json.dumps(d.get("error", d)).lower()
                if "429" in err or "resource_exhausted" in err or "quota" in err:
                    _mi[0] += 1
                    continue
                print("  api err:", err[:120])
                return False
            pcm = base64.b64decode(d["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
            raw = path + ".raw.wav"
            with open(raw, "wb") as f:
                f.write(wav_header(len(pcm), RATE))
                f.write(pcm)
            subprocess.run(["ffmpeg", "-i", raw, "-c:a", "libopus", "-b:a", "32k", path,
                            "-y", "-loglevel", "error"], check=True)
            os.remove(raw)
            return True
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:150].lower()
            if e.code == 429 or "quota" in msg or "resource_exhausted" in msg:
                _mi[0] += 1
                continue
            print("  http", e.code, msg[:100])
            return False
        except Exception as e:
            print("  err:", str(e)[:120])
            return False
    return False


def main():
    if not KEY:
        print("Falta GEMINI_API_KEY en el entorno")
        sys.exit(1)
    os.makedirs(AUDIO_DIR, exist_ok=True)
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 9999
    todo = []
    for u in CURRICULUM:
        for fr, _es in u.get("vocab", []):
            p = f"{AUDIO_DIR}/{audio_slug(fr)}.ogg"
            if not os.path.exists(p):
                todo.append((fr, p))
    print(f"{len(todo)} audios pendientes · genero hasta {limit}")
    done = 0
    fails = 0
    for fr, p in todo[:limit]:
        ok = gen(fr, p)
        print(f"  {'OK ' if ok else 'FALLO'} {fr}")
        if ok:
            done += 1
            fails = 0
        else:
            fails += 1
            if _mi[0] >= len(MODELS) or fails >= 4:
                print("  (cuota o red agotada · paro)")
                break
        time.sleep(0.4)
    print(f"generados {done} · quedan {len(todo) - done}")


if __name__ == "__main__":
    main()
