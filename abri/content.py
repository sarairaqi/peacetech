"""
content.py — Tout le contenu "métier" du prototype Abri.

  • RECIPES          : les recettes de l'application de couverture "Petits Plats"
                       (+ recettes_suisses/francaises/internationales.py : 200 en tout)
  • QUESTIONNAIRE    : le questionnaire Oui/Non (source : canton de Vaud)
  • SITUATION        : questions facultatives qui affinent la redirection
  • CONTACTS / AXES  : le réseau vaudois de lutte contre la violence domestique
  • LOCATION_AUDIT   : la checklist d'auto-audit de la localisation
  • SCAN_FINDINGS    : résultats (simulés) de l'analyse automatique de l'appareil
  • DOSSIER_ITEMS    : les pièces à réunir pour porter plainte

Aucune logique ici : uniquement des données, faciles à modifier par l'équipe.
"""

# ---------------------------------------------------------------------------
# 1. Application de couverture : "Petits Plats"
# ---------------------------------------------------------------------------

RECIPES = [
    {
        "id": "rosti",
        "region": "Berne",
        "name": "Rösti bernois",
        "emoji": "🥔",
        "category": "Plats",
        "time": "35 min",
        "difficulty": "Facile",
        "base_servings": 4,
        "gradient": ["#f6c667", "#e07a2f"],
        "ingredients": [
            {"name": "pommes de terre à chair ferme", "qty": 1, "unit": "kg"},
            {"name": "beurre", "qty": 60, "unit": "g"},
            {"name": "oignon", "qty": 1, "unit": ""},
            {"name": "sel", "qty": 1, "unit": "c. à café"},
            {"name": "poivre", "qty": 1, "unit": "pincée"},
        ],
        "steps": [
            "Cuire les pommes de terre en robe des champs la veille, puis les râper grossièrement.",
            "Faire fondre le beurre dans une poêle, y faire revenir l'oignon émincé.",
            "Ajouter les pommes de terre, saler, poivrer, tasser en galette.",
            "Cuire 12 min à feu moyen, retourner à l'aide d'une assiette, cuire encore 10 min.",
        ],
    },
    {
        "id": "fondue",
        "region": "Fribourg",
        "name": "Fondue moitié-moitié",
        "emoji": "🧀",
        "category": "Plats",
        "time": "25 min",
        "difficulty": "Facile",
        "base_servings": 4,
        "gradient": ["#ffe29a", "#f5a623"],
        "ingredients": [
            {"name": "Gruyère AOP", "qty": 400, "unit": "g"},
            {"name": "Vacherin fribourgeois AOP", "qty": 400, "unit": "g"},
            {"name": "vin blanc sec", "qty": 3, "unit": "dl"},
            {"name": "fécule de maïs", "qty": 2, "unit": "c. à café"},
            {"name": "gousse d'ail", "qty": 1, "unit": ""},
            {"name": "kirsch", "qty": 2, "unit": "c. à soupe"},
            {"name": "pain", "qty": 400, "unit": "g"},
        ],
        "steps": [
            "Frotter le caquelon avec l'ail, y verser le vin et la fécule.",
            "Ajouter le fromage râpé, chauffer à feu doux en remuant en 8.",
            "Quand la masse est lisse, ajouter le kirsch et le poivre.",
            "Servir aussitôt avec le pain coupé en cubes.",
        ],
    },
    {
        "id": "papet",
        "region": "Vaud",
        "name": "Papet vaudois",
        "emoji": "🥬",
        "category": "Plats",
        "time": "1 h 10",
        "difficulty": "Moyen",
        "base_servings": 4,
        "gradient": ["#b8e994", "#38ada9"],
        "ingredients": [
            {"name": "poireaux", "qty": 1, "unit": "kg"},
            {"name": "pommes de terre", "qty": 600, "unit": "g"},
            {"name": "saucisses aux choux", "qty": 2, "unit": ""},
            {"name": "vin blanc", "qty": 1, "unit": "dl"},
            {"name": "crème", "qty": 1, "unit": "dl"},
            {"name": "beurre", "qty": 30, "unit": "g"},
        ],
        "steps": [
            "Émincer les poireaux et les faire suer dans le beurre 10 min.",
            "Ajouter les pommes de terre en dés et le vin blanc, couvrir d'eau.",
            "Poser les saucisses sur les légumes, cuire 45 min à couvert.",
            "Retirer les saucisses, écraser grossièrement, lier à la crème.",
        ],
    },
    {
        "id": "risotto",
        "name": "Risotto aux champignons",
        "emoji": "🍄",
        "category": "Plats",
        "time": "40 min",
        "difficulty": "Moyen",
        "base_servings": 4,
        "gradient": ["#d7c3a5", "#8d6e4c"],
        "ingredients": [
            {"name": "riz arborio", "qty": 320, "unit": "g"},
            {"name": "champignons de Paris", "qty": 300, "unit": "g"},
            {"name": "bouillon de légumes", "qty": 1, "unit": "l"},
            {"name": "parmesan", "qty": 60, "unit": "g"},
            {"name": "échalote", "qty": 1, "unit": ""},
            {"name": "vin blanc", "qty": 1, "unit": "dl"},
            {"name": "beurre", "qty": 40, "unit": "g"},
        ],
        "steps": [
            "Faire revenir l'échalote et les champignons dans la moitié du beurre.",
            "Ajouter le riz, nacrer 2 min, déglacer au vin blanc.",
            "Verser le bouillon louche par louche en remuant, 18 min environ.",
            "Hors du feu, incorporer le beurre restant et le parmesan.",
        ],
    },
    {
        "id": "tarte-pommes",
        "name": "Tarte aux pommes",
        "emoji": "🍎",
        "category": "Desserts",
        "time": "50 min",
        "difficulty": "Facile",
        "base_servings": 6,
        "gradient": ["#ff9a9e", "#d7263d"],
        "ingredients": [
            {"name": "pâte brisée", "qty": 1, "unit": ""},
            {"name": "pommes", "qty": 5, "unit": ""},
            {"name": "sucre", "qty": 80, "unit": "g"},
            {"name": "œuf", "qty": 1, "unit": ""},
            {"name": "crème", "qty": 1, "unit": "dl"},
            {"name": "cannelle", "qty": 1, "unit": "c. à café"},
        ],
        "steps": [
            "Foncer un moule avec la pâte, piquer le fond.",
            "Disposer les pommes en lamelles en rosace.",
            "Mélanger œuf, crème, sucre et cannelle, verser sur les pommes.",
            "Cuire 35 min à 200 °C.",
        ],
    },
    {
        "id": "crepes",
        "name": "Crêpes moelleuses",
        "emoji": "🥞",
        "category": "Desserts",
        "time": "30 min",
        "difficulty": "Facile",
        "base_servings": 4,
        "gradient": ["#fbe7a1", "#e8b04b"],
        "ingredients": [
            {"name": "farine", "qty": 250, "unit": "g"},
            {"name": "œufs", "qty": 3, "unit": ""},
            {"name": "lait", "qty": 5, "unit": "dl"},
            {"name": "beurre fondu", "qty": 30, "unit": "g"},
            {"name": "sucre", "qty": 1, "unit": "c. à soupe"},
            {"name": "sel", "qty": 1, "unit": "pincée"},
        ],
        "steps": [
            "Mélanger farine, sel et sucre, creuser un puits.",
            "Ajouter les œufs puis le lait petit à petit, puis le beurre fondu.",
            "Laisser reposer 30 min.",
            "Cuire dans une poêle chaude légèrement beurrée, 1 min par face.",
        ],
    },
    {
        "id": "soupe-courge",
        "name": "Velouté de courge",
        "emoji": "🎃",
        "category": "Entrées",
        "time": "45 min",
        "difficulty": "Facile",
        "base_servings": 4,
        "gradient": ["#ffb75e", "#ed8f03"],
        "ingredients": [
            {"name": "courge", "qty": 1, "unit": "kg"},
            {"name": "oignon", "qty": 1, "unit": ""},
            {"name": "bouillon", "qty": 8, "unit": "dl"},
            {"name": "crème", "qty": 1, "unit": "dl"},
            {"name": "huile d'olive", "qty": 2, "unit": "c. à soupe"},
            {"name": "graines de courge", "qty": 2, "unit": "c. à soupe"},
        ],
        "steps": [
            "Faire revenir l'oignon dans l'huile, ajouter la courge en dés.",
            "Couvrir de bouillon, cuire 25 min.",
            "Mixer, ajouter la crème, rectifier l'assaisonnement.",
            "Servir avec les graines de courge grillées.",
        ],
    },
    {
        "id": "salade-cesar",
        "name": "Salade César",
        "emoji": "🥗",
        "category": "Entrées",
        "time": "20 min",
        "difficulty": "Facile",
        "base_servings": 2,
        "gradient": ["#c3f584", "#5aa02c"],
        "ingredients": [
            {"name": "laitue romaine", "qty": 1, "unit": ""},
            {"name": "blanc de poulet", "qty": 200, "unit": "g"},
            {"name": "parmesan", "qty": 40, "unit": "g"},
            {"name": "croûtons", "qty": 60, "unit": "g"},
            {"name": "jaune d'œuf", "qty": 1, "unit": ""},
            {"name": "huile d'olive", "qty": 6, "unit": "c. à soupe"},
            {"name": "filets d'anchois", "qty": 3, "unit": ""},
        ],
        "steps": [
            "Griller le poulet, le couper en lamelles.",
            "Monter la sauce : jaune d'œuf, anchois écrasés, huile, citron.",
            "Mélanger la salade avec la sauce, ajouter poulet, croûtons et parmesan.",
        ],
    },
    {
        "id": "pesto",
        "name": "Pâtes au pesto maison",
        "emoji": "🍝",
        "category": "Plats",
        "time": "20 min",
        "difficulty": "Facile",
        "base_servings": 4,
        "gradient": ["#a8e063", "#56ab2f"],
        "ingredients": [
            {"name": "pâtes", "qty": 400, "unit": "g"},
            {"name": "basilic frais", "qty": 60, "unit": "g"},
            {"name": "pignons de pin", "qty": 40, "unit": "g"},
            {"name": "parmesan", "qty": 60, "unit": "g"},
            {"name": "huile d'olive", "qty": 1, "unit": "dl"},
            {"name": "gousse d'ail", "qty": 1, "unit": ""},
        ],
        "steps": [
            "Cuire les pâtes al dente.",
            "Mixer basilic, pignons, parmesan, ail et huile.",
            "Mélanger le pesto aux pâtes avec un peu d'eau de cuisson.",
        ],
    },
    {
        "id": "gateau-choc",
        "name": "Gâteau au chocolat",
        "emoji": "🍫",
        "category": "Desserts",
        "time": "45 min",
        "difficulty": "Facile",
        "base_servings": 8,
        "gradient": ["#8e5a3c", "#3d1f0f"],
        "ingredients": [
            {"name": "chocolat noir", "qty": 200, "unit": "g"},
            {"name": "beurre", "qty": 150, "unit": "g"},
            {"name": "sucre", "qty": 150, "unit": "g"},
            {"name": "œufs", "qty": 4, "unit": ""},
            {"name": "farine", "qty": 80, "unit": "g"},
        ],
        "steps": [
            "Faire fondre le chocolat et le beurre au bain-marie.",
            "Fouetter les œufs et le sucre, ajouter le chocolat puis la farine.",
            "Cuire 25 min à 180 °C dans un moule beurré.",
        ],
    },
]

