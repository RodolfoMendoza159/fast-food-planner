
from kivy.uix.screenmanager import Screen
from kivy.clock import Clock
from kivy.animation import Animation

from ui_common import add_user

class CreateAccountScreen(Screen):
    def on_pre_enter(self, *args):
        top_bun = self.ids.get("top_bun")
        bottom_bun = self.ids.get("bottom_bun")
        if top_bun and bottom_bun:
            Animation.cancel_all(top_bun, bottom_bun)
            Animation(pos_hint={"center_y": 0.72}, d=0.25, t="out_quad").start(top_bun)
            Animation(pos_hint={"center_y": 0.30}, d=0.25, t="out_quad").start(bottom_bun)

    def submit(self, *_):
        e = (self.ids.email.text or "").strip()
        u = (self.ids.username.text or "").strip()
        p1 = (self.ids.password.text or "").strip()
        p2 = (self.ids.confirm_password.text or "").strip()

        if not all([e, u, p1, p2]):
            self.ids.message.text = "[color=ff4444]Please fill out all fields.[/color]"
            return
        if "@" not in e or "." not in e:
            self.ids.message.text = "[color=ff4444]Please enter a valid email.[/color]"
            return
        if p1 != p2:
            self.ids.message.text = "[color=ff4444]Passwords do not match.[/color]"
            return
        if len(p1) < 4:
            self.ids.message.text = "[color=ff4444]Password must be at least 4 characters (demo).[/color]"
            return

        try:
            add_user(e, u, p1)
        except ValueError as ex:
            self.ids.message.text = f"[color=ff4444]{str(ex)}[/color]"
            return
        except Exception:
            self.ids.message.text = "[color=ff4444]Unexpected error creating account.[/color]"
            return

        self.ids.message.text = "[color=22aa22]Account created! Returning to login...[/color]"
        Clock.schedule_once(lambda *_: setattr(self.manager, "current", "login"), 0.9)

    def back_to_login(self, *_):
        self.manager.current = "login"
