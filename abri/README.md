# Abri — prototype « Petits Plats »

Prototype d'application pour la protection numérique des victimes de violence domestique
(canton de Vaud). L'application se présente comme une app de cuisine, **Petits Plats** ;
l'espace protégé, **Abri**, ne s'ouvre qu'avec la bonne recette et le bon nombre de personnes.

> Prototype de hackathon : l'interface est complète et interactive, mais les appels VoIP,
> les SMS et l'analyse automatique du téléphone sont **simulés** (voir « Ce qui est simulé »).

## Lancer le prototype (VS Code)

```bash
# 1. ouvrir le dossier dans VS Code, puis dans le terminal :
pip install -r requirements.txt
python app.py
# 2. ouvrir http://127.0.0.1:5000 dans le navigateur
```

Pour tester sur un téléphone connecté au même Wi-Fi :

```bash
python app.py --host 0.0.0.0
# puis ouvrir http://<adresse-IP-de-l'ordinateur>:5000 sur le téléphone
# iPhone : Partager > « Sur l'écran d'accueil » → l'icône « Petits Plats » apparaît comme une vraie app
```

Pour repartir de zéro (premier lancement, preuves effacées) : `python app.py --reset`
ou, dans l'espace protégé, Réglages → « Réinitialiser la démo ».

## Scénario de démonstration (3 minutes)

1. **Premier lancement** — l'assistant demande de choisir une recette secrète et un nombre
   secret de personnes (ex. *Fondue moitié-moitié · 6*).
2. **App de cuisine** — recettes, recherche, favoris, liste de courses : une app ordinaire.
3. **Mauvaise combinaison** — ouvrir la fondue, mettre 5 personnes, « Adapter les quantités » :
   la recette est simplement adaptée, aucune erreur, aucune trace.
4. **Bonne combinaison** — 6 personnes → l'espace protégé **Abri** s'ouvre.
5. **Situation** — questionnaire Oui/Non du canton de Vaud (22 questions, 5 formes de violence)
   + 2 questions de contexte (enfants, permis de séjour) → niveau de danger, actions à faire,
   services recommandés, **pièces à préparer pour porter plainte**.
6. **Localisation** — analyse automatique (simulée) puis checklist guidée : Localiser/Find My,
   Google Maps, Snap Map, Life360, profils MDM/stalkerware, comptes reliés, AirTags,
   « Réinitialisation d'urgence » iOS. Score de sécurité qui progresse.
7. **Preuves** — coffre horodaté (photo de blessure, capture de messages…), empreinte SHA-256,
   journal chronologique, état du dossier, **export ZIP** prêt pour un·e avocat·e ou le Centre LAVI.