# 200 recettes en tout :
#   • RECIPES_FIXED      : les 60 toujours affichées, suisses d'abord — les seules qui
#                          peuvent servir de recette secrète (l'accès ne disparaît jamais)
#   • RECIPES_DAILY_POOL : la réserve des « recettes du jour » (2 par jour, logic.daily_recipes)
from recettes_francaises import CLASSIQUES, FRANCAISES  # noqa: E402
from recettes_internationales import INTERNATIONALES  # noqa: E402
from recettes_suisses import RECETTES_SUISSES, SUISSES_DU_JOUR  # noqa: E402

RECIPES_FIXED = ([r for r in RECIPES if r.get("region")] + RECETTES_SUISSES + CLASSIQUES
                 + [r for r in RECIPES if not r.get("region")])
RECIPES_DAILY_POOL = SUISSES_DU_JOUR + FRANCAISES + INTERNATIONALES
RECIPES = RECIPES_FIXED + RECIPES_DAILY_POOL

RECIPE_CATEGORIES = ["Tous", "Entrées", "Plats", "Desserts", "Boulangerie"]

# ---------------------------------------------------------------------------
# 2. Questionnaire — "Évaluer votre situation" (Oui / Non)
#    Source : matériel du canton de Vaud (violence domestique)
# ---------------------------------------------------------------------------

