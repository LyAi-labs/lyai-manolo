# Currículo A1–A2 de Aula Francés (24 unidades).
# Módulo PURO (sin dependencias de la app) para poder importarlo también
# desde el script de generación de audio en el host.
import hashlib


def audio_slug(fr: str) -> str:
    """URL/fichero de audio determinista para una palabra francesa."""
    return hashlib.md5(fr.encode("utf-8")).hexdigest()[:12]


# type: video | ejercicio | pdf   ·   vocab: [(fr, es), ...]
CURRICULUM = [
    # ---------------- A1 ----------------
    {"level": "A1", "title": "Les salutations", "type": "video", "meta": "Vídeo · TV5Monde A1",
     "vocab": [("bonjour", "hola"), ("bonsoir", "buenas noches"), ("salut", "hola/adiós (informal)"),
               ("au revoir", "adiós"), ("merci", "gracias"), ("s'il vous plaît", "por favor"),
               ("oui", "sí"), ("non", "no"), ("pardon", "perdón"), ("à bientôt", "hasta pronto")]},
    {"level": "A1", "title": "Se présenter", "type": "ejercicio", "meta": "Ejercicio · Le Point du FLE",
     "vocab": [("je m'appelle", "me llamo"), ("comment tu t'appelles ?", "¿cómo te llamas?"),
               ("enchanté", "encantado"), ("j'habite à", "vivo en"), ("je suis", "soy/estoy"),
               ("tu es", "eres/estás"), ("et toi ?", "¿y tú?"), ("j'ai vingt ans", "tengo veinte años")]},
    {"level": "A1", "title": "Les nombres 0–20", "type": "ejercicio", "meta": "Ejercicio · 10 preguntas",
     "vocab": [("un", "uno"), ("deux", "dos"), ("trois", "tres"), ("quatre", "cuatro"),
               ("cinq", "cinco"), ("six", "seis"), ("sept", "siete"), ("huit", "ocho"),
               ("neuf", "nueve"), ("dix", "diez")]},
    {"level": "A1", "title": "La famille", "type": "video", "meta": "Vídeo · 9 min",
     "vocab": [("le père", "el padre"), ("la mère", "la madre"), ("le frère", "el hermano"),
               ("la sœur", "la hermana"), ("les parents", "los padres"), ("le fils", "el hijo"),
               ("la fille", "la hija"), ("la famille", "la familia")]},
    {"level": "A1", "title": "Nationalités et pays", "type": "pdf", "meta": "PDF · 4 págs",
     "vocab": [("la France", "Francia"), ("l'Espagne", "España"), ("français", "francés"),
               ("espagnol", "español"), ("anglais", "inglés"), ("un pays", "un país"),
               ("une ville", "una ciudad"), ("la langue", "el idioma")]},
    {"level": "A1", "title": "Le présent (être, avoir, -er)", "type": "video", "meta": "Vídeo · 12 min",
     "vocab": [("je suis", "soy/estoy"), ("tu es", "eres/estás"), ("il est", "él es/está"),
               ("j'ai", "tengo"), ("tu as", "tienes"), ("parler", "hablar"),
               ("aimer", "gustar/amar"), ("habiter", "vivir")]},
    {"level": "A1", "title": "Les articles (le, la, un, une)", "type": "ejercicio", "meta": "Ejercicio · 12 preguntas",
     "vocab": [("le", "el"), ("la", "la"), ("les", "los/las"), ("un", "un"),
               ("une", "una"), ("des", "unos/unas"), ("l'ami", "el amigo"), ("l'école", "la escuela")]},
    {"level": "A1", "title": "Décrire (couleurs, adjectifs)", "type": "video", "meta": "Vídeo · 8 min",
     "vocab": [("rouge", "rojo"), ("bleu", "azul"), ("vert", "verde"), ("jaune", "amarillo"),
               ("grand", "grande"), ("petit", "pequeño"), ("content", "contento"), ("beau", "guapo/bonito")]},
    {"level": "A1", "title": "L'heure et les jours", "type": "ejercicio", "meta": "Ejercicio · Bonjour de France"},
    {"level": "A1", "title": "Au café (la nourriture)", "type": "video", "meta": "Vídeo · TV5Monde A1"},
    {"level": "A1", "title": "La ville et les directions", "type": "pdf", "meta": "PDF · 5 págs"},
    {"level": "A1", "title": "Les loisirs de base", "type": "ejercicio", "meta": "Ejercicio · LearningApps"},
    # ---------------- A2 ----------------
    {"level": "A2", "title": "Le passé composé", "type": "video", "meta": "Vídeo · 14 min"},
    {"level": "A2", "title": "L'imparfait", "type": "video", "meta": "Vídeo · 11 min"},
    {"level": "A2", "title": "Le futur proche", "type": "ejercicio", "meta": "Ejercicio · 12 preguntas"},
    {"level": "A2", "title": "La routine (verbes pronominaux)", "type": "video", "meta": "Vídeo · RFI Français facile"},
    {"level": "A2", "title": "Le corps et la santé", "type": "ejercicio", "meta": "Ejercicio · Liveworksheet"},
    {"level": "A2", "title": "Les courses (quantités, partitifs)", "type": "video", "meta": "Vídeo · 10 min"},
    {"level": "A2", "title": "Les vêtements", "type": "pdf", "meta": "PDF · 4 págs"},
    {"level": "A2", "title": "Les comparatifs", "type": "ejercicio", "meta": "Ejercicio · Le Point du FLE"},
    {"level": "A2", "title": "Le logement", "type": "video", "meta": "Vídeo · 12 min"},
    {"level": "A2", "title": "Les projets et le futur", "type": "ejercicio", "meta": "Ejercicio · 10 preguntas"},
    {"level": "A2", "title": "Raconter une anecdote", "type": "video", "meta": "Vídeo · TV5Monde A2"},
    {"level": "A2", "title": "Préparation DELF A2", "type": "pdf", "meta": "PDF · simulacro oficial"},
]
