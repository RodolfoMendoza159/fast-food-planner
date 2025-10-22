
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.behaviors import ButtonBehavior
from kivy.properties import StringProperty

class ListRow(ButtonBehavior, BoxLayout):
    title = StringProperty("")
    subtitle = StringProperty("")