QUESTIONNAIRE_INTRO = (
    "Votre partenaire ou ex-partenaire… Répondez honnêtement : aucune réponse "
    "n'est enregistrée sans votre accord. Quelle que soit la raison invoquée "
    "(stress, alcool, histoire personnelle, provocation…), le recours à la "
    "violence est inacceptable."
)

QUESTIONNAIRE = [
    {
        "id": "physique",
        "title": "Violence physique",
        "icon": "✋",
        "danger": "high",
        "mention": "Ces actes sont interdits par la loi.",
        "questions": [
            {"id": "q1", "text": "Vous pousse brutalement ?"},
            {"id": "q2", "text": "Vous gifle ?"},
            {"id": "q3", "text": "Vous donne des coups de poing ou des coups de pied ?"},
            {"id": "q4", "text": "Vous mord ?"},
            {"id": "q5", "text": "Vous brûle ?"},
            {"id": "q6", "text": "Vous blesse avec un projectile, un couteau ou une arme ?"},
        ],
    },
    {
        "id": "psychologique",
        "title": "Violence psychologique",
        "icon": "💬",
        "danger": "concern",
        "mention": "Ces comportements sont inacceptables et certains sont punissables.",
        "questions": [
            {"id": "q7", "text": "Vous insulte ?"},
            {"id": "q8", "text": "Vous humilie ?"},
            {"id": "q9", "text": "Vous menace ?"},
            {"id": "q10", "text": "Vous contrôle (par ex. choix des vêtements) ?"},
            {"id": "q11", "text": "Détruit vos effets personnels ou des objets de la maison ?"},
            {"id": "q12", "text": "Vous empêche de sortir seul·e ?"},
            {"id": "q13", "text": "Vous empêche de voir vos ami·e·s ou vos parents, et vous isole ?"},
            {"id": "q14", "text": "Vous harcèle continuellement ?"},
        ],
    },
    {
        "id": "sexuelle",
        "title": "Violence sexuelle",
        "icon": "🚫",
        "danger": "high",
        "mention": "Le viol et la contrainte sexuelle au sein du couple sont interdits par la loi.",
        "questions": [
            {"id": "q15", "text": "Vous viole ?"},
            {"id": "q16", "text": "Vous contraint d'une manière ou d'une autre à des contacts sexuels que vous ne souhaitez pas ?"},
        ],
    },
    {
        "id": "economique",
        "title": "Violence économique",
        "icon": "💳",
        "danger": "concern",
        "mention": "Ces comportements sont inacceptables et certains sont punissables.",
        "questions": [
            {"id": "q17", "text": "Ne contribue pas selon ses ressources aux dépenses du ménage ?"},
            {"id": "q18", "text": "S'approprie votre argent sans votre consentement ou par manipulation ?"},
        ],
    },
    {
        "id": "mariage",
        "title": "Relation ou mariage forcé",
        "icon": "💍",
        "danger": "high",
        "mention": "Entraver une personne dans sa liberté d'action et de choix en matière de mariage ou partenariat enregistré est interdit par la loi.",
        "questions": [
            {"id": "q19", "text": "Êtes-vous contraint·e sur le choix d'un·e conjoint·e ?"},
            {"id": "q20", "text": "N'avez-vous pas la possibilité de refuser votre propre mariage ?"},
            {"id": "q21", "text": "Êtes-vous soumis·e à des pressions pour renoncer à une relation ?"},
            {"id": "q22", "text": "Êtes-vous soumis·e à des pressions pour renoncer à un divorce ?"},
        ],
    },
]

