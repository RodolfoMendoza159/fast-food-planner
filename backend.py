import pandas as pd

# This function handles loading the data from the CSV file
def load_data(file_path='nutritional_data.csv'):
    try:
        return pd.read_csv(file_path)
    except FileNotFoundError:
        return None

# Data Functions 

def get_all_restaurants(dataframe):
    return dataframe['rest_name'].unique().tolist()

def get_menu(dataframe, restaurant_name):
    return dataframe[dataframe['rest_name'] == restaurant_name]

def calculate_meal_macros(dataframe, selected_items):
    meal_df = dataframe[dataframe['item_name'].isin(selected_items)]
    totals = {
        'Total Calories': int(meal_df['calories'].sum()),
        'Total Protein (g)': int(meal_df['protein'].sum()),
        'Total Fat (g)': int(meal_df['fat'].sum()),
        'Total Carbs (g)': int(meal_df['carbohydrates'].sum())
    }
    return totals

def search_item_by_id_or_name(dataframe, query):
    try:
        item_id_query = int(query)
        results = dataframe[dataframe['item_id'] == item_id_query]
    except ValueError:
        results = dataframe[dataframe['item_name'].str.contains(query, case=False, na=False)]
    return results

def get_categories(menu_dataframe):
    return menu_dataframe['category'].unique().tolist()

def display_item_details(item_series):
    print(f"\n--- Details for: {item_series['item_name']} ---")
    details_to_show = [
            'serving_size', 
            'calories', 
            'fat', 
            'sat_fat', 
            'trans_fat', 
            'cholesterol',
            'sodium', 
            'carbohydrates', # CORRECTED 
            'fiber', 
            'sugar', 
            'protein'
        ]

    for column in details_to_show:
        if column in item_series:
            print(f"{column.replace('_', ' ').capitalize()}: {item_series[column]}")