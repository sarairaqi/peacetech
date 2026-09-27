# Abri — prototype « Petits Plats »

Prototype d'application pour la protection numérique des victimes de violence domestique
(canton de Vaud). L'application se présente comme une app de cuisine, **Petits Plats** ;
l'espace protégé, **Abri**, ne s'ouvre qu'avec la bonne recette et le bon nombre de personnes
(ou, en option, d'un geste avec Face ID). L'app peut aussi prendre l'apparence de **Wikipédia**
(Abri s'ouvre alors avec un mot secret tapé dans la recherche), et elle existe en six langues.

> Prototype de hackathon : l'interface est complète et interactive, mais les appels VoIP,
> les SMS, l'analyse du téléphone, la position figée, Face ID, la sauvegarde dans le cloud, le
> « dernier recours » et le blocage des enregistrements d'écran sont **simulés**
> (voir « Ce qui est simulé »).

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

Pour repartir de zéro (premier lancement, preuves effacées) : `python app.py --reset` (tous les
appareils) ou, dans l'espace protégé, Réglages → « Réinitialiser la démo » (cet appareil seulement).
La langue choisie est conservée.

**Un appareil = un compte.** Chaque navigateur reçoit un cookie anonyme (`pp_device`, HttpOnly, 2 ans)
et a ses propres données : recette secrète, coffre, journal, réglages, langue. Deux téléphones ne
voient jamais les données l'un de l'autre, et un jeton ouvert sur l'un est refusé sur l'autre.
Effacer le cookie (ou changer de navigateur) = nouvel appareil, sans accès aux anciennes données.

## Langues

Français, English, Español, Português, Shqip, Schwiizerdütsch. La langue se choisit dans
« Petits Plats » → Profil → Langue, avec le sélecteur « Langue » en haut de l'écran d'accueil
(premier lancement) ou dans Abri → Réglages → Langue ; elle change tout de suite, sans quitter
l'écran en cours, et s'applique à toute l'app (recettes, apparence Wikipédia, Abri, export ZIP).
Les noms, catégories et régions des recettes sont traduits ; ingrédients et étapes restent en
français. L'apparence Wikipédia suit la langue (en/es/pt/sq.wikipedia.org, als.wikipedia.org
pour le suisse allemand).

Les traductions sont dans `i18n/<code>.py`, indexées par le texte français : un texte ajouté
en français reste simplement en français tant qu'il n'est pas traduit. Pour lister ce qui manque :
`python -m i18n.check`.

## Démo « enregistrement d'écran » (FLAG_SECURE)

À côté du téléphone, un second panneau montre ce que verrait une personne qui enregistre ou
regarde l'écran à distance : il reste noir, comme le fait `FLAG_SECURE` sur Android pour tous les
écrans de l'app, pendant que l'utilisatrice continue à voir l'app normalement. Le bouton
« Start screen recording » (en haut à gauche, hors du téléphone) lance le compteur « REC ».
C'est une mise en scène pour la présentation : `static/demo-rec.js` et `static/demo-rec.css`
ne touchent à rien dans l'app. Pour la retirer, supprimer ces deux fichiers et leurs deux lignes
dans `templates/index.html`.

## Scénario de démonstration (3 minutes)

1. **Premier lancement** — choisir la langue (sélecteur en haut), puis l'assistant demande de
   choisir une recette secrète et un nombre secret de personnes (ex. *Fondue moitié-moitié · 6*).
2. **App de cuisine** — recettes, recherche, favoris (gardés d'une visite à l'autre), liste de
   courses, profil avec la langue : une app ordinaire.
3. **Mauvaise combinaison** — ouvrir la fondue, mettre 5 personnes, « Adapter les quantités » :
   la recette est simplement adaptée, aucune erreur, aucune trace.
4. **Bonne combinaison** — 6 personnes → l'espace protégé **Abri** s'ouvre sur l'**accueil** :
   un mot d'accueil, « Faire le point sur ma situation », les services recommandés (après le
   questionnaire), puis tous les services vaudois par domaine (repliés), avec leurs **adresses**
   et un lien « Carte ».
5. **Barre « Ma position »** (en haut de chaque page) — un interrupteur pour **figer la position** :
   les applis et les partages voient un lieu fixe, plus les déplacements (simulé).
6. **Situation** — questionnaire Oui/Non du canton de Vaud (22 questions, 5 formes de violence)
   + 2 questions de contexte (enfants, permis de séjour) → niveau de danger, actions à faire,
   services recommandés, **pièces à préparer pour porter plainte**.