# Questions facultatives de contexte : elles n'influencent pas le niveau de
# danger, seulement les services proposés (protection des mineurs, migration…).
SITUATION = [
    {"id": "enfants", "text": "Des enfants vivent-ils avec vous ?", "adds": ["opm"]},
    {"id": "migration", "text": "Votre séjour en Suisse dépend-il d'un permis (permis B, L, F…) ?", "adds": ["fraternite"]},
]

# ---------------------------------------------------------------------------
# 3. Réseau vaudois de lutte contre la violence domestique
#    (schéma « Où trouver de l'aide ? », canton de Vaud)
# ---------------------------------------------------------------------------

AXES = {
    "urgence":   {"label": "Urgence 24/24 · 7/7", "color": "#f2a900"},
    "sante":     {"label": "Santé",     "color": "#2e9e5b"},
    "securite":  {"label": "Sécurité",  "color": "#1e4fb5"},
    "justice":   {"label": "Justice",   "color": "#c0392b"},
    "migration": {"label": "Migration", "color": "#e67e22"},
    "conseils":  {"label": "Conseils",  "color": "#2ba5d6"},
}

CONTACTS = [
    {
        "id": "police", "axis": "securite", "sos": True,
        "title": "Police", "org": "Urgence",
        "phone": "117", "dial": "117",
        "desc": "En cas de danger immédiat, 24h/24. Peut intervenir et expulser l'auteur·e du logement.",
    },
    {
        "id": "victimes142", "axis": "urgence", "pinned": True,
        "title": "Aide et soutien 24/24 · 7/7", "org": "Victimes de violences",
        "phone": "142", "dial": "142",
        "desc": "Écoute, conseils et orientation, gratuit, à toute heure.",
    },
    {
        "id": "sante144", "axis": "sante",
        "title": "Urgences santé", "org": "Ambulance",
        "phone": "144", "dial": "144",
        "desc": "Urgence vitale, blessure grave.",
    },
    {
        "id": "garde", "axis": "sante",
        "title": "Médecin de garde", "org": "Centrale des médecins de garde",
        "phone": "0848 133 133", "dial": "0848133133",
        "desc": "Pour une consultation urgente sans mettre sa vie en danger.",
    },
    {
        "id": "umv", "axis": "sante",
        "title": "Constats médico-légaux", "org": "Unité de médecine des violences",
        "phone": "021 314 00 60", "dial": "0213140060",
        "desc": "Établit un constat médical qui pourra servir de preuve, même si vous ne portez pas plainte tout de suite.",
    },
    {
        "id": "opm", "axis": "securite",
        "title": "Aide et protection des mineurs", "org": "Offices régionaux de protection des mineurs",
        "phone": "021 316 53 53", "dial": "0213165353",
        "desc": "Lorsque des enfants sont exposés à la violence.",
    },
    {
        "id": "malley_urg", "axis": "securite",
        "title": "Hébergement d'urgence", "org": "Centre d'accueil MalleyPrairie",
        "phone": "021 620 76 76", "dial": "0216207676",
        "desc": "Refuge sécurisé pour vous et vos enfants, 24h/24.",
    },
    {
        "id": "avocats", "axis": "justice",
        "title": "Avocat·e", "org": "Ordre des avocats vaudois",
        "phone": "021 320 20 60", "dial": "0213202060",
        "desc": "Trouver un·e avocat·e, mesures de protection (éloignement, garde des enfants), plainte pénale.",
    },
    {
        "id": "lavi", "axis": "justice",
        "title": "Soutien financier, juridique et psychologique", "org": "Centre LAVI",
        "phone": "021 631 03 00", "dial": "0216310300",
        "desc": "Aide aux victimes d'infractions : conseils gratuits et confidentiels, accompagnement dans les démarches.",
    },
    {
        "id": "bci", "axis": "migration",
        "title": "Mariages forcés", "org": "Bureau cantonal pour l'intégration des étrangers",
        "phone": "021 316 49 59", "dial": "0213164959",
        "desc": "Conseil et protection en cas de mariage ou de relation imposée.",
    },
    {
        "id": "fraternite", "axis": "migration",
        "title": "Accompagnement juridique et administratif pour migrant·e·s", "org": "La Fraternité du Centre social protestant",
        "phone": "021 560 60 98", "dial": "0215606098",
        "desc": "Permis de séjour, droits, démarches administratives.",
    },
    {
        "id": "malley_conseil", "axis": "conseils",
        "title": "Conseil et soutien aux victimes", "org": "Centre d'accueil MalleyPrairie",
        "phone": "021 620 76 76", "dial": "0216207676",
        "desc": "Entretiens, soutien et orientation, sans obligation d'hébergement.",
    },
    {
        "id": "vqf", "axis": "conseils",
        "title": "Conseils anonymes en ligne", "org": "violencequefaire.ch",
        "web": "https://www.violencequefaire.ch",
        "desc": "Poser une question de façon anonyme, réponse par des professionnel·le·s.",
    },
    {
        "id": "withyou", "axis": "conseils",
        "title": "Association d'entraide", "org": "with-you.ch",
        "web": "https://with-you.ch",
        "desc": "Mise en contact avec une association de soutien.",
    },
    {
        "id": "ale", "axis": "conseils",
        "title": "Conseil et soutien aux auteur·e·s", "org": "Centre Prévention de l'Ale",
        "phone": "021 321 24 00", "dial": "0213212400",
        "desc": "Pour les personnes qui exercent des violences et veulent s'arrêter.",
    },
]