8. **Contacts** — réseau vaudois (142, 117, 144, UMV, MalleyPrairie, LAVI, BCI, CSP, Ordre des
   avocats, Centre Prévention de l'Ale, violencequefaire.ch…) avec appel et message via l'app.
9. **SOS** — bouton rouge en bas : appel police 117 via l'app (pas dans l'historique d'appels).
10. **Apparence Wikipédia** — Réglages d'Abri → « Apparence de l'app » → 📖 Wikipédia, puis
    choisir un mot secret. L'app devient un miroir de Wikipédia (vrais articles, recherche) ;
    taper le mot secret dans la recherche puis Entrée ouvre Abri. La recette secrète ne marche
    plus tant que cette apparence est active.
11. **Quitter** (ou touche Échap) — retour immédiat à l'app de cuisine ; verrouillage automatique
    après 3 min d'inactivité.

## Structure du projet

```
abri/
├── app.py            # serveur Flask : routes API, jeton d'accès à l'espace protégé
├── logic.py          # logique : authentification recette, évaluation du questionnaire,
│                     #           redirections, coffre à preuves, export ZIP
├── content.py        # contenu : recettes, questionnaire, réseau vaudois, checklist
│                     #           localisation, pièces du dossier  ← à modifier en priorité
├── recettes_*.py     # 200 recettes (suisses, françaises, internationales) : 60 toujours
│                     #   affichées — les seules utilisables comme recette secrète —
│                     #   et une réserve de 140 d'où sortent 2 « recettes du jour »
├── templates/index.html
├── static/app.js     # interface (une seule page, état + rendu)
├── wikimirror.py     # apparence « Wikipédia » : relais vers fr.wikipedia.org (recherche, articles)
├── static/wiki.js    # accueil du miroir + 5 articles de secours (démo sans Internet)
├── static/style.css  # deux univers visuels : cuisine / Abri
├── static/icon-*.png # icône « app de cuisine » (écran d'accueil du téléphone)
├── static/vendor/leaflet/  # Leaflet 1.9.4 (carte de l'accueil d'Abri), chargé seulement
│                     #   une fois Abri ouvert ; fonds de carte : OpenStreetMap
└── storage/          # créé à l'usage : config.json, preuves, journal (ignoré par git)
```

Python a été choisi plutôt que Java : Flask tient en un fichier, l'upload de fichiers est
natif, et l'interface web s'affiche telle quelle sur un vrai téléphone pour la démo.

## Comment fonctionne l'accès secret

`POST /api/cover/adapt {recipe_id, persons}` renvoie toujours les quantités adaptées (comportement
normal). Si le couple correspond au secret stocké dans `storage/config.json`, la réponse contient
en plus un jeton ; l'interface bascule alors sur Abri et envoie ce jeton (`X-Abri-Token`) sur toutes
les routes protégées. Le jeton vit en mémoire côté serveur et en mémoire côté navigateur :
rien n'est écrit dans le navigateur (pas de localStorage, pas d'URL), le titre de l'onglet reste
« Petits Plats ».

Avec l'apparence **Wikipédia**, c'est `POST /api/wiki/search {q, submit}` qui joue ce rôle : il renvoie
toujours des suggestions, et un jeton si la recherche validée (Entrée) est le mot secret. Le mot secret
n'est gardé que sous forme d'empreinte SHA-256 (`wiki_phrase` dans `config.json`). Seul le secret de
l'apparence active ouvre Abri. Le serveur interroge fr.wikipedia.org ; les images viennent de
wikimedia.org, comme sur le vrai site. Sans Internet, 5 articles intégrés prennent le relais.

## Ce qui est simulé (à dire au jury)

- **Appels et messages** : écran d'appel VoIP et composeur de message dans l'app ; aucun appel réel
  n'est passé. Dans une vraie app, ils passeraient par un service VoIP/SMS (Twilio, etc.).
- **Analyse automatique du téléphone** : résultats fixes (`SCAN_FINDINGS` dans `content.py`).
  Une app native pourrait détecter les profils MDM, les partages actifs et les appareils du compte.
- **Chiffrement du coffre** : les fichiers sont stockés en clair dans `storage/evidence/`
  (l'horodatage et l'empreinte SHA-256 sont réels).
- **Enregistrement d'urgence** (Réglages, marqué « À venir ») : **placeholder non fonctionnel.**
  L'interrupteur est mémorisé (`logic.FEATURES` / `prefs.json`) mais rien n'enregistre : ni le
  triple-tap, ni la caméra, ni l'ajout au coffre. Impossible en web (le navigateur coupe la caméra
  dès l'arrière-plan) : une vraie version demanderait une app native. Voir le commentaire dans
  `logic.py` pour les limites légales (art. 179bis/ter CP) et de sécurité à traiter d'abord.

## Sources

- Questionnaire et réseau d'aide : canton de Vaud, Bureau de l'égalité entre les femmes et les
  hommes — « Violence domestique : où trouver de l'aide ? »
  https://www.vd.ch/etat-droit-finances/egalite-entre-les-femmes-et-les-hommes/violence-domestique
