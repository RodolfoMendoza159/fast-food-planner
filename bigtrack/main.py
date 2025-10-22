from kivy.config import Config
# Lock window size and disable maximizing/resizing
Config.set('graphics', 'resizable', '0')
Config.set('graphics', 'width', '360')
Config.set('graphics', 'height', '800')

from kivy.app import App
from kivy.core.window import Window
from kivy.lang import Builder
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.screenmanager import ScreenManager, FadeTransition

from ui_common import WINDOW_COLOR
from login_screen import LoginScreen
from create_account_screen import CreateAccountScreen
from home_screen import HomeScreen
from cfa_options import CfaOptionsScreen
from items_screen import ItemsScreen

from nav_bar import BottomNav
from stub_screens import CalcScreen, ListScreen, HistoryScreen

for kv in ("login.kv", "home.kv", "create_account.kv", "cfa_op.kv", "items.kv", "global_nav.kv", "stub_screens.kv"):
    Builder.load_file(kv)

DARK_COLOR = (0.078, 0.082, 0.086, 1)


class Root(BoxLayout):
    pass 


class BigTrackApp(App):
    sm_current = "login" 

    def build(self):
        Window.clearcolor = WINDOW_COLOR
        root = Root(orientation="vertical")

        self.sm = ScreenManager(
            transition=FadeTransition(duration=0.18, clearcolor=DARK_COLOR),
        )
        self.sm.bind(current=self._on_sm_current)

        # Screens
        self.sm.add_widget(LoginScreen(name="login"))
        self.sm.add_widget(CreateAccountScreen(name="create"))
        self.sm.add_widget(HomeScreen(name="home"))
        self.sm.add_widget(CfaOptionsScreen(name="cfa_options"))
        self.sm.add_widget(ItemsScreen(name="items"))
        self.sm.add_widget(CalcScreen(name="calc"))
        self.sm.add_widget(ListScreen(name="list"))
        self.sm.add_widget(HistoryScreen(name="history"))

        root.add_widget(self.sm)

        # Add bottom navigation only if not on login/create screen
        def update_nav(*_):
            root.clear_widgets()
            root.add_widget(self.sm)
            current = self.sm.current
            if current not in ("login", "create"):
                root.add_widget(BottomNav())

        # Recalculate nav whenever screen changes
        self.sm.bind(current=update_nav)
        update_nav()

        return root

    def _on_sm_current(self, *_):
        self.sm_current = self.sm.current

    def switch_to(self, screen_name: str):
        if self.sm and self.sm.has_screen(screen_name):
            self.sm.current = screen_name


if __name__ == "__main__":
    BigTrackApp().run()
