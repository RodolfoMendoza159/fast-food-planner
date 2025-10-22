
from typing import List, Tuple
from kivy.uix.screenmanager import Screen
from kivy.properties import StringProperty, ListProperty
from kivy.core.window import Window
from kivy.metrics import dp
from kivy.uix.modalview import ModalView
from kivy.graphics import Color, RoundedRectangle
from kivy.uix.popup import Popup
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.button import Button

from menu_data import get_index, MenuItem  # ensure menu_data_v3-style loader is used
from list_row import ListRow


class PillButton(Button):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.background_normal = ""
        self.background_down = ""
        self.background_color = (0,0,0,0)
        self.color = (1,1,1,1)
        self._bg_color_up = (0.28, 0.30, 0.33, 1)
        self._bg_color_down = (0.36, 0.38, 0.42, 1)
        with self.canvas.before:
            self._color_instr = Color(rgba=self._bg_color_up)
            self._rect = RoundedRectangle(pos=self.pos, size=self.size, radius=[12,])
        self.bind(pos=self._update_rect, size=self._update_rect, state=self._on_state)

    def _update_rect(self, *args):
        self._rect.pos = self.pos
        self._rect.size = self.size

    def _on_state(self, *args):
        self._color_instr.rgba = self._bg_color_down if self.state == 'down' else self._bg_color_up
DARK_COLOR = (0.078, 0.082, 0.086, 1)


class ItemsScreen(Screen):
    def _bind_wrap_height(self, lbl, container, side_padding=32):
        # Keep label centered, wrap to container width, and auto-size height
        def _upd(*_):
            max_w = max(0, container.width - side_padding)
            lbl.text_size = (max_w, None)
            lbl.texture_update()
            lbl.height = lbl.texture_size[1]
        container.bind(size=_upd)
        lbl.bind(texture_size=lambda *_: setattr(lbl, 'height', lbl.texture_size[1]))
        _upd()

    def go_back(self, *_):
        if self.manager and self.manager.has_screen('cfa_options'):
            self.manager.current = 'cfa_options'
    restaurant = StringProperty("Chick-fil-A")
    category = StringProperty("")
    # (title, subtitle) tuples for the current render
    entries = ListProperty([])

    # keep an unfiltered copy for search
    _all_entries: List[Tuple[str, str]] = []

    def on_pre_enter(self, *_):
        try:
            Window.clearcolor = DARK_COLOR
        except Exception:
            pass

    def set_context(self, restaurant: str, category: str):
        self.restaurant = restaurant
        self.category = category
        idx = get_index()
        items: List[MenuItem] = idx.get(restaurant, {}).get(category, [])
        built: List[Tuple[str, str]] = []
        for it in items:
            parts = []
            if it.calories is not None:
                parts.append(f"{int(it.calories)} cal")
            if getattr(it, "size", None):
                parts.append(str(it.size))
            if it.protein is not None:
                parts.append(f"{int(it.protein)}g protein")
            if it.carbs is not None:
                parts.append(f"{int(it.carbs)}g carbs")
            if it.fat is not None:
                parts.append(f"{int(it.fat)}g fat")
            subtitle = ", ".join(parts) if parts else ""
            built.append((it.item, subtitle))

        self._all_entries = built
        self.entries = built
        self._render()
        # clear any previous search
        s = self.ids.get("search")
        if s:
            s.text = ""
        t = self.ids.get("title")
        if t:
            t.text = f"{self.restaurant} — {self.category.title()}"

    def filter_items(self, query: str):
        q = (query or "").strip().lower()
        if not q:
            self.entries = list(self._all_entries)
        else:
            self.entries = [e for e in self._all_entries if q in e[0].lower() or q in e[1].lower()]
        self._render()

    def _render(self):
        cont = self.ids.get("items_container")
        msg = self.ids.get("message")
        if not cont:
            return
        cont.clear_widgets()

        if not self.entries:
            if msg:
                msg.text = "[i]No matching items.[/i]"
            return
        else:
            if msg:
                msg.text = ""

        for name, subtitle in self.entries:
            row = ListRow(title=name, subtitle=subtitle)
            row.bind(on_release=lambda _r, n=name: self.select_item(n))
            cont.add_widget(row)

    def _find_item(self, name: str):
        from menu_data import get_index
        idx = get_index()
        lst = idx.get(self.restaurant, {}).get(self.category, [])
        for it in lst:
            if it.item == name:
                return it
        return None

    def _confirm_add_popup(self, item):
        # Build a compact, rounded modal with no title and equal-width buttons
        outer = ModalView(size_hint=(0.75, 0.20), background_color=(0,0,0,0), auto_dismiss=False)

        card = BoxLayout(orientation='vertical', padding=16, spacing=12)
        # draw rounded rect background for the card
        with card.canvas.before:
            Color(rgba=(0.15, 0.16, 0.18, 1))
            bg = RoundedRectangle(pos=card.pos, size=card.size, radius=[16,])
        def _sync_bg(*_):
            bg.pos = card.pos
            bg.size = card.size
        card.bind(pos=_sync_bg, size=_sync_bg)

        # Title (bolded item), metrics line
        title = Label(text=f"Add [b]{item.item}[/b]?", markup=True, size_hint_y=None, halign='center', valign='middle')
        self._bind_wrap_height(title, card)
        sub_parts = []
        if item.size: sub_parts.append(item.size)
        if item.calories is not None: sub_parts.append(f"{int(item.calories)} kcal")
        if item.protein is not None: sub_parts.append(f"{int(item.protein)}g protein")
        if item.carbs is not None: sub_parts.append(f"{int(item.carbs)}g carbs")
        if item.fat is not None: sub_parts.append(f"{int(item.fat)}g fat")
        subtitle = Label(text=', '.join(sub_parts), size_hint_y=None, halign='center', valign='middle')
        self._bind_wrap_height(subtitle, card)

        # Buttons row: split in half with rounded buttons
        btns = BoxLayout(size_hint_y=None, height='44dp', spacing=12)
        cancel = PillButton(text='Cancel')
        add = PillButton(text='Add')
        cancel.size_hint_x = 0.5
        add.size_hint_x = 0.5
        btns.add_widget(cancel)
        btns.add_widget(add)

        card.add_widget(title)
        card.add_widget(subtitle)
        card.add_widget(btns)
        outer.add_widget(card)

        cancel.bind(on_release=lambda *_: outer.dismiss())
        def _do_add(*_):
            sm = self.manager
            if sm and sm.has_screen('calc'):
                calc = sm.get_screen('calc')
                calc.add_item(item)
            outer.dismiss()
        add.bind(on_release=_do_add)
        outer.open()

    def select_item(self, name: str):
        msg = self.ids.get("message")
        it = self._find_item(name)
        if it:
            self._confirm_add_popup(it)
        if msg:
            msg.text = f"Selected: [b]{name}[/b]"
