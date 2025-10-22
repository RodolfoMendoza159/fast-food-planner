from kivy.uix.screenmanager import Screen
from kivy.core.window import Window
from kivy.properties import ListProperty, DictProperty, StringProperty
DARK_COLOR = (0.078, 0.082, 0.086, 1)

class HomeScreen(Screen):
    """
    - Categories are explicit:
        CHIK-FIL-A -> burgers
        MCDONALD'S -> burgers
        SUBWAY     -> sandwiches
    - Safe sorting: rebuilds the grid in computed order.
    - Selected pill highlights via `selected_category`.
    """

    # (display name, category key, kv-id) — ids must match home.kv
    restaurants_meta = ListProperty([
        ("CHIK-FIL-A", "burgers", "cf_btn"),
        ("MCDONALD'S", "burgers", "mcd_btn"),
        ("SUBWAY", "sandwiches", "sub_btn"),
    ])

    rows_by_id = DictProperty({})     # {"cf_btn": <widget>, ...}
    ordered_ids = ListProperty([])    # current order of row ids
    selected_category = StringProperty("")  # "", "burgers", "tacos", "sandwiches"

    def on_pre_enter(self, *_):
        Window.clearcolor = DARK_COLOR
        # reset selection each time you enter Home
        self.selected_category = ""

    def on_leave(self, *_):
        Window.clearcolor = DARK_COLOR

    def on_kv_post(self, *_):
        """Capture widget refs and set a known starting order."""
        grid = self.ids.get("restaurants_grid")
        if not grid:
            return

        # Map kv ids -> actual widgets
        rows = {}
        for _name, _cat, rid in self.restaurants_meta:
            w = self.ids.get(rid)
            if w:
                rows[rid] = w
        self.rows_by_id = rows

        # Canonical starting order (matches restaurants_meta order)
        self.ordered_ids = [rid for (_n, _c, rid) in self.restaurants_meta]

        # Ensure grid children follow that canonical order at start
        try:
            grid.clear_widgets()
            for rid in self.ordered_ids:
                w = self.rows_by_id.get(rid)
                if w:
                    grid.add_widget(w)
        except Exception:
            pass

    # Optional stubs
    def on_profile(self):
        pass

    def on_restaurant(self, name: str):
        if (name or "").strip().upper() in ("CHIK-FIL-A", "CHICK-FIL-A"):
            self.manager.current = "cfa_options"
        pass

    def on_category(self, name: str):
        """
        Highlight the pill and move matching rows to the top,
        preserving relative order.
        """
        key = (name or "").strip().lower()
        self.selected_category = key

        grid = self.ids.get("restaurants_grid")
        if not grid or not self.rows_by_id:
            return

        # kv_id -> category
        cat_by_id = {rid: cat for (_n, cat, rid) in self.restaurants_meta}

        matches = [rid for rid in self.ordered_ids if cat_by_id.get(rid) == key]
        others  = [rid for rid in self.ordered_ids if cat_by_id.get(rid) != key]

        # If there are no matches (e.g., "tacos" today), keep order—still highlight pill.
        if not matches:
            return

        new_order = matches + others

        try:
            grid.clear_widgets()   # detach without destroying
            for rid in new_order:
                w = self.rows_by_id.get(rid)
                if w:
                    grid.add_widget(w)
            self.ordered_ids = new_order
        except Exception:
            # Fail-safe: leave layout as-is if anything unexpected occurs
            return
