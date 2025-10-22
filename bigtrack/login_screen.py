
from typing import Optional, cast

from kivy.uix.screenmanager import Screen
from kivy.clock import Clock
from kivy.uix.textinput import TextInput
from kivy.uix.label import Label

from ui_common import verify_user


class LoginScreen(Screen):
    # ---- optional helpers ----
    def _txt(self, key: str) -> Optional[TextInput]:
        return cast(Optional[TextInput], self.ids.get(key))

    def _lbl(self, key: str) -> Optional[Label]:
        return cast(Optional[Label], self.ids.get(key))

    # ---- lifecycle ----
    def on_kv_post(self, *args):
        # Bind Enter to do_login safely
        u = self._txt("username")
        p = self._txt("password")
        if u:
            try:
                u.multiline = False
                u.bind(on_text_validate=lambda *_: self.do_login())
            except Exception:
                pass
        if p:
            try:
                p.multiline = False
                p.bind(on_text_validate=lambda *_: self.do_login())
            except Exception:
                pass

    # ---- actions called from KV ----
    def do_login(self, *_args) -> None:
        # NEVER crash on login; show a message instead
        result = self._lbl("result")

        try:
            username = (self._txt("username").text if self._txt("username") else "").strip()
            password = (self._txt("password").text if self._txt("password") else "").strip()

            if not username or not password:
                if result: result.text = "Please enter username and password."
                return

            if verify_user(username, password):
                if result: result.text = ""
                if self.manager and self.manager.has_screen("home"):
                    self.manager.current = "home"
                return
            else:
                if result: result.text = "Invalid username or password."
        except Exception as ex:
            if result:
                result.text = f"Login error: {ex}"

    def go_to_create(self, *_args) -> None:
        if self.manager and self.manager.has_screen("create"):
            self.manager.current = "create"