VAUD_URL = (
    "https://www.vd.ch/etat-droit-finances/egalite-entre-les-femmes-et-les-hommes/"
    "violence-domestique"
)

# Lieux où l'on peut se rendre, affichés sur la carte de l'accueil d'Abri.
# Adresses vérifiées le 26.09.2026 sur les sites officiels (lavi-vaud.ch, curml.ch, ghol.ch,
# malleyprairie.ch, vd.ch/deiep/bci, vaudfamille.ch) ; coordonnées : OpenStreetMap (Nominatim).
# Les lieux d'hébergement non publics ne doivent jamais figurer ici : MalleyPrairie publie
# l'adresse de son centre lausannois, pas celle de ses consultations régionales.
# Trois couleurs seulement sur la carte : où parler, où faire constater, où porter plainte.
OFFICE_TYPES = {
    "aide":    {"label": "Aide et conseils", "color": "#e67e22"},
    "medecin": {"label": "Constat médical", "color": "#2e9e5b"},
    "police":  {"label": "Police", "color": "#1e4fb5"},
}

_LAVI_NOTE = "Conseils gratuits et confidentiels. Sur rendez-vous."
_UMV_NOTE = "Un·e médecin constate les blessures : c'est une preuve. Sur rendez-vous, 7 jours sur 7."


def _office(id, type, name, town, address, lat, lon, phone, note):
    return {"id": id, "type": type, "name": name, "town": town, "address": address,
            "lat": lat, "lon": lon, "phone": phone, "note": note}


OFFICES = [
    _office("lavi-lausanne", "aide", "Centre LAVI", "Lausanne", "Rue du Grand-Pont 2 bis, 1003 Lausanne",
            46.52047, 6.63135, "021 631 03 00", _LAVI_NOTE),
    _office("lavi-nyon", "aide", "Centre LAVI", "Nyon", "Route de l'Étraz 20A, 1260 Nyon",
            46.38799, 6.23891, "021 631 03 02", _LAVI_NOTE),
    _office("lavi-yverdon", "aide", "Centre LAVI", "Yverdon-les-Bains", "Rue de la Plaine 2, 1400 Yverdon-les-Bains",
            46.77784, 6.64191, "021 631 03 08", _LAVI_NOTE),
    _office("lavi-vevey", "aide", "Centre LAVI", "Vevey", "Avenue du Général-Guisan 30, 1800 Vevey",
            46.46488, 6.83939, "021 631 03 06", _LAVI_NOTE),
    _office("lavi-aigle", "aide", "Centre LAVI", "Aigle", "Rue du Molage 36, 1860 Aigle",
            46.3193, 6.96609, "021 631 03 04", _LAVI_NOTE),
    _office("malley", "aide", "MalleyPrairie", "Lausanne", "Chemin de la Prairie 34, 1007 Lausanne",
            46.52371, 6.60378, "021 620 76 76",
            "Accueil et hébergement d'urgence, 24h/24, avec vos enfants. Appelez avant de venir."),
    _office("fraternite", "aide", "La Fraternité (CSP)", "Lausanne", "Place Arlaud 2, 1003 Lausanne",
            46.52276, 6.63187, "021 560 60 98", "Permis de séjour et démarches pour les personnes migrantes."),
    _office("bci", "aide", "Bureau pour l'intégration (BCI)", "Lausanne", "Avenue de Sévelin 46, 1014 Lausanne",
            46.52287, 6.61912, "021 316 49 59", "Mariage forcé : conseil et protection."),
    # Unité de médecine des violences (UMV) : constats médicaux
    _office("umv-lausanne", "medecin", "CHUV", "Lausanne", "Rue du Bugnon 44, 1011 Lausanne",
            46.52468, 6.64104, "021 314 00 60", _UMV_NOTE + " Accueil des urgences PMU."),
    _office("umv-yverdon", "medecin", "Hôpital d'Yverdon", "Yverdon-les-Bains", "Rue d'Entremonts 11, 1400 Yverdon-les-Bains",
            46.77136, 6.6463, "024 424 42 20", _UMV_NOTE),
    _office("umv-nyon", "medecin", "Hôpital de Nyon", "Nyon", "Chemin Monastier 10, 1260 Nyon",
            46.3832, 6.22751, "021 314 08 51", _UMV_NOTE),
    _office("umv-rennaz", "medecin", "Espace Santé Rennaz", "Rennaz", "Route des Tilles 6A, 1847 Rennaz",
            46.37792, 6.92007, "058 773 64 77", _UMV_NOTE),
    _office("police-lausanne", "police", "Hôtel de police", "Lausanne", "Rue Saint-Martin 33, 1005 Lausanne",
            46.52504, 6.63683, "021 315 15 15", "Ouvert 24h/24. En danger : 117."),
    _office("police-cantonale", "police", "Police cantonale", "Le Mont-sur-Lausanne",
            "Route de la Blécherette 101, 1052 Le Mont-sur-Lausanne",
            46.55152, 6.62641, "021 644 44 44", "Tout poste de police peut recevoir une plainte. En danger : 117."),
]

