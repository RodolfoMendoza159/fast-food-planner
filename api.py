from flask import Flask, request
import backend
from flask_cors import CORS # <-- 1. IMPORT CORS

app = Flask(__name__)
CORS(app) # <-- 2. INITIALIZE CORS

menu_df = backend.load_data()

@app.route("/")
def home():
    return "Hello, your API is running!"

@app.route("/restaurants")
def all_restaurants():
    restaurant_list = backend.get_all_restaurants(menu_df)
    return {"restaurants": restaurant_list}

@app.route("/menu/<string:restaurant_name>")
def menu(restaurant_name):
    sort_key = request.args.get('sort_by')
    order = request.args.get('order')
    is_ascending = (order == 'low_to_high')
    
    menu_data = backend.get_menu(
        menu_df, 
        restaurant_name, 
        sort_by=sort_key, 
        ascending=is_ascending
    )
    
    menu_json = menu_data.to_dict('records')
    return {"menu_items": menu_json}

if __name__ == "__main__":
    app.run(debug=True)