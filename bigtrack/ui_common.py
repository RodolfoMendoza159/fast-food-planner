
from kivy.uix.widget import Widget
from kivy.properties import StringProperty, ListProperty, NumericProperty
from kivy.clock import Clock
from kivy.core.text import Label as CoreLabel
from kivy.graphics import Color, Rectangle
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.behaviors import ButtonBehavior
from kivy.uix.image import Image
from kivy.uix.label import Label
import json
import os
import hashlib
from datetime import datetime

TARGET_SIZE = (390, 844)
WINDOW_COLOR = (0, 0.71, 1, 1)

VALID_USER = "admin"
VALID_PWD = "12345"

TOP_BUN = r"C:/Users/alexj/Pictures/topbun2.png"
BOTTOM_BUN = r"C:/Users/alexj/Pictures/bottombun2.png"
GOOGLE_ICON = r"C:/Users/alexj/Pictures/google.png"
APPLE_ICON = r"C:/Users/alexj/Pictures/apple.png"

USERS_DB = "users.json"


def _ensure_db():
    if not os.path.exists(USERS_DB):
        with open(USERS_DB, "w", encoding="utf-8") as f:
            json.dump({"users": []}, f, indent=2)


def load_users():
    _ensure_db()
    with open(USERS_DB, "r", encoding="utf-8") as f:
        return json.load(f)


def save_users(data):
    with open(USERS_DB, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def hash_pwd(pwd: str) -> str:
    return hashlib.sha256(pwd.encode("utf-8")).hexdigest()


def add_user(email: str, username: str, password: str) -> None:
    data = load_users()
    for u in data["users"]:
        if u["email"].lower() == email.lower():
            raise ValueError("Email already in use")
        if u["username"].lower() == username.lower():
            raise ValueError("Username already in use")
    data["users"].append({
        "email": email,
        "username": username,
        "password_hash": hash_pwd(password),
        "created_at": datetime.utcnow().isoformat() + "Z"
    })
    save_users(data)


def verify_user(username: str, password: str) -> bool:
    if username == VALID_USER and password == VALID_PWD:
        return True
    data = load_users()
    hp = hash_pwd(password)
    for u in data["users"]:
        if u["username"].lower() == username.lower() and u["password_hash"] == hp:
            return True
    return False


class OutlinedText(Widget):
    text = StringProperty("Title")
    font_size = NumericProperty(22)
    color = ListProperty([1, 1, 1, 1])
    outline_color = ListProperty([0, 0, 0, 0])
    outline_width = NumericProperty(0)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.bind(
            text=self._refresh,
            font_size=self._refresh,
            color=self._refresh,
            outline_color=self._refresh,
            outline_width=self._refresh,
            size=self._refresh,
            pos=self._refresh,
        )
        Clock.schedule_once(lambda *_: self._refresh(), 0)

    def _refresh(self, *args):
        cl = CoreLabel(text=self.text, font_size=self.font_size)
        cl.refresh()
        tex = cl.texture
        tw, th = tex.size

        if self.size_hint == (None, None) and (self.width == 100 and self.height == 100):
            self.size = (max(tw, 1), max(th, 1))

        self.canvas.clear()
        with self.canvas:
            ow = int(self.outline_width)
            Color(*self.outline_color)
            Rectangle(texture=tex, pos=(self.x - ow, self.y), size=(tw, th))
            Rectangle(texture=tex, pos=(self.x + ow, self.y), size=(tw, th))
            Rectangle(texture=tex, pos=(self.x, self.y - ow), size=(tw, th))
            Rectangle(texture=tex, pos=(self.x, self.y + ow), size=(tw, th))
            Color(*self.color)
            Rectangle(texture=tex, pos=self.pos, size=(tw, th))


class IconButton(ButtonBehavior, BoxLayout):
    icon_source = StringProperty("")
    label_text = StringProperty("")
    bg_rgba = ListProperty([1, 1, 1, 1])
    text_rgba = ListProperty([0, 0, 0, 1])

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.orientation = "horizontal"
        self.spacing = 10
        self.padding = [10, 5]
        self.size_hint = (0.8, None)
        self.height = 42

        with self.canvas.before:
            self._bg_color = Color(*self.bg_rgba)
            self._rect = Rectangle(size=self.size, pos=self.pos)

        self.bind(size=self._update_rect, pos=self._update_rect)
        self.bind(bg_rgba=self._on_bg_change)

        self._icon = Image(size_hint=(None, None), size=(24, 24))
        self._label = Label(valign="middle", halign="left")
        self.add_widget(self._icon)
        self.add_widget(self._label)

        Clock.schedule_once(self._apply_props, 0)

        self.bind(icon_source=lambda *_: self._apply_props(),
                  label_text=lambda *_: self._apply_props(),
                  text_rgba=lambda *_: self._apply_props())

    def _on_bg_change(self, *_):
        self._bg_color.rgba = self.bg_rgba

    def _update_rect(self, *args):
        self._rect.size = self.size
        self._rect.pos = self.pos

    def _apply_props(self, *_):
        self._icon.source = self.icon_source
        self._label.text = self.label_text
        self._label.color = self.text_rgba
