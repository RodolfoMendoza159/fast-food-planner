import pandas as pd #get for reading data

#Backend Functions

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




def start_app():
    file_path = 'nutritional_data.csv'
    try:
        menu_df = pd.read_csv(file_path)
    except FileNotFoundError:
        print(f"ERROR: The file '{file_path}' was not found.")
        return

    all_restaurants = get_all_restaurants(menu_df)
    print("Welcome to the Fast Food Meal Planner!")
    print("--- Please choose a restaurant ---")
    for i, name in enumerate(all_restaurants):
        print(f"{i + 1}: {name}")
    
    try:
        choice = int(input("Enter the number of the restaurant: ")) - 1
        chosen_restaurant_name = all_restaurants[choice]
    except (ValueError, IndexError):
        print("Invalid choice. Exiting.")
        return

    chosen_menu = get_menu(menu_df, chosen_restaurant_name)
    display_menu = pd.DataFrame()

    print(f"\n--- Options for {chosen_restaurant_name} ---")
    print("1: View Menu by Category")
    print("2: Search and Build a Meal")
    print("3: View Full Menu")
    
    try:
        action_choice = int(input("Please enter your choice (1, 2, or 3): "))
    except ValueError:
        print("Invalid choice. Exiting.")
        return


    elif action_choice == 2:
        collected_items = []
        while True:
            query = input("\nEnter the name or ID of the item to search for: ")
            search_results = search_item_by_id_or_name(chosen_menu, query)

            if search_results.empty:
                print("No items found for your search.")
            else:
                for index, row in search_results.iterrows():
                    display_item_details(row)
                    collected_items.append(row)
            
            another = input("\nSearch for another item? (yes/no): ").lower()
            if another != 'yes':
                break
        
        if collected_items:
             display_menu = pd.DataFrame(collected_items)
        else:
             print("No items were found to build a meal from.")
             return

    elif action_choice == 3: 
        display_menu = chosen_menu
    else:
        print("Invalid choice. Exiting.")
        return

    print(f"\n--- Menu to Build From ---")
    printable_menu = display_menu.reset_index(drop=True)
    for i, row in printable_menu.iterrows():
        print(f"{i + 1}: {row['item_name']} ({row['calories']} cal)")

    if printable_menu.empty:
        print("\nNo items to select from. Exiting.")
        return

    print("\nEnter the numbers of the items you want in your meal, separated by commas (e.g., 1, 5, 8).")
    meal_choice_str = input("Your meal: ")
    
    user_meal_items = []
    try:
        chosen_indices = [int(i.strip()) - 1 for i in meal_choice_str.split(',')]
        for i in chosen_indices:
            user_meal_items.append(printable_menu.loc[i, 'item_name'])
    except (ValueError, IndexError):
        print("Invalid meal selection. Exiting.")
        return

    final_totals = calculate_meal_macros(menu_df, user_meal_items)

    print("\n--- Your Meal's Nutritional Totals ---")
    print(f"Items: {user_meal_items}")
    for key, value in final_totals.items():
        print(f"{key}: {value}")

# Start the application 
if __name__ == "__main__":
    start_app()