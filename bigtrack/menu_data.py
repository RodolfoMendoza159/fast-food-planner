"""
menu_data.py (robust)
- Loads menu.csv and normalizes columns.
- MenuItem has extended nutrition fields.
- load_menu() is robust: it filters kwargs by actual dataclass fields to avoid TypeError.
"""
from dataclasses import dataclass, fields
from pathlib import Path
from typing import Dict, List, Optional
import csv
import re

MENU_CSV = Path("menu.csv")  # flexible columns (case-insensitive)

# -----------------------------
# Helpers
# -----------------------------
def _pick(colmap: Dict[str, str], candidates: List[str]) -> Optional[str]:
    """Pick first existing logical column (case-insensitive)."""
    for c in candidates:
        k = (c or "").strip().lower()
        if k in colmap:
            return colmap[k]
    return None

def _parse_float(v: str) -> Optional[float]:
    if v is None:
        return None
    s = str(v).strip()
    if not s:
        return None
    # remove units and commas
    s = re.sub(r"[^\d\.\-]", "", s)
    try:
        return float(s)
    except Exception:
        return None

def _split_size_from_name(txt: str) -> tuple[str, Optional[str]]:
    """If the item name contains 'Name (Size)', separate it."""
    m = re.search(r"^(.*)\(([^()]*)\)\s*$", txt)
    if m:
        name = m.group(1).strip()
        size = m.group(2).strip()
        return (name or txt, size or None)
    return (txt, None)

# -----------------------------
# Dataclass
# -----------------------------
@dataclass
class MenuItem:
    restaurant: str
    category: str
    item: str
    size: Optional[str]
    calories: Optional[float]
    protein: Optional[float]
    carbs: Optional[float]
    fat: Optional[float]
    # Extended fields (all optional)
    fiber: Optional[float] = None
    sugar: Optional[float] = None
    sat_fat: Optional[float] = None
    poly_fat: Optional[float] = None
    mono_fat: Optional[float] = None
    trans_fat: Optional[float] = None
    cholesterol: Optional[float] = None
    sodium: Optional[float] = None
    potassium: Optional[float] = None
    vitamin_a: Optional[float] = None
    vitamin_c: Optional[float] = None
    calcium: Optional[float] = None
    iron: Optional[float] = None

