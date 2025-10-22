
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.behaviors import ButtonBehavior
from kivy.properties import StringProperty, BooleanProperty

class NavItem(ButtonBehavior, BoxLayout):
    icon = StringProperty("")
    text = StringProperty("")
    target = StringProperty("")
    active = BooleanProperty(False)

class BottomNav(BoxLayout):
    pass