7. **Position** — figer / rendre visible, **carte** des lieux d'aide (LAVI, UMV, MalleyPrairie,
   police) avec votre position, vérification automatique (simulée), puis les points à régler en
   trois groupes repliés (iPhone / Android). Tout en bas, le lien discret **« Je suis partie ·
   dernier recours »** : à utiliser une fois en sécurité, loin du domicile. Après un avertissement
   (la personne verra que le partage s'est arrêté) et un appui maintenu 3 secondes, Abri coupe
   d'un coup les applis de surveillance, le partage et la recopie d'écran, le partage de position
   et les appareils inconnus des comptes (simulé), puis rappelle que les preuves restent sauvegardées.
8. **Coffre** — « Ajouter une preuve » → choisir le **type** (blessure, message, dégâts, document,
   audio, autre, ou prendre une photo) → fichier → note (ou glisser-déposer des fichiers sur
   ordinateur). Preuves rangées par type, horodatage, empreinte SHA-256, journal chronologique,
   état du dossier, **export ZIP** prêt pour un·e avocat·e ou le Centre LAVI. Un encadré indique
   que preuves et journal sont **sauvegardés dans un cloud privé** (simulé), pour les retrouver si
   le téléphone est cassé, perdu ou confisqué.
9. **Guides et témoignages** (icône livre en haut, ou tuile de l'accueil) — 7 guides pratiques
   (partir en sécurité, appeler le 117, porter plainte, mes droits, sécuriser mon téléphone, parler
   aux enfants, violence économique), paroles de victimes (récits illustratifs) et sites utiles.
10. **Assistant** (aperçu) — bouton **robot** en bas à droite, ou glisser vers la droite : panneau
    de discussion avec suggestions. Pas encore d'IA : la réponse est fixe et renvoie vers le 142,
    le Centre LAVI ou « Situation ».
11. **SOS** — bouton rouge en bas : appel police 117 via l'app (pas dans l'historique d'appels).
12. **Réglages** (roue dentée) — apparence de l'app, langue, codes secrets (recette et mot secret
    Wikipédia, que l'on peut afficher), ouverture rapide, sécurité, réinitialisation. Changer une
    option met la feuille à jour sur place, sans la faire réapparaître. Comme toutes les feuilles
    (ajout de preuve, guides…), elle se referme en la glissant vers le bas.
13. **Face ID** (Réglages → « Ouverture rapide ») — sur l'accueil des recettes, garder le doigt
    appuyé **3 secondes sur « Bonjour »** (avec l'apparence Wikipédia : sur le titre de l'accueil) :
    animation Face ID (simulée) et Abri s'ouvre sans code secret.
14. **Apparence Wikipédia** — Réglages → « Apparence de l'app » → Wikipédia : un petit accueil
    explique le principe, fait choisir un mot secret puis le rappelle. L'app devient un miroir de
    Wikipédia dans la langue choisie (vrais articles, recherche) ; taper le mot secret dans la
    recherche puis Entrée ouvre Abri. La recette secrète ne marche plus tant que cette apparence est
    active ; on peut revenir aux recettes ou changer le mot depuis les Réglages.
15. **Retour en cuisine** / **Retour à Wikipédia** (ou touche Échap) — retour immédiat à
    l'apparence choisie ; verrouillage automatique après 3 min d'inactivité.

## Structure du projet

```
peacetech/
├── app.py            # serveur Flask : routes API, jeton d'accès à l'espace protégé
├── logic.py          # logique : authentification recette, options (position figée, Face ID),
│                     #           évaluation du questionnaire, coffre à preuves, export ZIP
├── content.py        # contenu : recettes, questionnaire, réseau vaudois + adresses (OFFICES),
│                     #           checklist position, pièces du dossier, guides et témoignages
│                     #           (RESOURCES)  ← à modifier en priorité
├── recettes_*.py     # 200 recettes (suisses, françaises, internationales) : 60 toujours
│                     #   affichées — les seules utilisables comme recette secrète —
│                     #   et une réserve de 140 d'où sortent 2 « recettes du jour »
├── templates/index.html
├── static/app.js     # interface (une seule page, état + rendu) ; section 4 = Abri
├── static/style.css  # deux univers visuels : cuisine (cahier de recettes) / Abri (prune, rose, lavande)
├── i18n/             # langues : un fichier par langue (en, es, pt, sq, gsw ; fr = source),
│                     #   traductions indexées par le texte français ; check.py liste les manques
├── wikimirror.py     # apparence « Wikipédia » : relais vers <langue>.wikipedia.org (recherche, articles)
├── static/wiki.js    # 5 articles de secours par langue (démo sans Internet)
├── static/demo-rec.* # démo FLAG_SECURE (panneau « enregistrement »), retirable
├── static/icon-*.png # icône « Petits Plats » (cahier de recettes vichy, cocotte)
├── static/icon-wiki.svg   # icône utilisée avec l'apparence Wikipédia
├── static/abri-logo.png   # logo d'Abri (pour la présentation)
├── static/vendor/leaflet/  # Leaflet 1.9.4 (carte de l'onglet Position), chargé seulement
│                     #   une fois Abri ouvert ; fonds de carte : OpenStreetMap
└── storage/devices/<id>/  # un dossier par appareil (ignoré par git) : config.json (secrets), evidence/ +
                      #   evidence.json (preuves), journal.json, location_audit.json,
                      #   last_result.json (dernier questionnaire), prefs.json (réglages),
                      #   favoris.json, lang.json, sessions.json
```

Python a été choisi plutôt que Java : Flask tient en un fichier, l'upload de fichiers est
natif, et l'interface web s'affiche telle quelle sur un vrai téléphone pour la démo.

## Comment fonctionne l'accès secret

`POST /api/cover/adapt {recipe_id, persons}` renvoie toujours les quantités adaptées (comportement
normal). Si le couple correspond au secret stocké dans `storage/devices/<id>/config.json`, la réponse contient
en plus un jeton ; l'interface bascule alors sur Abri et envoie ce jeton (`X-Abri-Token`) sur toutes
les routes protégées. Le jeton vit en mémoire côté serveur et en mémoire côté navigateur :
rien n'est écrit dans le navigateur (pas de localStorage, pas d'URL), le titre de l'onglet reste
« Petits Plats ».

Avec l'apparence **Wikipédia**, c'est `POST /api/wiki/search {q, submit}` qui joue ce rôle : il renvoie
toujours des suggestions, et un jeton si la recherche validée (Entrée) est le mot secret. La
vérification compare une empreinte SHA-256 (`wiki_phrase` dans `config.json`) ; le mot lui-même est
aussi gardé (`wiki_word`) pour pouvoir le rappeler dans les Réglages d'Abri, comme la recette secrète.
`config.json` ne se lit que sur l'ordinateur qui héberge l'app : c'est un camouflage, pas un
coffre-fort. Seul le secret de l'apparence active ouvre Abri.

**Face ID** (option) : `POST /api/cover/quick` délivre un jeton si l'option est activée dans les
Réglages. La reconnaissance du visage est simulée par l'interface ; une vraie app passerait par la
biométrie du téléphone avant d'appeler cette route.

**Routes publiques** (sans jeton, comme dans n'importe quelle app) : les favoris des recettes
(`GET/POST /api/cover/favs`) et la langue (`GET /api/i18n`, `POST /api/lang {lang}`). Elles ne
révèlent rien de l'espace protégé.

## Ce qui est simulé (à dire au jury)

- **Appels et messages** : écran d'appel VoIP et composeur de message dans l'app ; aucun appel réel
  n'est passé. Dans une vraie app, ils passeraient par un service VoIP/SMS (Twilio, etc.).
- **Position figée** : l'interrupteur mémorise l'état et la carte le montre, mais un site web ne peut
  pas changer la position vue par les autres applis. C'est le rôle d'une app native (iOS : « position
  approximative » et révocation des partages ; Android : position fictive via les options développeur).
- **Face ID** : animation simulée (voir ci-dessus).
- **Analyse automatique du téléphone** : résultats fixes (`SCAN_FINDINGS` dans `content.py`).
  Une app native pourrait détecter les profils MDM, les partages actifs et les appareils du compte.
- **Votre position sur la carte** : point fixe (centre de Lausanne / place de la Riponne quand la
  position est figée), pas la géolocalisation réelle.
- **Chiffrement du coffre** : les fichiers sont stockés en clair dans `storage/devices/<id>/evidence/`
  (l'horodatage et l'empreinte SHA-256 sont réels).
- **Sauvegarde dans le cloud privé** : l'encadré du Coffre l'annonce, mais les preuves restent sur
  le serveur local du prototype. Une vraie version les chiffrerait et les copierait hors du téléphone,
  récupérables depuis un autre appareil avec l'accès discret.
- **Dernier recours « Je suis partie »** : les étapes et les résultats sont fixes (`departSteps` et
  `departResults` dans `static/app.js`) ; rien n'est réellement coupé. Seule une app native pourrait
  désinstaller une appli espion, arrêter les partages ou déconnecter des appareils.
- **Blocage des enregistrements d'écran** : le panneau noir est une mise en scène
  (`static/demo-rec.js`). Sur Android, c'est `FLAG_SECURE` qui le ferait ; un site web ne le peut pas.
- **Témoignages** : récits illustratifs écrits pour le prototype, à remplacer par des témoignages
  recueillis avec l'accord des personnes (MalleyPrairie, LAVI, with-you.ch), anonymisés.
- **Assistant** : aperçu non fonctionnel. `POST /api/assistant` renvoie une réponse fixe ; le futur
  modèle d'IA se branche dans `logic.assistant_reply` (même forme de réponse : `text` + `actions`).
  Les messages ne vivent qu'en mémoire dans le navigateur et sont effacés au verrouillage.
- **Enregistrement d'urgence** (Réglages, marqué « À venir ») : **placeholder non fonctionnel.**
  L'interrupteur est mémorisé (`logic.FEATURES` / `prefs.json`) mais rien n'enregistre. Impossible en
  web (le navigateur coupe la caméra dès l'arrière-plan) : une vraie version demanderait une app
  native. Voir le commentaire dans `logic.py` pour les limites légales (art. 179bis/ter CP).

## Sources

- Questionnaire et réseau d'aide : canton de Vaud, Bureau de l'égalité entre les femmes et les
  hommes — « Violence domestique : où trouver de l'aide ? »
  https://www.vd.ch/etat-droit-finances/egalite-entre-les-femmes-et-les-hommes/violence-domestique
- Adresses des lieux d'aide : sites officiels (lavi-vaud.ch, curml.ch, malleyprairie.ch, vd.ch) ;
  coordonnées : OpenStreetMap.
