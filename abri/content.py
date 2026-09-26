"""
content.py — Tout le contenu "métier" du prototype Abri.

  • RECIPES          : les recettes de l'application de couverture "Petits Plats"
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

RECIPE_CATEGORIES = ["Tous", "Entrées", "Plats", "Desserts"]

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

# ---------------------------------------------------------------------------
# 4. Auto-audit de la localisation
# ---------------------------------------------------------------------------

LOCATION_GROUPS = [
    {"id": "partage", "title": "Partage de position", "icon": "📍"},
    {"id": "permissions", "title": "Permissions des applications", "icon": "🔐"},
    {"id": "comptes", "title": "Comptes reliés", "icon": "👤"},
    {"id": "appareil", "title": "Appareil et traqueurs", "icon": "📱"},
]

LOCATION_AUDIT = [
    {
        "id": "findmy", "group": "partage", "severity": "high",
        "title": "Localiser (Find My) — partage de position",
        "risk": "Toute personne avec qui vous partagez votre position dans « Localiser » voit où vous êtes en permanence.",
        "steps": [
            "Réglages › [votre nom] › Localiser",
            "Désactiver « Partager ma position », ou retirer chaque personne de la liste",
            "Vérifier aussi « Localiser mon iPhone » : il doit rester activé uniquement pour vous",
        ],
    },
    {
        "id": "gmaps", "group": "partage", "severity": "high",
        "title": "Google Maps — partage de position",
        "risk": "Le partage Google Maps peut être illimité dans le temps et invisible au quotidien.",
        "steps": [
            "Google Maps › votre photo de profil › Partage de position",
            "Pour chaque personne : « Arrêter »",
        ],
    },
    {
        "id": "snap", "group": "partage", "severity": "medium",
        "title": "Snapchat — Snap Map",
        "risk": "La Snap Map montre votre position à vos amis dès l'ouverture de l'application.",
        "steps": [
            "Snapchat › Réglages › Voir ma position",
            "Activer le « Mode fantôme »",
        ],
    },
    {
        "id": "messengers", "group": "partage", "severity": "medium",
        "title": "WhatsApp / Messenger — position en direct",
        "risk": "Un partage de position en direct peut durer jusqu'à 8 h, ou indéfiniment sur Messenger.",
        "steps": [
            "WhatsApp › Réglages › Confidentialité › Position en direct : « Arrêter le partage »",
            "Messenger › conversation › Position › « Arrêter le partage »",
        ],
    },
    {
        "id": "life360", "group": "partage", "severity": "high",
        "title": "Life360 et applications « famille »",
        "risk": "Ces applications sont conçues pour suivre les membres d'un cercle en temps réel.",
        "steps": [
            "Quitter le cercle ou désinstaller l'application",
            "Attention : la personne recevra parfois une notification de départ — choisissez le bon moment",
        ],
    },
    {
        "id": "precise", "group": "permissions", "severity": "medium",
        "title": "Localisation précise, application par application",
        "risk": "Une application peut transmettre votre position exacte à quelqu'un d'autre (réseaux sociaux, photos géolocalisées).",
        "steps": [
            "Réglages › Confidentialité et sécurité › Service de localisation",
            "Pour chaque application : « Jamais » ou « Lorsque l'app est active »",
            "Désactiver « Position exacte » quand ce n'est pas nécessaire",
        ],
    },
    {
        "id": "photos", "group": "permissions", "severity": "low",
        "title": "Photos géolocalisées",
        "risk": "Une photo partagée peut contenir le lieu exact où elle a été prise.",
        "steps": [
            "Lors du partage : Options › désactiver « Lieu »",
            "Réglages › Confidentialité › Service de localisation › Appareil photo : « Jamais »",
        ],
    },
    {
        "id": "appleid", "group": "comptes", "severity": "high",
        "title": "Compte Apple / Google partagé ou connu de l'auteur·e",
        "risk": "C'est souvent ainsi que la position, les messages et les photos sont consultés : depuis un autre appareil connecté au même compte.",
        "steps": [
            "Réglages › [votre nom] › faire défiler : supprimer tout appareil que vous ne reconnaissez pas",
            "Changer le mot de passe du compte, depuis un appareil sûr",
            "Vérifier l'adresse e-mail et le numéro de secours du compte",
        ],
    },
    {
        "id": "2fa", "group": "comptes", "severity": "medium",
        "title": "Double authentification",
        "risk": "Sans double authentification, un mot de passe connu suffit à tout consulter.",
        "steps": [
            "Activer la validation en deux étapes (Apple, Google, WhatsApp, Instagram…)",
            "Utiliser votre propre numéro ou une application d'authentification",
        ],
    },
    {
        "id": "profiles", "group": "appareil", "severity": "high",
        "title": "Profils de configuration / gestion d'appareil (MDM)",
        "risk": "Les logiciels espions « parentaux » (stalkerware) s'installent souvent par un profil : il donne le contrôle de l'appareil à quelqu'un d'autre.",
        "steps": [
            "Réglages › Général › VPN et gestion de l'appareil",
            "Supprimer tout profil que vous n'avez pas installé vous-même",
        ],
    },
    {
        "id": "trackers", "group": "appareil", "severity": "medium",
        "title": "Traqueurs Bluetooth (AirTag, SmartTag…)",
        "risk": "Un petit traqueur glissé dans un sac ou une voiture suit vos déplacements.",
        "steps": [
            "Localiser › Objets › « Objets détectés avec vous »",
            "Prendre au sérieux la notification « AirTag détecté à proximité »",
            "Inspecter sac, manteau, voiture (pare-chocs, boîte à gants)",
        ],
    },
    {
        "id": "safetycheck", "group": "appareil", "severity": "low",
        "title": "Contrôle de sécurité iOS — réinitialisation d'urgence",
        "risk": "iOS propose une commande unique qui coupe d'un coup tous les partages avec toutes les personnes.",
        "steps": [
            "Réglages › Confidentialité et sécurité › Contrôle de sécurité",
            "« Réinitialisation d'urgence » : révoque tous les accès et partages",
        ],
    },
    {
        "id": "vpn", "group": "appareil", "severity": "low",
        "title": "VPN / iCloud Private Relay",
        "risk": "Utile pour masquer votre adresse IP sur le web — mais cela ne cache PAS le GPS partagé via Localiser ou Google Maps.",
        "steps": [
            "Réglages › [votre nom] › iCloud › Relais privé",
            "Ne pas compter sur un VPN pour arrêter un partage de position",
        ],
    },
]

# Résultats de l'analyse automatique. Un prototype web ne peut pas réellement
# inspecter un téléphone : ces résultats sont fixes et servent la démonstration.
SCAN_FINDINGS = [
    {"item": "profiles", "level": "high",
     "text": "Profil de configuration inconnu installé : « Contrôle parental »",
     "detail": "Ce type de profil peut transmettre position, messages et captures d'écran à un autre appareil."},
    {"item": "findmy", "level": "high",
     "text": "Partage de position actif dans Localiser avec 1 personne",
     "detail": "Votre position est visible en continu."},
    {"item": "life360", "level": "high",
     "text": "Life360 installé — position partagée avec le cercle « Famille »",
     "detail": "Historique des trajets consultable par les membres du cercle."},
    {"item": "appleid", "level": "medium",
     "text": "2 appareils connectés à votre identifiant Apple, dont un iPad que vous n'utilisez pas",
     "detail": "Cet appareil reçoit vos messages et peut voir votre position."},
    {"item": "precise", "level": "medium",
     "text": "Position exacte activée pour 7 applications",
     "detail": "Dont Instagram, Snapchat, Facebook et l'appareil photo."},
    {"item": "snap", "level": "medium",
     "text": "Snap Map : mode fantôme désactivé",
     "detail": "Vos amis Snapchat voient votre dernière position."},
    {"item": "messengers", "level": "ok",
     "text": "WhatsApp : aucun partage de position en direct",
     "detail": ""},
    {"item": "trackers", "level": "ok",
     "text": "Aucun traqueur Bluetooth détecté à proximité",
     "detail": ""},
]

# ---------------------------------------------------------------------------
# 5. Coffre à preuves : catégories et pièces d'un dossier de plainte
# ---------------------------------------------------------------------------

EVIDENCE_CATEGORIES = [
    {"id": "blessure", "label": "Photo de blessure", "icon": "🩹"},
    {"id": "message", "label": "Message / menace (capture)", "icon": "💬"},
    {"id": "degats", "label": "Dégâts matériels", "icon": "🔨"},
    {"id": "document", "label": "Document (constat, relevé…)", "icon": "📄"},
    {"id": "audio", "label": "Enregistrement audio", "icon": "🎙️"},
    {"id": "autre", "label": "Autre", "icon": "📎"},
]

# sections : les sections du questionnaire pour lesquelles la pièce est utile.
# always  : toujours utile. category : catégorie du coffre où la déposer.
DOSSIER_ITEMS = [
    {"id": "identite", "always": True,
     "label": "Pièce d'identité",
     "detail": "Carte d'identité, passeport ou permis de séjour (copie dans le coffre).",
     "category": "document"},
    {"id": "constat", "sections": ["physique", "sexuelle"],
     "label": "Constat médical",
     "detail": "À faire établir le plus vite possible après les faits à l'Unité de médecine des violences (021 314 00 60), même sans porter plainte tout de suite : le constat est conservé et peut servir plus tard.",
     "category": "document", "contact": "umv"},
    {"id": "photos", "sections": ["physique", "psychologique"],
     "label": "Photos datées des blessures ou des dégâts",
     "detail": "Prenez-les dès que possible, avec la date et l'heure ; déposez-les dans le coffre (horodatage automatique).",
     "category": "blessure"},
    {"id": "messages", "sections": ["psychologique", "economique", "mariage", "sexuelle"],
     "label": "Captures d'écran des messages, appels et menaces",
     "detail": "Numéro ou nom de l'expéditeur, date et heure visibles. Ne supprimez rien.",
     "category": "message"},
    {"id": "journal", "always": True,
     "label": "Chronologie des faits",
     "detail": "Quoi, quand, où, qui a vu : notez chaque événement dans le journal du coffre.",
     "category": "journal"},
    {"id": "temoins", "always": True,
     "label": "Coordonnées des témoins",
     "detail": "Voisin·e·s, proches, collègues, médecin, école des enfants.",
     "category": None},
    {"id": "banque", "sections": ["economique"],
     "label": "Relevés bancaires, contrats, factures",
     "detail": "Pour documenter les retraits, dettes ou dépenses imposées.",
     "category": "document"},
    {"id": "civil", "sections": ["mariage"],
     "label": "Documents d'état civil et de séjour",
     "detail": "Acte de mariage, livret de famille, permis : mettez des copies en lieu sûr (coffre).",
     "category": "document"},
    {"id": "audio", "optional": True,
     "label": "Enregistrements audio",
     "detail": "Enregistrer une conversation sans consentement peut être punissable en Suisse (art. 179ter CP) : demandez conseil à un·e avocat·e ou au Centre LAVI avant de les utiliser.",
     "category": "audio"},
]

PLAINTE_INFO = [
    "La plainte se dépose auprès de la police (poste de police ou 117) ou du Ministère public.",
    "Le Centre LAVI (021 631 03 00) peut vous accompagner gratuitement dans toutes les démarches.",
    "Certaines infractions commises dans le couple sont poursuivies d'office : la procédure continue même si vous retirez la plainte.",
    "La police peut expulser immédiatement l'auteur·e du logement commun (jusqu'à 30 jours dans le canton de Vaud) ; un·e avocat·e peut demander des mesures de protection (interdiction d'approcher, art. 28b CC).",
]
