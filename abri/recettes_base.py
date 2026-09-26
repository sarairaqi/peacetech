"""
recettes_base.py — Outils communs aux fichiers de recettes
(recettes_suisses.py, recettes_monde.py).

Format d'une recette : celui de content.RECIPES, plus « region » (canton, région ou
pays d'origine, affiché sur la fiche). Unités : g et dl comme sur les emballages
suisses ; « c. à soupe » / « c. à café » ; unit "" = pièces. Les quantités sont
pour `base` personnes (ou parts).
"""

# Dégradés des vignettes, par famille de plats
FROMAGE = ["#ffe29a", "#f5a623"]
POMME_DE_TERRE = ["#f6c667", "#e07a2f"]
VIANDE = ["#f8b195", "#c06c84"]
LEGUMES = ["#a8e063", "#56ab2f"]
SUCRE = ["#ffd3a5", "#fd6585"]
PAIN = ["#fbd786", "#c98b3a"]
POISSON = ["#a1c4fd", "#5b8def"]
CHOCOLAT = ["#d9a87c", "#6b3e26"]
TOMATE = ["#ff9a8b", "#e8505b"]


def recette(id, name, emoji, category, region, time, difficulty, base, gradient, ingredients, steps):
    return {
        "id": id, "name": name, "emoji": emoji, "category": category, "region": region,
        "time": time, "difficulty": difficulty, "base_servings": base, "gradient": gradient,
        "ingredients": [{"name": n, "qty": q, "unit": u} for n, q, u in ingredients],
        "steps": steps,
    }