# -----------------------------
# Loading / Indexing
# -----------------------------
def load_menu(csv_path: Path = MENU_CSV) -> List[MenuItem]:
    if not csv_path.exists():
        return []

    with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
        rd = csv.DictReader(f)
        fn = rd.fieldnames or []
        # normalized map: lower->original
        lower_map = { (c or "").strip().lower(): (c or "").strip() for c in fn }

        col_restaurant = _pick(lower_map, ["restaurant", "brand", "chain"])
        col_category   = _pick(lower_map, ["category", "menu category", "group"])
        col_item       = _pick(lower_map, ["item_name", "item", "product", "description", "item description", "itemtitle", "title"])
        if not col_item:
            col_item = _pick(lower_map, ["item_id"])
        col_size       = _pick(lower_map, ["size", "serving", "serving_size", "portion", "variant", "menu item size"])
        col_calories   = _pick(lower_map, ["calories", "kcal", "calorie", "energy"])
        col_protein    = _pick(lower_map, ["protein", "protein (g)", "proteins"])
        col_carbs      = _pick(lower_map, ["carbs", "carbohydrates", "carbohydrate", "carbs (g)"])
        col_fat        = _pick(lower_map, ["fat", "total fat", "fat (g)"])

        # extended columns
        col_fiber      = _pick(lower_map, ["fiber", "dietary fiber", "fiber (g)"])
        col_sugar      = _pick(lower_map, ["sugar", "sugars", "sugar (g)"])
        col_satfat     = _pick(lower_map, ["saturated fat", "sat fat", "saturated_fat", "saturated fat (g)"])
        col_polyfat    = _pick(lower_map, ["polyunsaturated fat", "poly fat", "polyunsaturated_fat"])
        col_monofat    = _pick(lower_map, ["monounsaturated fat", "mono fat", "monounsaturated_fat"])
        col_transfat   = _pick(lower_map, ["trans fat", "trans_fat", "trans fat (g)"])
        col_chol       = _pick(lower_map, ["cholesterol"])
        col_sodium     = _pick(lower_map, ["sodium"])
        col_potassium  = _pick(lower_map, ["potassium"])
        col_vita       = _pick(lower_map, ["vitamin a", "vit a"])
        col_vitc       = _pick(lower_map, ["vitamin c", "vit c"])
        col_calcium    = _pick(lower_map, ["calcium"])
        col_iron       = _pick(lower_map, ["iron"])

        allowed = {f.name for f in fields(MenuItem)}  # for robust construction
        out: List[MenuItem] = []

        for row in rd:
            r = (row.get(col_restaurant, "") if col_restaurant else "Chick-fil-A").strip()
            c = (row.get(col_category, "") if col_category else "").strip()
            raw_item = (row.get(col_item, "") if col_item else "").strip()
            if not raw_item:
                continue

            # split size from item name if needed
            name, parsed_size = _split_size_from_name(raw_item)
            size = (row.get(col_size, "").strip() if col_size else "") or parsed_size

            data = {
                "restaurant": r,
                "category": c,
                "item": name,
                "size": size or None,
                "calories": _parse_float(row.get(col_calories, "") if col_calories else ""),
                "protein":  _parse_float(row.get(col_protein,  "") if col_protein  else ""),
                "carbs":    _parse_float(row.get(col_carbs,    "") if col_carbs    else ""),
                "fat":      _parse_float(row.get(col_fat,      "") if col_fat      else ""),

                # extended (optional) — safely parsed
                "fiber":        _parse_float(row.get(col_fiber,     "") if col_fiber     else ""),
                "sugar":        _parse_float(row.get(col_sugar,     "") if col_sugar     else ""),
                "sat_fat":      _parse_float(row.get(col_satfat,    "") if col_satfat    else ""),
                "poly_fat":     _parse_float(row.get(col_polyfat,   "") if col_polyfat   else ""),
                "mono_fat":     _parse_float(row.get(col_monofat,   "") if col_monofat   else ""),
                "trans_fat":    _parse_float(row.get(col_transfat,  "") if col_transfat  else ""),
                "cholesterol":  _parse_float(row.get(col_chol,      "") if col_chol      else ""),
                "sodium":       _parse_float(row.get(col_sodium,    "") if col_sodium    else ""),
                "potassium":    _parse_float(row.get(col_potassium, "") if col_potassium else ""),
                "vitamin_a":    _parse_float(row.get(col_vita,      "") if col_vita      else ""),
                "vitamin_c":    _parse_float(row.get(col_vitc,      "") if col_vitc      else ""),
                "calcium":      _parse_float(row.get(col_calcium,   "") if col_calcium   else ""),
                "iron":         _parse_float(row.get(col_iron,      "") if col_iron      else ""),
            }

            # Filter to the dataclass fields to avoid TypeError
            safe_data = {k: v for k, v in data.items() if k in allowed}
            out.append(MenuItem(**safe_data))

        return out

def index_menu(items: List[MenuItem]) -> Dict[str, Dict[str, List[MenuItem]]]:
    data: Dict[str, Dict[str, List[MenuItem]]] = {}
    for it in items:
        data.setdefault(it.restaurant, {}).setdefault(it.category, []).append(it)
    return data

_cache = None
def get_index() -> Dict[str, Dict[str, List[MenuItem]]]:
    global _cache
    if _cache is None:
        _cache = index_menu(load_menu(MENU_CSV))
    return _cache

def categories_for(restaurant: str) -> List[str]:
    idx = get_index()
    cats = list(idx.get(restaurant, {}).keys())
    cats.sort(key=lambda s: s.lower())
    return cats
