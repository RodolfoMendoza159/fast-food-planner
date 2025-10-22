
from typing import List
from kivy.uix.screenmanager import Screen
from kivy.uix.button import Button
from kivy.metrics import dp
from kivy.core.window import Window

from menu_data import categories_for

DARK_COLOR = (0.078, 0.082, 0.086, 1)


class CfaOptionsScreen(Screen):
    def go_back(self, *_):
        if self.manager and self.manager.has_screen('home'):
            self.manager.current = 'home'
    RESTAURANT = "Chick-fil-A"
    _all_categories: List[str] = []

    def on_pre_enter(self, *_):
        try:
            Window.clearcolor = DARK_COLOR
        except Exception:
            pass

    def on_kv_post(self, *_):
        # Build once
        if not self._all_categories:
            self._all_categories = categories_for(self.RESTAURANT) or []
            self._all_categories.sort(key=lambda s: s.lower())
        self._render(self._all_categories)

    def filter_categories(self, query: str):
        q = (query or "").strip().lower()
        if not q:
            self._render(self._all_categories)
            return
        filtered = [c for c in self._all_categories if q in c.lower()]
        self._render(filtered)

    def _render(self, cats: List[str]):
        grid = self.ids.get("grid")
        if not grid:
            return
        grid.clear_widgets()
        for cat in cats:
            label = cat.title()
            btn = Button(
                text=label,
                size_hint=(1, None),
                height=dp(110),
                halign="center",
                valign="middle",
                shorten=True,
            )
            btn.bind(on_release=lambda _b, c=cat: self.open_category(c))
            grid.add_widget(btn)

    def open_category(self, category_name: str):
        sm = self.manager
        if not sm:
            return
        # Lazy create ItemsScreen
        if not sm.has_screen("items"):
            from items_screen import ItemsScreen
            sm.add_widget(ItemsScreen(name="items"))
        items = sm.get_screen("items")
        items.set_context(self.RESTAURANT, category_name)
        sm.current = "items"
