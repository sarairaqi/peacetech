// wiki.js — Apparence « Wikipédia » : page d'accueil du miroir, et articles de secours affichés
// quand le serveur ne peut pas joindre fr.wikipedia.org (démo hors ligne). Voir app.js, section 0.
// Textes originaux, rédigés pour le prototype. [[id|texte]] = lien vers un autre article.
const WIKI_HOME = 'Lac Léman';
const WIKI_ARTICLES = [
  {
    id: 'leman', title: 'Lac Léman', desc: 'Lac d\'Europe de l\'Ouest, entre la Suisse et la France',
    lead: `Le <b>lac Léman</b>, aussi appelé <b>lac de Genève</b>, est un lac d'origine glaciaire situé au nord des Alpes et partagé entre la Suisse et la France. Avec une superficie d'environ 580 km², c'est l'un des plus grands lacs d'Europe occidentale. Il est traversé par le Rhône, qui y entre près du Bouveret et en ressort à Genève.`,
    infobox: [['Pays', 'Suisse, France'], ['Altitude', '372 m'], ['Superficie', '≈ 580 km²'], ['Longueur', '≈ 73 km'], ['Profondeur max.', '≈ 310 m'], ['Affluent principal', 'Rhône'], ['Émissaire', 'Rhône']],
    sections: [
      { h: 'Géographie', html: `<p>Le lac a la forme d'un croissant. Sa rive nord appartient aux cantons de [[lausanne|Vaud]] et de Genève ; sa rive sud est partagée entre le département français de la Haute-Savoie et le canton du Valais.</p><p>On distingue le <b>Grand Lac</b>, large et profond, du <b>Petit Lac</b>, sa partie genevoise, plus étroite et beaucoup moins profonde. Les principales villes riveraines sont Genève, [[lausanne|Lausanne]], Vevey, Montreux, Évian-les-Bains et Thonon-les-Bains.</p>` },
      { h: 'Vents', html: `<p>Plusieurs vents locaux portent un nom. La <b>bise</b>, froide et sèche, souffle du nord-est ; le <b>joran</b> descend brusquement du Jura en fin de journée et est redouté des navigateurs.</p>` },
      { h: 'Navigation', html: `<p>La Compagnie générale de navigation sur le lac Léman (CGN), fondée au XIX<sup>e</sup> siècle, exploite des lignes régulières entre les rives suisse et française. Sa flotte compte plusieurs bateaux à roues de la Belle Époque, classés monuments historiques.</p>` },
      { h: 'Patrimoine', html: `<p>Les rives du lac comptent de nombreux sites touristiques, parmi lesquels le [[chillon|château de Chillon]] et le vignoble en terrasses de [[lavaux|Lavaux]].</p>` },
    ],
  },
  {
    id: 'lausanne', title: 'Lausanne', desc: 'Ville de Suisse, chef-lieu du canton de Vaud',
    lead: `<b>Lausanne</b> est une ville de Suisse romande, chef-lieu du canton de Vaud. Située sur la rive nord du [[leman|lac Léman]], elle compte environ 140 000 habitants, ce qui en fait l'une des plus grandes villes du pays. Le Comité international olympique y a son siège depuis 1915, d'où son surnom de « capitale olympique ».`,
    infobox: [['Pays', 'Suisse'], ['Canton', 'Vaud'], ['Population', '≈ 140 000 hab.'], ['Altitude', '372 à 930 m'], ['Gentilé', 'Lausannois, Lausannoise']],
    sections: [
      { h: 'Géographie', html: `<p>La ville est construite sur des collines qui descendent vers le lac, du bord de l'eau à Ouchy jusqu'aux hauteurs du Jorat. Pour franchir ces fortes pentes, un métro automatique, le m2, a été mis en service en 2008 ; c'est l'un des métros les plus pentus du monde.</p>` },
      { h: 'Histoire', html: `<p>À l'époque romaine, une petite ville nommée <i>Lousonna</i> se trouvait au bord du lac, à Vidy. Au Moyen Âge, Lausanne devient le siège d'un évêché ; la cathédrale Notre-Dame est consacrée en 1275.</p><p>En 1536, les Bernois conquièrent le Pays de Vaud et y imposent la Réforme. Lausanne devient le chef-lieu du nouveau canton de Vaud en 1803.</p>` },
      { h: 'Enseignement', html: `<p>La ville accueille l'Université de Lausanne (UNIL) et l'École polytechnique fédérale de Lausanne (EPFL), toutes deux installées au bord du lac, à l'ouest de la ville.</p>` },
      { h: 'Traditions', html: `<p>Chaque nuit, un <b>guet</b> annonce les heures depuis le clocher de la cathédrale, une tradition maintenue depuis le Moyen Âge.</p>` },
    ],
  },
  {
    id: 'chillon', title: 'Château de Chillon', desc: 'Château fort sur le lac Léman, à Veytaux (Vaud)',
    lead: `Le <b>château de Chillon</b> est un château fort bâti sur un îlot rocheux du [[leman|lac Léman]], sur la commune de Veytaux, près de Montreux. Longtemps résidence des comtes de Savoie, il est aujourd'hui l'un des monuments historiques les plus visités de Suisse.`,
    infobox: [['Type', 'Château fort'], ['Commune', 'Veytaux'], ['Canton', 'Vaud'], ['Époque', 'Moyen Âge'], ['Propriétaire', 'Canton de Vaud']],
    sections: [
      { h: 'Histoire', html: `<p>Placé entre le lac et la montagne, le château contrôlait la route reliant le nord de l'Europe à l'Italie. Les comtes de Savoie l'agrandissent et en font l'une de leurs résidences.</p><p>Les Bernois s'en emparent en 1536. Après la révolution vaudoise de 1798, il revient au canton de Vaud, qui en est propriétaire depuis 1803.</p>` },
      { h: 'Le prisonnier de Chillon', html: `<p>Le réformateur genevois François Bonivard y fut enfermé pendant plusieurs années avant d'être libéré en 1536. Son histoire inspira au poète anglais Lord Byron le poème <i>Le Prisonnier de Chillon</i> (1816), qui fit la célébrité du château dans toute l'Europe.</p>` },
      { h: 'Visite', html: `<p>Le château est ouvert au public toute l'année. On y visite les souterrains, les salles d'apparat et les chemins de ronde, avec une vue sur le lac et sur les Alpes.</p>` },
    ],
  },
  {
    id: 'lavaux', title: 'Lavaux', desc: 'Région viticole du canton de Vaud',
    lead: `<b>Lavaux</b> est une région viticole du canton de Vaud qui s'étend sur une trentaine de kilomètres le long de la rive nord du [[leman|lac Léman]], entre [[lausanne|Lausanne]] et le [[chillon|château de Chillon]]. Ses vignes en terrasses sont inscrites au patrimoine mondial de l'UNESCO depuis 2007.`,
    infobox: [['Pays', 'Suisse'], ['Canton', 'Vaud'], ['Cépage principal', 'Chasselas'], ['Patrimoine mondial', '2007']],
    sections: [
      { h: 'Histoire', html: `<p>Les terrasses ont été aménagées à partir du Moyen Âge par des moines, qui ont construit les premiers murs de pierre pour retenir la terre sur les pentes raides.</p>` },
      { h: 'Les « trois soleils »', html: `<p>Selon une expression locale, la vigne de Lavaux profite de trois soleils : celui du ciel, son reflet sur le lac, et la chaleur gardée par les murs de pierre.</p>` },
      { h: 'Vins', html: `<p>Le chasselas est le cépage le plus cultivé. Parmi les appellations de la région figurent le Dézaley et le Calamin. Les villages de Lutry, Cully, Epesses, Saint-Saphorin et Chexbres accueillent de nombreuses caves.</p>` },
    ],
  },
  {
    id: 'gruyere', title: 'Gruyère (fromage)', desc: 'Fromage suisse à pâte dure',
    lead: `Le <b>gruyère</b> est un fromage suisse à pâte dure, fabriqué avec du lait cru de vache. Il est originaire de la région de la Gruyère, dans le canton de Fribourg, et bénéficie d'une appellation d'origine protégée (AOP).`,
    infobox: [['Pays', 'Suisse'], ['Lait', 'Vache, cru'], ['Pâte', 'Dure'], ['Appellation', 'AOP']],
    sections: [
      { h: 'Fabrication', html: `<p>Le fromage est produit en grandes meules rondes, puis affiné pendant plusieurs mois en cave. Plus l'affinage est long, plus le goût est prononcé.</p>` },
      { h: 'Zone de production', html: `<p>La zone de l'appellation comprend les cantons de Fribourg, de Vaud, de Neuchâtel et du Jura, ainsi qu'une partie du canton de Berne.</p>` },
      { h: 'Cuisine', html: `<p>Le gruyère se mange tel quel ou fondu. Il entre notamment dans la fondue « moitié-moitié », avec le vacherin fribourgeois.</p>` },
    ],
  },
];
