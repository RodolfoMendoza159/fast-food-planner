# swipe_row.py — compact swipe-to-delete row with slide reveal
from kivy.uix.relativelayout import RelativeLayout
from kivy.properties import StringProperty, NumericProperty, ObjectProperty, BooleanProperty
from kivy.animation import Animation
from kivy.lang import Builder
from kivy.metrics import dp

Builder.load_string("""
#:kivy 2.3.0

<SwipeRow>:
    size_hint_y: None
    height: "52dp"  # compact row
    

    # Background action (Delete)
    Button:
        id: delete_btn
        text: "Delete"
        size_hint: None, None
        size: "88dp", root.height - dp(10)
        pos: root.right - self.width - dp(6), root.y + dp(5)
        background_normal: ""
        background_color: 0.80, 0.20, 0.24, 1
        on_release: root.on_delete_pressed()

    # Foreground content that slides
    BoxLayout:
        id: content
        orientation: "vertical"
        size_hint: None, None
        size: root.width, root.height
        pos: root.x + root._offset_x, root.y
        padding: 8
        spacing: 2
        canvas.before:
            Color:
                rgba: 0.20, 0.21, 0.22, 1
            RoundedRectangle:
                size: self.size
                pos: self.pos
                radius: [12,]
        Label:
            text: root.title
            color: 1,1,1,1
            bold: True
            font_size: "14sp"
            halign: "left"
            valign: "middle"
            text_size: self.size
        Label:
            text: root.subtitle
            color: 0.9,0.9,0.9,1
            font_size: "12sp"
            halign: "left"
            valign: "middle"
            text_size: self.size
""")

class SwipeRow(RelativeLayout):
    title = StringProperty("")
    subtitle = StringProperty("")
    index = NumericProperty(0)
    delete_callback = ObjectProperty(None, allownone=True)

    _start_x = 0.0
    _dragging = False
    _open = BooleanProperty(False)
    _offset_x = 0.0

    _reveal_px = dp(96)
    _threshold_open = dp(40)
    _threshold_close = dp(20)

    def on_size(self, *_):
        cont = self.ids.get("content")
        if cont:
            cont.size = (self.width, self.height)

    def on_touch_down(self, touch):
        if self.collide_point(*touch.pos):
            self._start_x = touch.x
            self._dragging = True
        return super().on_touch_down(touch)

    def on_touch_move(self, touch):
        if not self._dragging or not self.collide_point(*touch.pos):
            return super().on_touch_move(touch)

        dx = touch.x - self._start_x
        if dx < 0:
            new_offset = max(-self._reveal_px, dx)
        else:
            new_offset = min(0.0, self._offset_x + dx)

        self._set_offset(new_offset)
        return True

    def on_touch_up(self, touch):
        if not self._dragging:
            return super().on_touch_up(touch)

        dx = touch.x - self._start_x
        if dx <= -self._threshold_open:
            self.open()
        elif dx >= self._threshold_close:
            self.close()
        else:
            if abs(self._offset_x) > self._reveal_px / 2.0:
                self.open()
            else:
                self.close()

        self._dragging = False
        return super().on_touch_up(touch)

    def _set_offset(self, val):
        self._offset_x = float(val)
        cont = self.ids.get("content")
        if cont:
            cont.pos = (self.x + self._offset_x, self.y)

    def open(self):
        self._open = True
        Animation(_offset_x=-self._reveal_px, d=0.15, t="out_quad").bind(
            on_progress=lambda *args: self._set_offset(self._offset_x)
        ).start(self)

    def close(self):
        self._open = False
        Animation(_offset_x=0.0, d=0.15, t="out_quad").bind(
            on_progress=lambda *args: self._set_offset(self._offset_x)
        ).start(self)

    def on_delete_pressed(self):
        if self.delete_callback:
            self.delete_callback(self.index)
