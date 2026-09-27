// wiki.js — Apparence « Wikipédia » : page d'accueil du miroir, et articles de secours affichés
// quand le serveur ne peut pas joindre fr.wikipedia.org (démo hors ligne). Voir app.js, section 0.
// Textes originaux, rédigés pour le prototype. [[id|texte]] = lien vers un autre article.
// Une liste par langue (WIKI_OFFLINE.fr, .en…) : les titres sont ceux de la Wikipédia de la langue,
// la page d'accueil est le premier article. WIKI_HOME / WIKI_ARTICLES : la langue choisie (app.js).
const WIKI_OFFLINE = {};
WIKI_OFFLINE.fr = [
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

WIKI_OFFLINE.en = [
  {
    id: 'leman', title: 'Lake Geneva', desc: 'Lake in Western Europe, between Switzerland and France',
    lead: `<b>Lake Geneva</b>, also called <b>Lac Léman</b>, is a glacial lake north of the Alps, shared between Switzerland and France. With an area of about 580 km², it is one of the largest lakes in Western Europe. The Rhône flows through it, entering near Le Bouveret and leaving at Geneva.`,
    infobox: [['Countries', 'Switzerland, France'], ['Elevation', '372 m'], ['Area', '≈ 580 km²'], ['Length', '≈ 73 km'], ['Max. depth', '≈ 310 m'], ['Main inflow', 'Rhône'], ['Outflow', 'Rhône']],
    sections: [
      { h: 'Geography', html: `<p>The lake is crescent-shaped. Its northern shore belongs to the cantons of [[lausanne|Vaud]] and Geneva; its southern shore is shared between the French department of Haute-Savoie and the canton of Valais.</p><p>The wide, deep <b>Grand Lac</b> is distinguished from the <b>Petit Lac</b>, its narrower and much shallower Geneva end. The main towns on its shores are Geneva, [[lausanne|Lausanne]], Vevey, Montreux, Évian-les-Bains and Thonon-les-Bains.</p>` },
      { h: 'Winds', html: `<p>Several local winds have names. The cold, dry <b>bise</b> blows from the north-east; the <b>joran</b> drops suddenly from the Jura in the late afternoon and is feared by sailors.</p>` },
      { h: 'Navigation', html: `<p>The Lake Geneva General Navigation Company (CGN), founded in the 19th century, runs regular services between the Swiss and French shores. Its fleet includes several Belle Époque paddle steamers listed as historic monuments.</p>` },
      { h: 'Heritage', html: `<p>The shores of the lake have many sights, including [[chillon|Chillon Castle]] and the terraced vineyards of [[lavaux|Lavaux]].</p>` },
    ],
  },
  {
    id: 'lausanne', title: 'Lausanne', desc: 'City in Switzerland, capital of the canton of Vaud',
    lead: `<b>Lausanne</b> is a city in French-speaking Switzerland and the capital of the canton of Vaud. Located on the northern shore of [[leman|Lake Geneva]], it has about 140,000 inhabitants, making it one of the largest cities in the country. The International Olympic Committee has been based there since 1915, hence its nickname “Olympic capital”.`,
    infobox: [['Country', 'Switzerland'], ['Canton', 'Vaud'], ['Population', '≈ 140,000'], ['Elevation', '372 to 930 m']],
    sections: [
      { h: 'Geography', html: `<p>The city is built on hills sloping down to the lake, from the waterfront at Ouchy up to the heights of the Jorat. To climb these steep slopes, an automatic metro, the m2, opened in 2008; it is one of the steepest metros in the world.</p>` },
      { h: 'History', html: `<p>In Roman times a small town called <i>Lousonna</i> stood by the lake at Vidy. In the Middle Ages Lausanne became the seat of a bishopric; Notre-Dame Cathedral was consecrated in 1275.</p><p>In 1536 the Bernese conquered the Pays de Vaud and imposed the Reformation. Lausanne became the capital of the new canton of Vaud in 1803.</p>` },
      { h: 'Education', html: `<p>The city is home to the University of Lausanne (UNIL) and the Swiss Federal Institute of Technology in Lausanne (EPFL), both by the lake to the west of the city.</p>` },
      { h: 'Traditions', html: `<p>Every night a <b>watchman</b> calls out the hours from the cathedral bell tower, a tradition kept since the Middle Ages.</p>` },
    ],
  },
  {
    id: 'chillon', title: 'Chillon Castle', desc: 'Castle on Lake Geneva, in Veytaux (Vaud)',
    lead: `<b>Chillon Castle</b> is a fortress built on a rocky islet in [[leman|Lake Geneva]], in the municipality of Veytaux near Montreux. Long a residence of the Counts of Savoy, it is today one of the most visited historic monuments in Switzerland.`,
    infobox: [['Type', 'Castle'], ['Municipality', 'Veytaux'], ['Canton', 'Vaud'], ['Period', 'Middle Ages'], ['Owner', 'Canton of Vaud']],
    sections: [
      { h: 'History', html: `<p>Standing between the lake and the mountains, the castle controlled the road linking northern Europe to Italy. The Counts of Savoy enlarged it and made it one of their residences.</p><p>The Bernese captured it in 1536. After the Vaud revolution of 1798 it passed to the canton of Vaud, which has owned it since 1803.</p>` },
      { h: 'The Prisoner of Chillon', html: `<p>The Genevan reformer François Bonivard was held there for several years before being freed in 1536. His story inspired Lord Byron's poem <i>The Prisoner of Chillon</i> (1816), which made the castle famous throughout Europe.</p>` },
      { h: 'Visiting', html: `<p>The castle is open to the public all year round. Visitors can see the underground halls, the state rooms and the wall walks, with views over the lake and the Alps.</p>` },
    ],
  },
  {
    id: 'lavaux', title: 'Lavaux', desc: 'Wine region in the canton of Vaud',
    lead: `<b>Lavaux</b> is a wine region of the canton of Vaud stretching some thirty kilometres along the northern shore of [[leman|Lake Geneva]], between [[lausanne|Lausanne]] and [[chillon|Chillon Castle]]. Its terraced vineyards have been a UNESCO World Heritage Site since 2007.`,
    infobox: [['Country', 'Switzerland'], ['Canton', 'Vaud'], ['Main grape', 'Chasselas'], ['World Heritage', '2007']],
    sections: [
      { h: 'History', html: `<p>The terraces were laid out from the Middle Ages onwards by monks, who built the first stone walls to hold the soil on the steep slopes.</p>` },
      { h: 'The “three suns”', html: `<p>According to a local saying, the Lavaux vines enjoy three suns: the one in the sky, its reflection on the lake, and the warmth stored in the stone walls.</p>` },
      { h: 'Wines', html: `<p>Chasselas is the most widely grown grape. The region's appellations include Dézaley and Calamin. The villages of Lutry, Cully, Epesses, Saint-Saphorin and Chexbres have many wine cellars.</p>` },
    ],
  },
  {
    id: 'gruyere', title: 'Gruyère cheese', desc: 'Swiss hard cheese',
    lead: `<b>Gruyère</b> is a Swiss hard cheese made from raw cow's milk. It comes from the Gruyère region in the canton of Fribourg and has a protected designation of origin (AOP).`,
    infobox: [['Country', 'Switzerland'], ['Milk', 'Cow, raw'], ['Texture', 'Hard'], ['Designation', 'AOP']],
    sections: [
      { h: 'Production', html: `<p>The cheese is made in large round wheels, then matured for several months in cellars. The longer it matures, the stronger the taste.</p>` },
      { h: 'Production area', html: `<p>The designation area covers the cantons of Fribourg, Vaud, Neuchâtel and Jura, as well as part of the canton of Bern.</p>` },
      { h: 'Cooking', html: `<p>Gruyère is eaten as it is or melted. It is used in “moitié-moitié” fondue, together with Vacherin Fribourgeois.</p>` },
    ],
  },
];

WIKI_OFFLINE.es = [
  {
    id: 'leman', title: 'Lago Lemán', desc: 'Lago de Europa occidental, entre Suiza y Francia',
    lead: `El <b>lago Lemán</b>, también llamado <b>lago de Ginebra</b>, es un lago de origen glaciar situado al norte de los Alpes y compartido entre Suiza y Francia. Con unos 580 km², es uno de los mayores lagos de Europa occidental. Lo atraviesa el Ródano, que entra cerca de Le Bouveret y sale en Ginebra.`,
    infobox: [['Países', 'Suiza, Francia'], ['Altitud', '372 m'], ['Superficie', '≈ 580 km²'], ['Longitud', '≈ 73 km'], ['Profundidad máx.', '≈ 310 m'], ['Afluente principal', 'Ródano'], ['Emisario', 'Ródano']],
    sections: [
      { h: 'Geografía', html: `<p>El lago tiene forma de media luna. Su orilla norte pertenece a los cantones de [[lausanne|Vaud]] y Ginebra; la orilla sur se reparte entre el departamento francés de Alta Saboya y el cantón del Valais.</p><p>Se distingue el <b>Gran Lago</b>, ancho y profundo, del <b>Pequeño Lago</b>, su parte ginebrina, más estrecha y mucho menos profunda. Las principales ciudades ribereñas son Ginebra, [[lausanne|Lausana]], Vevey, Montreux, Évian-les-Bains y Thonon-les-Bains.</p>` },
      { h: 'Vientos', html: `<p>Varios vientos locales tienen nombre propio. La <b>bise</b>, fría y seca, sopla del noreste; el <b>joran</b> baja de golpe del Jura al final del día y es temido por los navegantes.</p>` },
      { h: 'Navegación', html: `<p>La Compañía General de Navegación del lago Lemán (CGN), fundada en el siglo XIX, ofrece líneas regulares entre las orillas suiza y francesa. Su flota incluye varios barcos de ruedas de la Belle Époque declarados monumentos históricos.</p>` },
      { h: 'Patrimonio', html: `<p>Las orillas del lago tienen muchos lugares de interés, como el [[chillon|castillo de Chillon]] y los viñedos en terrazas de [[lavaux|Lavaux]].</p>` },
    ],
  },
  {
    id: 'lausanne', title: 'Lausana', desc: 'Ciudad de Suiza, capital del cantón de Vaud',
    lead: `<b>Lausana</b> es una ciudad de la Suiza francófona, capital del cantón de Vaud. Situada en la orilla norte del [[leman|lago Lemán]], tiene unos 140 000 habitantes, lo que la convierte en una de las mayores ciudades del país. El Comité Olímpico Internacional tiene allí su sede desde 1915, de ahí su apodo de «capital olímpica».`,
    infobox: [['País', 'Suiza'], ['Cantón', 'Vaud'], ['Población', '≈ 140 000 hab.'], ['Altitud', '372 a 930 m']],
    sections: [
      { h: 'Geografía', html: `<p>La ciudad está construida sobre colinas que bajan hacia el lago, desde la orilla en Ouchy hasta las alturas del Jorat. Para salvar estas pendientes se inauguró en 2008 un metro automático, el m2, uno de los más empinados del mundo.</p>` },
      { h: 'Historia', html: `<p>En época romana, una pequeña ciudad llamada <i>Lousonna</i> se encontraba a orillas del lago, en Vidy. En la Edad Media, Lausana pasó a ser sede de un obispado; la catedral de Notre-Dame fue consagrada en 1275.</p><p>En 1536 los berneses conquistaron el País de Vaud e impusieron la Reforma. Lausana se convirtió en capital del nuevo cantón de Vaud en 1803.</p>` },
      { h: 'Enseñanza', html: `<p>La ciudad acoge la Universidad de Lausana (UNIL) y la Escuela Politécnica Federal de Lausana (EPFL), ambas junto al lago, al oeste de la ciudad.</p>` },
      { h: 'Tradiciones', html: `<p>Cada noche, un <b>vigía</b> anuncia las horas desde el campanario de la catedral, una tradición que se mantiene desde la Edad Media.</p>` },
    ],
  },
  {
    id: 'chillon', title: 'Castillo de Chillon', desc: 'Castillo en el lago Lemán, en Veytaux (Vaud)',
    lead: `El <b>castillo de Chillon</b> es una fortaleza construida sobre un islote rocoso del [[leman|lago Lemán]], en el municipio de Veytaux, cerca de Montreux. Residencia durante mucho tiempo de los condes de Saboya, hoy es uno de los monumentos más visitados de Suiza.`,
    infobox: [['Tipo', 'Castillo'], ['Municipio', 'Veytaux'], ['Cantón', 'Vaud'], ['Época', 'Edad Media'], ['Propietario', 'Cantón de Vaud']],
    sections: [
      { h: 'Historia', html: `<p>Situado entre el lago y la montaña, el castillo controlaba la ruta que unía el norte de Europa con Italia. Los condes de Saboya lo ampliaron y lo convirtieron en una de sus residencias.</p><p>Los berneses lo tomaron en 1536. Tras la revolución valdense de 1798 pasó al cantón de Vaud, su propietario desde 1803.</p>` },
      { h: 'El prisionero de Chillon', html: `<p>El reformador ginebrino François Bonivard estuvo encerrado allí varios años antes de ser liberado en 1536. Su historia inspiró a Lord Byron el poema <i>El prisionero de Chillon</i> (1816), que dio fama al castillo en toda Europa.</p>` },
      { h: 'Visita', html: `<p>El castillo está abierto todo el año. Se visitan los subterráneos, las salas de gala y los caminos de ronda, con vistas al lago y a los Alpes.</p>` },
    ],
  },
  {
    id: 'lavaux', title: 'Lavaux', desc: 'Región vinícola del cantón de Vaud',
    lead: `<b>Lavaux</b> es una región vinícola del cantón de Vaud que se extiende unos treinta kilómetros por la orilla norte del [[leman|lago Lemán]], entre [[lausanne|Lausana]] y el [[chillon|castillo de Chillon]]. Sus viñedos en terrazas son Patrimonio de la Humanidad de la UNESCO desde 2007.`,
    infobox: [['País', 'Suiza'], ['Cantón', 'Vaud'], ['Uva principal', 'Chasselas'], ['Patrimonio mundial', '2007']],
    sections: [
      { h: 'Historia', html: `<p>Las terrazas fueron construidas a partir de la Edad Media por monjes, que levantaron los primeros muros de piedra para sujetar la tierra en las fuertes pendientes.</p>` },
      { h: 'Los «tres soles»', html: `<p>Según un dicho local, la viña de Lavaux disfruta de tres soles: el del cielo, su reflejo en el lago y el calor que guardan los muros de piedra.</p>` },
      { h: 'Vinos', html: `<p>La chasselas es la uva más cultivada. Entre las denominaciones de la región figuran el Dézaley y el Calamin. Los pueblos de Lutry, Cully, Epesses, Saint-Saphorin y Chexbres tienen numerosas bodegas.</p>` },
    ],
  },
  {
    id: 'gruyere', title: 'Gruyère (queso)', desc: 'Queso suizo de pasta dura',
    lead: `El <b>gruyère</b> es un queso suizo de pasta dura elaborado con leche cruda de vaca. Procede de la región de Gruyère, en el cantón de Friburgo, y tiene denominación de origen protegida (AOP).`,
    infobox: [['País', 'Suiza'], ['Leche', 'Vaca, cruda'], ['Pasta', 'Dura'], ['Denominación', 'AOP']],
    sections: [
      { h: 'Elaboración', html: `<p>El queso se elabora en grandes ruedas y luego se cura varios meses en bodega. Cuanto más largo es el curado, más intenso es el sabor.</p>` },
      { h: 'Zona de producción', html: `<p>La zona de la denominación abarca los cantones de Friburgo, Vaud, Neuchâtel y Jura, además de parte del cantón de Berna.</p>` },
      { h: 'Cocina', html: `<p>El gruyère se come tal cual o fundido. Forma parte de la fondue «mitad y mitad», junto con el vacherin friburgués.</p>` },
    ],
  },
];

WIKI_OFFLINE.pt = [
  {
    id: 'leman', title: 'Lago Léman', desc: 'Lago da Europa Ocidental, entre a Suíça e a França',
    lead: `O <b>lago Léman</b>, também chamado <b>lago de Genebra</b>, é um lago de origem glaciar a norte dos Alpes, partilhado entre a Suíça e a França. Com cerca de 580 km², é um dos maiores lagos da Europa Ocidental. É atravessado pelo Ródano, que entra perto de Le Bouveret e sai em Genebra.`,
    infobox: [['Países', 'Suíça, França'], ['Altitude', '372 m'], ['Área', '≈ 580 km²'], ['Comprimento', '≈ 73 km'], ['Profundidade máx.', '≈ 310 m'], ['Afluente principal', 'Ródano'], ['Emissário', 'Ródano']],
    sections: [
      { h: 'Geografia', html: `<p>O lago tem a forma de um crescente. A margem norte pertence aos cantões de [[lausanne|Vaud]] e de Genebra; a margem sul é partilhada entre o departamento francês da Alta Saboia e o cantão do Valais.</p><p>Distingue-se o <b>Grande Lago</b>, largo e profundo, do <b>Pequeno Lago</b>, a parte genebrina, mais estreita e muito menos profunda. As principais cidades ribeirinhas são Genebra, [[lausanne|Lausana]], Vevey, Montreux, Évian-les-Bains e Thonon-les-Bains.</p>` },
      { h: 'Ventos', html: `<p>Vários ventos locais têm nome. A <b>bise</b>, fria e seca, sopra de nordeste; o <b>joran</b> desce bruscamente do Jura ao fim do dia e é temido pelos navegadores.</p>` },
      { h: 'Navegação', html: `<p>A Companhia Geral de Navegação do Lago Léman (CGN), fundada no século XIX, explora linhas regulares entre as margens suíça e francesa. A frota inclui vários barcos a vapor de rodas da Belle Époque, classificados como monumentos históricos.</p>` },
      { h: 'Património', html: `<p>As margens do lago têm muitos locais turísticos, entre eles o [[chillon|Castelo de Chillon]] e as vinhas em socalcos de [[lavaux|Lavaux]].</p>` },
    ],
  },
  {
    id: 'lausanne', title: 'Lausana', desc: 'Cidade da Suíça, capital do cantão de Vaud',
    lead: `<b>Lausana</b> é uma cidade da Suíça francófona, capital do cantão de Vaud. Situada na margem norte do [[leman|lago Léman]], tem cerca de 140 000 habitantes, o que faz dela uma das maiores cidades do país. O Comité Olímpico Internacional tem lá a sua sede desde 1915, daí a alcunha de «capital olímpica».`,
    infobox: [['País', 'Suíça'], ['Cantão', 'Vaud'], ['População', '≈ 140 000 hab.'], ['Altitude', '372 a 930 m']],
    sections: [
      { h: 'Geografia', html: `<p>A cidade está construída sobre colinas que descem até ao lago, desde a margem em Ouchy até às alturas do Jorat. Para vencer estas encostas, um metro automático, o m2, entrou ao serviço em 2008; é um dos metros mais inclinados do mundo.</p>` },
      { h: 'História', html: `<p>Na época romana, uma pequena cidade chamada <i>Lousonna</i> ficava à beira do lago, em Vidy. Na Idade Média, Lausana tornou-se sede de um bispado; a catedral de Notre-Dame foi consagrada em 1275.</p><p>Em 1536, os berneses conquistaram o País de Vaud e impuseram a Reforma. Lausana tornou-se capital do novo cantão de Vaud em 1803.</p>` },
      { h: 'Ensino', html: `<p>A cidade acolhe a Universidade de Lausana (UNIL) e a Escola Politécnica Federal de Lausana (EPFL), ambas à beira do lago, a oeste da cidade.</p>` },
      { h: 'Tradições', html: `<p>Todas as noites, um <b>vigia</b> anuncia as horas do alto do campanário da catedral, uma tradição mantida desde a Idade Média.</p>` },
    ],
  },
  {
    id: 'chillon', title: 'Castelo de Chillon', desc: 'Castelo no lago Léman, em Veytaux (Vaud)',
    lead: `O <b>Castelo de Chillon</b> é uma fortaleza construída num ilhéu rochoso do [[leman|lago Léman]], no município de Veytaux, perto de Montreux. Durante muito tempo residência dos condes de Saboia, é hoje um dos monumentos históricos mais visitados da Suíça.`,
    infobox: [['Tipo', 'Castelo'], ['Município', 'Veytaux'], ['Cantão', 'Vaud'], ['Época', 'Idade Média'], ['Proprietário', 'Cantão de Vaud']],
    sections: [
      { h: 'História', html: `<p>Situado entre o lago e a montanha, o castelo controlava a estrada que ligava o norte da Europa à Itália. Os condes de Saboia ampliaram-no e fizeram dele uma das suas residências.</p><p>Os berneses tomaram-no em 1536. Depois da revolução vaudense de 1798, passou para o cantão de Vaud, seu proprietário desde 1803.</p>` },
      { h: 'O prisioneiro de Chillon', html: `<p>O reformador genebrino François Bonivard esteve lá preso vários anos antes de ser libertado em 1536. A sua história inspirou a Lord Byron o poema <i>O Prisioneiro de Chillon</i> (1816), que tornou o castelo célebre em toda a Europa.</p>` },
      { h: 'Visita', html: `<p>O castelo está aberto ao público todo o ano. Visitam-se os subterrâneos, as salas nobres e os caminhos de ronda, com vista sobre o lago e os Alpes.</p>` },
    ],
  },
  {
    id: 'lavaux', title: 'Lavaux', desc: 'Região vinícola do cantão de Vaud',
    lead: `<b>Lavaux</b> é uma região vinícola do cantão de Vaud que se estende por cerca de trinta quilómetros ao longo da margem norte do [[leman|lago Léman]], entre [[lausanne|Lausana]] e o [[chillon|Castelo de Chillon]]. As suas vinhas em socalcos são Património Mundial da UNESCO desde 2007.`,
    infobox: [['País', 'Suíça'], ['Cantão', 'Vaud'], ['Casta principal', 'Chasselas'], ['Património Mundial', '2007']],
    sections: [
      { h: 'História', html: `<p>Os socalcos foram construídos a partir da Idade Média por monges, que ergueram os primeiros muros de pedra para segurar a terra nas encostas íngremes.</p>` },
      { h: 'Os «três sóis»', html: `<p>Segundo um ditado local, a vinha de Lavaux aproveita três sóis: o do céu, o seu reflexo no lago e o calor guardado pelos muros de pedra.</p>` },
      { h: 'Vinhos', html: `<p>A chasselas é a casta mais cultivada. Entre as denominações da região contam-se o Dézaley e o Calamin. As aldeias de Lutry, Cully, Epesses, Saint-Saphorin e Chexbres têm muitas adegas.</p>` },
    ],
  },
  {
    id: 'gruyere', title: 'Gruyère (queijo)', desc: 'Queijo suíço de pasta dura',
    lead: `O <b>gruyère</b> é um queijo suíço de pasta dura feito com leite cru de vaca. É originário da região de Gruyère, no cantão de Friburgo, e tem denominação de origem protegida (AOP).`,
    infobox: [['País', 'Suíça'], ['Leite', 'Vaca, cru'], ['Pasta', 'Dura'], ['Denominação', 'AOP']],
    sections: [
      { h: 'Fabrico', html: `<p>O queijo é produzido em grandes rodas e depois curado durante vários meses em cave. Quanto mais longa a cura, mais intenso o sabor.</p>` },
      { h: 'Zona de produção', html: `<p>A zona da denominação abrange os cantões de Friburgo, Vaud, Neuchâtel e Jura, bem como parte do cantão de Berna.</p>` },
      { h: 'Cozinha', html: `<p>O gruyère come-se simples ou derretido. Faz parte da fondue «meio-meio», com o vacherin de Friburgo.</p>` },
    ],
  },
];

WIKI_OFFLINE.sq = [
  {
    id: 'leman', title: 'Liqeni i Gjenevës', desc: 'Liqen në Evropën Perëndimore, mes Zvicrës dhe Francës',
    lead: `<b>Liqeni i Gjenevës</b>, i quajtur edhe <b>Liqeni Léman</b>, është një liqen me origjinë akullnajore në veri të Alpeve, i ndarë mes Zvicrës dhe Francës. Me një sipërfaqe prej rreth 580 km², është një nga liqenet më të mëdhenj të Evropës Perëndimore. Nëpër të kalon lumi Rona, që hyn pranë Le Bouveret dhe del në Gjenevë.`,
    infobox: [['Shtetet', 'Zvicër, Francë'], ['Lartësia', '372 m'], ['Sipërfaqja', '≈ 580 km²'], ['Gjatësia', '≈ 73 km'], ['Thellësia maks.', '≈ 310 m'], ['Degëzimi kryesor', 'Rona'], ['Dalja', 'Rona']],
    sections: [
      { h: 'Gjeografia', html: `<p>Liqeni ka formën e një gjysmëhëne. Bregu verior u përket kantoneve [[lausanne|Vaud]] dhe Gjenevë; bregu jugor ndahet mes departamentit francez Savoja e Epërme dhe kantonit Valais.</p><p>Dallohet <b>Liqeni i Madh</b>, i gjerë dhe i thellë, nga <b>Liqeni i Vogël</b>, pjesa e Gjenevës, më e ngushtë dhe shumë më e cekët. Qytetet kryesore në breg janë Gjeneva, [[lausanne|Lozana]], Vevey, Montreux, Évian-les-Bains dhe Thonon-les-Bains.</p>` },
      { h: 'Erërat', html: `<p>Disa erëra vendore kanë emër. <b>Bise</b>, e ftohtë dhe e thatë, fryn nga verilindja; <b>joran</b> zbret papritur nga Jura në fund të ditës dhe është e frikshme për lundruesit.</p>` },
      { h: 'Lundrimi', html: `<p>Kompania e Përgjithshme e Lundrimit në Liqenin Léman (CGN), e themeluar në shekullin XIX, ka linja të rregullta mes bregut zviceran dhe atij francez. Flota e saj përfshin disa anije me rrota të Belle Époque, të shpallura monumente historike.</p>` },
      { h: 'Trashëgimia', html: `<p>Brigjet e liqenit kanë shumë vende turistike, ndër to [[chillon|Kështjella e Chillonit]] dhe vreshtat me tarraca të [[lavaux|Lavaux]].</p>` },
    ],
  },
  {
    id: 'lausanne', title: 'Lozana', desc: 'Qytet në Zvicër, kryeqendra e kantonit Vaud',
    lead: `<b>Lozana</b> është një qytet në Zvicrën frëngjishtfolëse, kryeqendra e kantonit Vaud. E vendosur në bregun verior të [[leman|Liqenit të Gjenevës]], ka rreth 140 000 banorë, gjë që e bën një nga qytetet më të mëdha të vendit. Komiteti Olimpik Ndërkombëtar ka selinë këtu që nga viti 1915, prandaj quhet «kryeqyteti olimpik».`,
    infobox: [['Shteti', 'Zvicër'], ['Kantoni', 'Vaud'], ['Popullsia', '≈ 140 000 banorë'], ['Lartësia', '372 deri 930 m']],
    sections: [
      { h: 'Gjeografia', html: `<p>Qyteti është ndërtuar mbi kodra që zbresin drejt liqenit, nga bregu në Ouchy deri në lartësitë e Jorat. Për këto të përpjeta, në vitin 2008 u hap një metro automatike, m2, një nga metrotë më të pjerrëta në botë.</p>` },
      { h: 'Historia', html: `<p>Në kohën romake, një qytet i vogël i quajtur <i>Lousonna</i> ndodhej buzë liqenit, në Vidy. Në Mesjetë, Lozana u bë seli e një peshkopate; katedralja Notre-Dame u shenjtërua në vitin 1275.</p><p>Në vitin 1536, bernezët pushtuan Vendin e Vaud dhe vendosën Reformën. Lozana u bë kryeqendra e kantonit të ri Vaud në vitin 1803.</p>` },
      { h: 'Arsimi', html: `<p>Qyteti strehon Universitetin e Lozanës (UNIL) dhe Shkollën Politeknike Federale të Lozanës (EPFL), të dyja buzë liqenit, në perëndim të qytetit.</p>` },
      { h: 'Traditat', html: `<p>Çdo natë, një <b>roje</b> shpall orët nga kambanorja e katedrales, një traditë që ruhet që nga Mesjeta.</p>` },
    ],
  },
  {
    id: 'chillon', title: 'Kështjella e Chillonit', desc: 'Kështjellë në Liqenin e Gjenevës, në Veytaux (Vaud)',
    lead: `<b>Kështjella e Chillonit</b> është një kështjellë e ndërtuar mbi një ishull shkëmbor të [[leman|Liqenit të Gjenevës]], në komunën Veytaux, pranë Montreux. Për një kohë të gjatë rezidencë e kontëve të Savojës, sot është një nga monumentet historike më të vizituara të Zvicrës.`,
    infobox: [['Lloji', 'Kështjellë'], ['Komuna', 'Veytaux'], ['Kantoni', 'Vaud'], ['Periudha', 'Mesjeta'], ['Pronari', 'Kantoni Vaud']],
    sections: [
      { h: 'Historia', html: `<p>E vendosur mes liqenit dhe malit, kështjella kontrollonte rrugën që lidhte veriun e Evropës me Italinë. Kontët e Savojës e zgjeruan dhe e bënë një nga rezidencat e tyre.</p><p>Bernezët e pushtuan në vitin 1536. Pas revolucionit të Vaud të vitit 1798, kaloi te kantoni Vaud, që e zotëron që nga viti 1803.</p>` },
      { h: 'I burgosuri i Chillonit', html: `<p>Reformatori gjenevas François Bonivard u mbajt këtu disa vjet, derisa u lirua në vitin 1536. Historia e tij frymëzoi poetin anglez Lord Byron për poemën <i>I burgosuri i Chillonit</i> (1816), që e bëri kështjellën të famshme në gjithë Evropën.</p>` },
      { h: 'Vizita', html: `<p>Kështjella është e hapur gjatë gjithë vitit. Vizitohen nëntokat, sallat e pritjes dhe shtigjet e rojeve, me pamje nga liqeni dhe Alpet.</p>` },
    ],
  },
  {
    id: 'lavaux', title: 'Lavaux', desc: 'Rajon vreshtash në kantonin Vaud',
    lead: `<b>Lavaux</b> është një rajon vreshtash në kantonin Vaud që shtrihet rreth tridhjetë kilometra përgjatë bregut verior të [[leman|Liqenit të Gjenevës]], mes [[lausanne|Lozanës]] dhe [[chillon|Kështjellës së Chillonit]]. Vreshtat e tij me tarraca janë trashëgimi botërore e UNESCO-s që nga viti 2007.`,
    infobox: [['Shteti', 'Zvicër'], ['Kantoni', 'Vaud'], ['Rrushi kryesor', 'Chasselas'], ['Trashëgimi botërore', '2007']],
    sections: [
      { h: 'Historia', html: `<p>Tarracat u ndërtuan që nga Mesjeta nga murgjit, që ngritën muret e para prej guri për të mbajtur dheun në shpatet e pjerrëta.</p>` },
      { h: '«Tre diejt»', html: `<p>Sipas një thënieje vendore, vreshti i Lavaux gëzon tre diej: atë të qiellit, pasqyrimin e tij në liqen dhe ngrohtësinë që ruajnë muret prej guri.</p>` },
      { h: 'Verërat', html: `<p>Chasselas është rrushi më i kultivuar. Ndër emërtimet e rajonit janë Dézaley dhe Calamin. Fshatrat Lutry, Cully, Epesses, Saint-Saphorin dhe Chexbres kanë shumë kantina.</p>` },
    ],
  },
  {
    id: 'gruyere', title: 'Gruyère (djathë)', desc: 'Djathë zviceran i fortë',
    lead: `<b>Gruyère</b> është një djathë zviceran i fortë, i bërë me qumësht lope të papërpunuar. E ka origjinën në rajonin Gruyère, në kantonin Fribourg, dhe ka emërtim origjine të mbrojtur (AOP).`,
    infobox: [['Shteti', 'Zvicër'], ['Qumështi', 'Lope, i papërpunuar'], ['Brumi', 'I fortë'], ['Emërtimi', 'AOP']],
    sections: [
      { h: 'Prodhimi', html: `<p>Djathi prodhohet në rrota të mëdha, pastaj piqet për disa muaj në bodrum. Sa më gjatë piqet, aq më e fortë është shija.</p>` },
      { h: 'Zona e prodhimit', html: `<p>Zona e emërtimit përfshin kantonet Fribourg, Vaud, Neuchâtel dhe Jura, si dhe një pjesë të kantonit Bern.</p>` },
      { h: 'Gatimi', html: `<p>Gruyère hahet ashtu siç është ose i shkrirë. Përdoret në fondue «gjysmë-gjysmë», bashkë me vacherin të Fribourgut.</p>` },
    ],
  },
];

WIKI_OFFLINE.gsw = [
  {
    id: 'leman', title: 'Genfersee', desc: 'See z Weschteuropa, zwüsche de Schwiiz und Frankriich',
    lead: `De <b>Genfersee</b>, französisch <b>Lac Léman</b>, isch en Gletschersee nördlich vo de Alpe, wo sich d Schwiiz und Frankriich teiled. Mit öppe 580 km² isch er eine vo de gröschte Seee z Weschteuropa. De Rotte fliesst dur en dure: er chunnt bi Le Bouveret ine und gaht z Genf wieder use.`,
    infobox: [['Länder', 'Schwiiz, Frankriich'], ['Höchi', '372 m'], ['Flächi', '≈ 580 km²'], ['Längi', '≈ 73 km'], ['Gröschti Tüüfi', '≈ 310 m'], ['Houptzuefluss', 'Rotte'], ['Abfluss', 'Rotte']],
    sections: [
      { h: 'Geografie', html: `<p>De See hät d Form vo nere Mondsichle. S Nordufer ghört zu de Kantön [[lausanne|Waadt]] und Genf; s Südufer teiled sich s französische Departemänt Haute-Savoie und de Kanton Wallis.</p><p>Mer underscheidet de breit und tüüf <b>Grand Lac</b> vom <b>Petit Lac</b>, em Genfer Teil, wo schmäler und vill weniger tüüf isch. Di wichtigschte Städt am Ufer sind Genf, [[lausanne|Lausanne]], Vevey, Montreux, Évian-les-Bains und Thonon-les-Bains.</p>` },
      { h: 'Wind', html: `<p>Es paar lokali Wind händ en eigete Name. D <b>Bise</b>, chalt und troche, chunnt vo Nordoschte; de <b>Joran</b> chunnt am Aabig plötzlich vom Jura abe und isch bi de Segler gförchtet.</p>` },
      { h: 'Schiffahrt', html: `<p>D Compagnie générale de navigation (CGN), im 19. Jahrhundert gründet, fahrt regelmässig zwüsche em Schwiizer und em französische Ufer. Zur Flotte ghöred es paar Raddampfer us de Belle Époque, wo under Dänkmalschutz stönd.</p>` },
      { h: 'Kulturerb', html: `<p>Am Ufer vom See git s vill Sehenswürdigkeite, zum Biispiel s [[chillon|Schloss Chillon]] und d Rebterrasse vo [[lavaux|Lavaux]].</p>` },
    ],
  },
  {
    id: 'lausanne', title: 'Lausanne', desc: 'Stadt i de Schwiiz, Houptort vom Kanton Waadt',
    lead: `<b>Lausanne</b> isch e Stadt i de Weschtschwiiz und de Houptort vom Kanton Waadt. Si liit am Nordufer vom [[leman|Genfersee]] und hät öppe 140 000 Iiwohner, eini vo de gröschte Städt vom Land. S Internationale Olympische Komitee hät sit 1915 sin Sitz det, drum säit mer ere au «Olympischi Houptstadt».`,
    infobox: [['Land', 'Schwiiz'], ['Kanton', 'Waadt'], ['Iiwohner', '≈ 140 000'], ['Höchi', '372 bis 930 m']],
    sections: [
      { h: 'Geografie', html: `<p>D Stadt isch uf Hügel baut, wo zum See abe gönd, vom Ufer z Ouchy bis ufe zum Jorat. Für die stotzige Hang isch 2008 e automatischi Metro, d m2, in Betrieb gange; si isch eini vo de stotzigschte Metros vo de Wält.</p>` },
      { h: 'Gschicht', html: `<p>Zur Römerziit isch z Vidy am See es Städtli gstande, wo <i>Lousonna</i> gheisse hät. Im Mittelalter isch Lausanne Bischofssitz worde; d Kathedrale Notre-Dame isch 1275 gweiht worde.</p><p>1536 händ d Bärner d Waadt eroberet und d Reformation iigfüert. 1803 isch Lausanne Houptort vom nöie Kanton Waadt worde.</p>` },
      { h: 'Bildig', html: `<p>I de Stadt sind d Universität Lausanne (UNIL) und d ETH Lausanne (EPFL), beidi am See, im Weschte vo de Stadt.</p>` },
      { h: 'Brüüch', html: `<p>Jedi Nacht rüeft en <b>Wächter</b> vom Kathedraleturm d Stunde uus, e Tradition, wo sit em Mittelalter pflegt wird.</p>` },
    ],
  },
  {
    id: 'chillon', title: 'Schloss Chillon', desc: 'Wasserschloss am Genfersee, z Veytaux (Waadt)',
    lead: `S <b>Schloss Chillon</b> isch e Burg uf ere Felsinsle im [[leman|Genfersee]], i de Gmeind Veytaux bi Montreux. Lang isch es e Residänz vo de Grafe vo Savoye gsi; hüt isch es eis vo de meischtbsuechte historische Dänkmäler vo de Schwiiz.`,
    infobox: [['Typ', 'Burg'], ['Gmeind', 'Veytaux'], ['Kanton', 'Waadt'], ['Epoche', 'Mittelalter'], ['Bsitzer', 'Kanton Waadt']],
    sections: [
      { h: 'Gschicht', html: `<p>Zwüsche See und Bärg hät s Schloss d Strass vo Nordeuropa uf Italie kontrolliert. D Grafe vo Savoye händ s uusbaut und zu eine vo ihrne Residänze gmacht.</p><p>1536 händ s d Bärner iignoh. Nach de Waadtländer Revolution vo 1798 isch es a de Kanton Waadt gange, wo s sit 1803 ghört.</p>` },
      { h: 'De Gfangeni vo Chillon', html: `<p>De Genfer Reformator François Bonivard isch det es paar Jahr iigsperrt gsi, bis er 1536 befreit worde isch. Sini Gschicht hät de englisch Dichter Lord Byron zum Gedicht <i>The Prisoner of Chillon</i> (1816) inspiriert, wo s Schloss i ganz Europa bekannt gmacht hät.</p>` },
      { h: 'Bsuech', html: `<p>S Schloss isch s ganz Jahr offe. Mer cha d Chäller, d Prunksääl und d Wehrgäng aaluege, mit Uussicht uf de See und d Alpe.</p>` },
    ],
  },
  {
    id: 'lavaux', title: 'Lavaux', desc: 'Wiibaugebiet im Kanton Waadt',
    lead: `<b>Lavaux</b> isch es Wiibaugebiet im Kanton Waadt, wo sich öppe drüssg Kilometer em Nordufer vom [[leman|Genfersee]] naa zieht, zwüsche [[lausanne|Lausanne]] und em [[chillon|Schloss Chillon]]. Sini Rebterrasse sind sit 2007 UNESCO-Wälterb.`,
    infobox: [['Land', 'Schwiiz'], ['Kanton', 'Waadt'], ['Houptsorte', 'Chasselas (Gutedel)'], ['Wälterb', '2007']],
    sections: [
      { h: 'Gschicht', html: `<p>D Terrasse händ Mönch ab em Mittelalter aaglegt; si händ di erschte Steimuure baut, zum d Ärde a de stotzige Hang z halte.</p>` },
      { h: 'D «drei Sunne»', html: `<p>Wie mer det säit, bechömed d Rebe vo Lavaux drei Sunne: die am Himmel, ires Spiegelbild im See und d Wärmi, wo d Steimuure spiichered.</p>` },
      { h: 'Wii', html: `<p>De Chasselas isch di meischt aabauti Sorte. Zu de Appellatione vo de Gägend ghöred de Dézaley und de Calamin. D Dörfer Lutry, Cully, Epesses, Saint-Saphorin und Chexbres händ vill Wiichäller.</p>` },
    ],
  },
  {
    id: 'gruyere', title: 'Greyerzer', desc: 'Schwiizer Hartchäs',
    lead: `De <b>Greyerzer</b> (Gruyère) isch en Schwiizer Hartchäs us rohere Chuemilch. Er chunnt us em Greyerzerland im Kanton Friburg und hät e gschützti Urschprungsbezeichnig (AOP).`,
    infobox: [['Land', 'Schwiiz'], ['Milch', 'Chue, roh'], ['Teig', 'Hart'], ['Bezeichnig', 'AOP']],
    sections: [
      { h: 'Herstellig', html: `<p>De Chäs wird i grosse runde Laibe gmacht und dänn es paar Mönet im Chäller greift. Je länger er reift, desto chräftiger isch de Gschmack.</p>` },
      { h: 'Produktionsgebiet', html: `<p>S Gebiet vo de Bezeichnig umfasst d Kantön Friburg, Waadt, Neueburg und Jura und en Teil vom Kanton Bärn.</p>` },
      { h: 'Chuchi', html: `<p>Greyerzer isst mer eifach so oder gschmolze. Er ghört i s Moitié-moitié-Fondue, zäme mit em Vacherin fribourgeois.</p>` },
    ],
  },
];

// Langue choisie (mise à jour par applyLang dans app.js)
let WIKI_HOME = WIKI_OFFLINE.fr[0].title;
let WIKI_ARTICLES = WIKI_OFFLINE.fr;