# ---------------------------------------------------------------------------
# 4. Auto-audit de la localisation
# ---------------------------------------------------------------------------

# Écrit pour une personne stressée, pas pour un·e informaticien·ne : phrases courtes,
# pas de jargon, et chaque point dit POURQUOI avant de dire COMMENT.
# « steps » est soit une liste (identique sur iPhone et Android), soit
# {"iphone": [...], "android": [...]} ; l'interface montre ceux du téléphone choisi.

# Affiché en tête de page : couper un partage peut alerter la personne.
LOCATION_WARNING = (
    "La personne peut remarquer qu'un partage a été coupé ou qu'une application a disparu. "
    "Si cela peut vous mettre en danger, parlez-en d'abord au 142 : on vous aidera à choisir "
    "le bon moment. Vous pouvez aussi tout vérifier maintenant, et ne rien changer."
)

LOCATION_GROUPS = [
    {"id": "voir", "title": "Qui peut voir où je suis ?", "icon": "📍"},
    {"id": "acces", "title": "Quelqu'un a-t-il accès à mon téléphone ou à mes comptes ?", "icon": "🔑"},
    {"id": "objets", "title": "Un objet ou une photo peut-il dire où je suis ?", "icon": "👜"},
]

LOCATION_AUDIT = [
    {
        "id": "partage", "group": "voir", "priority": True,
        "title": "Ma position est-elle partagée ?",
        "why": "Si vous partagez votre position avec quelqu'un, cette personne voit où vous êtes, à tout moment.",
        "steps": {
            "iphone": [
                "Ouvrez Réglages, touchez votre nom, puis « Localiser ».",
                "Regardez la liste des personnes : retirez celles qui ne doivent pas savoir où vous êtes.",
                "Si Google Maps est installé : touchez votre photo › « Partage de position » › « Arrêter ».",
            ],
            "android": [
                "Ouvrez Google Maps et touchez votre photo, en haut à droite.",
                "Touchez « Partage de position ».",
                "Pour chaque personne qui ne doit pas savoir où vous êtes : « Arrêter ».",
            ],
        },
    },
    {
        "id": "applis", "group": "voir", "priority": False,
        "title": "Mes applis de messages montrent-elles où je suis ?",
        "why": "WhatsApp, Messenger et Snapchat peuvent envoyer votre position en direct, parfois sans limite de temps.",
        "steps": [
            "WhatsApp : Réglages › Confidentialité › Position en direct › « Arrêter le partage ».",
            "Messenger : dans chaque conversation, touchez « Arrêter le partage » s'il apparaît.",
            "Snapchat : ouvrez la carte, touchez la roue dentée et activez le « Mode fantôme ».",
        ],
    },
    {
        "id": "famille", "group": "voir", "priority": True,
        "title": "Une appli « famille » me suit-elle ? (Life360…)",
        "why": "Ces applis sont faites pour suivre les trajets de chaque membre d'un groupe, en temps réel.",
        "warning": "En quittant le groupe, la personne reçoit souvent une notification.",
        "steps": [
            "Cherchez sur votre téléphone une appli comme Life360, Family Link ou « Localiser ma famille ».",
            "Dans l'appli, quittez le groupe (le « cercle »), puis désinstallez-la.",
        ],
    },
    {
        "id": "compte", "group": "acces", "priority": True,
        "title": "Quelqu'un d'autre utilise-t-il mon compte ?",
        "why": "Si la personne connaît le mot de passe de votre compte Apple ou Google, elle peut voir votre position, vos photos et vos messages depuis un autre appareil.",
        "steps": {
            "iphone": [
                "Ouvrez Réglages et touchez votre nom. En bas, la liste montre vos appareils.",
                "Touchez un appareil que vous ne reconnaissez pas, puis « Supprimer du compte ».",
                "Changez le mot de passe, depuis un téléphone ou un ordinateur sûr.",
                "Vérifiez que l'e-mail et le numéro de secours sont bien les vôtres, et activez l'identification à deux facteurs.",
            ],
            "android": [
                "Ouvrez Paramètres › Google › « Gérer votre compte Google » › Sécurité › « Vos appareils ».",
                "Déconnectez tout appareil que vous ne reconnaissez pas.",
                "Changez le mot de passe, depuis un téléphone ou un ordinateur sûr.",
                "Vérifiez l'e-mail et le numéro de secours, et activez la « validation en deux étapes » avec votre numéro.",
            ],
        },
    },
    {
        "id": "espion", "group": "acces", "priority": True,
        "title": "Une appli espion est-elle installée ?",
        "why": "Certaines applis, souvent présentées comme « contrôle parental », envoient en cachette votre position, vos messages et vos photos à quelqu'un d'autre.",
        "warning": "Avant de supprimer quoi que ce soit, faites une capture d'écran et déposez-la dans le coffre : c'est une preuve. La personne peut remarquer que l'appli a disparu.",
        "steps": {
            "iphone": [
                "Ouvrez Réglages › Général › « VPN et gestion de l'appareil ».",
                "Si vous voyez un profil que vous n'avez pas installé vous-même, touchez-le puis « Supprimer ».",
                "Parcourez vos applis : une appli inconnue ou au nom banal (« Système », « Services ») doit vous alerter.",
            ],
            "android": [
                "Ouvrez Paramètres › Applications, et parcourez la liste : une appli inconnue ou au nom banal (« Système », « Services ») doit vous alerter.",
                "Cherchez dans les paramètres « Applis d'administration de l'appareil » et désactivez celles que vous ne connaissez pas.",
                "Ouvrez Google Play › votre photo › « Play Protect » › « Analyser ».",
            ],
        },
    },
    {
        "id": "traqueur", "group": "objets", "priority": False,
        "title": "Un traqueur est-il caché sur moi ? (AirTag…)",
        "why": "Un petit objet glissé dans un sac, une poche ou une voiture peut suivre tous vos déplacements.",
        "warning": "Si vous en trouvez un, prenez-le en photo pour le coffre avant de l'enlever.",
        "steps": {
            "iphone": [
                "Ouvrez l'appli Localiser › Objets › « Objets détectés avec vous ».",
                "Si votre iPhone affiche « AirTag détecté près de vous », prenez-le au sérieux.",
                "Fouillez sac, manteau, doublures et voiture (pare-chocs, boîte à gants, sous les sièges).",
            ],
            "android": [
                "Ouvrez Paramètres › « Sécurité et urgences » › « Alertes de traqueurs inconnus » › « Rechercher maintenant ».",
                "Prenez au sérieux une alerte de traqueur inconnu.",
                "Fouillez sac, manteau, doublures et voiture (pare-chocs, boîte à gants, sous les sièges).",
            ],
        },
    },
    {
        "id": "photos", "group": "objets", "priority": False,
        "title": "Mes photos et mes applis révèlent-elles où je suis ?",
        "why": "Une photo envoyée peut contenir le lieu exact où elle a été prise, et certaines applis connaissent votre position sans raison.",
        "steps": {
            "iphone": [
                "Ouvrez Réglages › Confidentialité et sécurité › « Service de localisation ».",
                "Pour l'appareil photo, choisissez « Jamais ».",
                "Pour les autres applis : « Jamais », ou « Lorsque l'app est active » si elle en a vraiment besoin.",
            ],
            "android": [
                "Ouvrez Paramètres › Localisation › « Autorisations des applications ».",
                "Pour chaque appli : « Refuser », ou « Seulement si l'appli est en cours d'utilisation » si elle en a vraiment besoin.",
                "Dans l'appareil photo, ouvrez les paramètres et désactivez la localisation des photos.",
            ],
        },
    },
]

