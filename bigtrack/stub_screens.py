
from typing import List
from kivy.uix.screenmanager import Screen
from kivy.properties import ListProperty
from swipe_row import SwipeRow
from menu_data import MenuItem

class CalcScreen(Screen):
    cart = ListProperty([])

    def add_item(self, item: MenuItem):
        self.cart.append({
            "restaurant": item.restaurant,
            "category": item.category,
            "item": item.item,
            "size": getattr(item, "size", None),
            "calories": getattr(item, "calories", 0) or 0,
            "protein": getattr(item, "protein", 0) or 0,
            "carbs": getattr(item, "carbs", 0) or 0,
            "fat": getattr(item, "fat", 0) or 0,
            "fiber": getattr(item, "fiber", 0) or 0,
            "sugar": getattr(item, "sugar", 0) or 0,
            "sat_fat": getattr(item, "sat_fat", 0) or 0,
            "poly_fat": getattr(item, "poly_fat", 0) or 0,
            "mono_fat": getattr(item, "mono_fat", 0) or 0,
            "trans_fat": getattr(item, "trans_fat", 0) or 0,
            "cholesterol": getattr(item, "cholesterol", 0) or 0,
            "sodium": getattr(item, "sodium", 0) or 0,
            "potassium": getattr(item, "potassium", 0) or 0,
            "vitamin_a": getattr(item, "vitamin_a", 0) or 0,
            "vitamin_c": getattr(item, "vitamin_c", 0) or 0,
            "calcium": getattr(item, "calcium", 0) or 0,
            "iron": getattr(item, "iron", 0) or 0,
        })
        self.refresh()

    def delete_item(self, index: int):
        if 0 <= index < len(self.cart):
            self.cart.pop(index)
            self.refresh()

    def clear_items(self):
        self.cart = []
        self.refresh()

    def refresh(self):
        ids = self.ids
        cont = ids.get("calc_items")
        if cont:
            cont.clear_widgets()
            for i, entry in enumerate(self.cart):
                parts = []
                if entry.get("size"):
                    parts.append(str(entry["size"]))
                if entry.get("calories") is not None:
                    parts.append(f"{int(entry['calories'])} kcal")
                if entry.get("protein") is not None:
                    parts.append(f"{int(entry['protein'])}g protein")
                if entry.get("carbs") is not None:
                    parts.append(f"{int(entry['carbs'])}g carbs")
                if entry.get("fat") is not None:
                    parts.append(f"{int(entry['fat'])}g fat")
                cont.add_widget(SwipeRow(
                    title=entry["item"],
                    subtitle=", ".join(parts),
                    index=i,
                    delete_callback=self.delete_item,
                ))

        # macros band
        total = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
        for e in self.cart:
            for k in total.keys():
                v = e.get(k) or 0
                try:
                    total[k] += float(v)
                except Exception:
                    pass
        totals = self.ids.get("totals")
        if totals:
            totals.text = (f"Total:  {int(total['calories'])} calories      ")
                           #f"{int(total['protein'])}g protein   •   "
                           #f"{int(total['carbs'])}g carbs   •   "
                           #f"{int(total['fat'])}g fat")

        self.refresh_table()

    def refresh_table(self):
        nutrient_keys = [
            ("protein", "Protein", "g"),
            ("carbs", "Carbohydrates", "g"),
            ("fiber", "Fiber", "g"),
            ("sugar", "Sugar", "g"),
            ("fat", "Fat", "g"),
            ("sat_fat", "Saturated Fat", "g"),
            ("poly_fat", "Polyunsaturated Fat", "g"),
            ("mono_fat", "Monounsaturated Fat", "g"),
            ("trans_fat", "Trans Fat", "g"),
            ("cholesterol", "Cholesterol", "mg"),
            ("sodium", "Sodium", "mg"),
            ("potassium", "Potassium", "mg"),
            ("vitamin_a", "Vitamin A", "IU"),
            ("vitamin_c", "Vitamin C", "mg"),
            ("calcium", "Calcium", "mg"),
            ("iron", "Iron", "mg"),
        ]
        totals = {k: 0.0 for k, _, _ in nutrient_keys}
        for entry in self.cart:
            for k in totals.keys():
                v = entry.get(k)
                if v is None:
                    continue
                try:
                    totals[k] += float(v)
                except Exception:
                    pass
        for k, _label, _unit in nutrient_keys:
            lab = self.ids.get(f"val_{k}")
            if lab:
                val = totals[k]
                lab.text = str(int(val)) if val == int(val) else f"{val:.1f}"


class ListScreen(Screen):
    pass

class HistoryScreen(Screen):
    pass