# Un seul geste qui coupe tout — il n'existe que sur iPhone.
LOCATION_QUICK = {
    "iphone": "Réglages › Confidentialité et sécurité › « Contrôle de sécurité » › « Réinitialisation "
              "d'urgence » : coupe d'un coup tous les partages de position et tous les accès donnés à "
              "d'autres personnes.",
}

LOCATION_TIPS = [
    "Un VPN ne cache pas votre position : il faut couper les partages ci-dessus.",
    "Si vous pensez que votre téléphone est surveillé, utilisez un autre téléphone "
    "(prêté ou neuf) pour appeler à l'aide ou préparer un départ.",
    "Pas besoin de tout faire aujourd'hui : cochez ce qui est fait, Abri s'en souvient.",
]

# Résultats de l'analyse automatique. Un prototype web ne peut pas réellement
# inspecter un téléphone : ces résultats sont fixes et servent la démonstration.
SCAN_FINDINGS = [
    {"item": "espion", "level": "high",
     "text": "Une appli de surveillance semble installée (« Contrôle parental »)",
     "detail": "Elle peut envoyer votre position, vos messages et vos photos à quelqu'un d'autre."},
    {"item": "partage", "level": "high",
     "text": "Votre position est partagée en continu avec 1 personne",
     "detail": "Cette personne voit où vous êtes, à tout moment."},
    {"item": "famille", "level": "high",
     "text": "Life360 : votre position est partagée avec le groupe « Famille »",
     "detail": "Les membres du groupe voient vos trajets."},
    {"item": "compte", "level": "medium",
     "text": "Un appareil que vous n'utilisez pas est connecté à votre compte",
     "detail": "Il peut recevoir vos messages et voir votre position."},
    {"item": "photos", "level": "medium",
     "text": "7 applis connaissent votre position exacte",
     "detail": "Dont Instagram, Snapchat et l'appareil photo."},
    {"item": "applis", "level": "medium",
     "text": "Snapchat montre votre position à vos amis",
     "detail": "Le « Mode fantôme » est désactivé."},
    {"item": "traqueur", "level": "ok",
     "text": "Aucun traqueur détecté près de vous",
     "detail": ""},
]

# ---------------------------------------------------------------------------
# 5. Coffre à preuves : catégories et pièces d'un dossier de plainte
# ---------------------------------------------------------------------------

# Écrit en français facile (FALC) : phrases courtes, mots de tous les jours, une idée à la
# fois. Pensé pour un enfant de 9 ans ou une personne qui lit mal le français.
EVIDENCE_CATEGORIES = [
    {"id": "blessure", "label": "Blessure", "icon": "🩹"},
    {"id": "message", "label": "Message ou menace", "icon": "💬"},
    {"id": "degats", "label": "Dégâts matériels", "icon": "🔨"},
    {"id": "document", "label": "Document", "icon": "📄"},
    {"id": "audio", "label": "Audio", "icon": "🎙️"},
    {"id": "autre", "label": "Autre", "icon": "📎"},
]

# Ce qu'il faut pour porter plainte (onglet « Ma liste » du coffre, et résultat du questionnaire).
# sections : sections du questionnaire pour lesquelles c'est utile. always : toujours utile.
# category : où le ranger dans le coffre (None = à faire hors de l'application).
DOSSIER_ITEMS = [
    {"id": "identite", "always": True, "icon": "🪪",
     "label": "Pièce d'identité",
     "detail": "Carte d'identité, passeport ou permis de séjour. Une photo suffit.",
     "category": "document"},
    {"id": "constat", "sections": ["physique", "sexuelle"], "icon": "🩺",
     "label": "Constat médical",
     "detail": "Un médecin décrit vos blessures par écrit. À faire vite, "
               "même si vous ne portez pas plainte tout de suite.",
     "category": "document", "contact": "umv"},
    {"id": "photos", "sections": ["physique", "psychologique"], "icon": "📷",
     "label": "Photos des blessures ou des dégâts",
     "detail": "Prenez-les rapidement : le coffre enregistre la date.",
     "category": "blessure"},
    {"id": "messages", "sections": ["psychologique", "economique", "mariage", "sexuelle"], "icon": "💬",
     "label": "Captures d'écran des messages",
     "detail": "L'expéditeur et la date doivent être visibles. N'effacez rien.",
     "category": "message"},
    {"id": "journal", "always": True, "icon": "📝",
     "label": "Récit des faits",
     "detail": "Ce qui s'est passé, quand, où, et qui était présent.",
     "category": "journal"},
    {"id": "temoins", "always": True, "icon": "👥",
     "label": "Liste des témoins",
     "detail": "Voisins, famille, amis, médecin, école : notez leur nom et leur numéro.",
     "category": None},
    {"id": "banque", "sections": ["economique"], "icon": "💶",
     "label": "Documents financiers",
     "detail": "Relevés bancaires, factures, dettes.",
     "category": "document"},
    {"id": "civil", "sections": ["mariage"], "icon": "📑",
     "label": "État civil et séjour",
     "detail": "Acte de mariage, livret de famille, permis de séjour. Gardez-en une copie ici.",
     "category": "document"},
    {"id": "audio", "optional": True, "icon": "🎙️",
     "label": "Enregistrements audio",
     "detail": "Attention : enregistrer quelqu'un en secret peut être interdit (art. 179ter CP). "
               "Demandez d'abord au Centre LAVI.",
     "category": "audio"},
]

# Assistant (aperçu) : panneau de discussion ouvert en glissant vers la droite dans Abri,
# ou avec la bulle de l'accueil. Pas encore relié à un modèle d'IA : voir logic.assistant_reply.
ASSISTANT = {
    "name": "Assistant Abri",
    "status": "Aperçu · pas encore actif",
    "greeting": [
        "Bonjour. Je suis l'assistant d'Abri.",
        "Bientôt, je pourrai vous écouter, répondre à vos questions et vous orienter vers "
        "les bonnes personnes, à votre rythme.",
    ],
    "suggestions": [
        "Est-ce que ce que je vis est de la violence ?",
        "Comment porter plainte ?",
        "Où dormir ce soir en sécurité ?",
        "J'ai peur, je veux parler à quelqu'un",
    ],
    "placeholder_reply": "Je ne suis pas encore disponible : cet assistant est un aperçu. "
                         "En attendant, des personnes formées peuvent vous répondre tout de suite, "
                         "gratuitement et en toute confidentialité.",
    "placeholder_actions": [
        {"label": "Appeler le 142", "contact": "victimes142"},
        {"label": "Centre LAVI", "contact": "lavi"},
        {"label": "Faire le point", "goto": "quiz"},
    ],
    "notice": "Aperçu : l'assistant n'est relié à aucune IA pour l'instant. "
              "Vos messages ne sont transmis à aucun service extérieur ni gardés : ils disparaissent en quittant Abri.",
}

PLAINTE_INFO = [
    "La plainte se dépose auprès de la police (poste de police ou 117) ou du Ministère public.",
    "Le Centre LAVI (021 631 03 00) peut vous accompagner gratuitement dans toutes les démarches.",
    "Certaines infractions commises dans le couple sont poursuivies d'office : la procédure continue même si vous retirez la plainte.",
    "La police peut expulser immédiatement l'auteur·e du logement commun (jusqu'à 30 jours dans le canton de Vaud) ; un·e avocat·e peut demander des mesures de protection (interdiction d'approcher, art. 28b CC).",
]
