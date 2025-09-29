import backend
import pandas as pd 

def start_app():
    # Load the data using the function from the backend
    menu_df = backend.load_data()
    if menu_df is None:
        print("ERROR: Could not load the data file. Exiting.")
        return

    # Restaurant Selection
    all_restaurants = backend.get_all_restaurants(menu_df)
    print("Welcome to the Fast Food Meal Planner!") #name concept can change
    print("--- Please choose a restaurant ---")
    for i, name in enumerate(all_restaurants):
        print(f"{i + 1}: {name}")
    
    try:
        choice = int(input("Enter the number of the restaurant: ")) - 1
        chosen_restaurant_name = all_restaurants[choice]
    except (ValueError, IndexError):
        print("Invalid choice. Exiting.")
        return

    chosen_menu = backend.get_menu(menu_df, chosen_restaurant_name)
    display_menu = None

    print(f"\n--- Options for {chosen_restaurant_name} ---")
    print("1: View Menu by Category")
    print("2: Search Item and Nutrition Info")
    print("3: View Full Menu of Restaurant")
    
    try:
        action_choice = int(input("Please enter your choice (1, 2, or 3): "))
    except ValueError:
        print("Invalid choice. Exiting.")
        return

    if action_choice == 1: # View by Category
        categories = backend.get_categories(chosen_menu)
        print("\n--- Please choose a category ---")
        for i, cat in enumerate(categories):
            print(f"{i + 1}: {cat}")
        
        try:
            cat_choice_num = int(input("Enter the number of the category: ")) - 1
            chosen_category = categories[cat_choice_num]
            display_menu = chosen_menu[chosen_menu['category'] == chosen_category]
        except (ValueError, IndexError):
            print("Invalid category choice. Exiting.")
            return

    elif action_choice == 2: # Search for an Item
        collected_items = []
        while True:
            query = input("\nEnter the name or ID of the item to search for: ")
            search_results = backend.search_item_by_id_or_name(chosen_menu, query)

            if search_results.empty:
                print("No items found for your search.")
            else:
                for index, row in search_results.iterrows():
                    backend.display_item_details(row)
                    collected_items.append(row)
            
            another = input("\nSearch for another item? (yes/no): ").lower()
            if another != 'yes':
                break
        
        if collected_items:
             display_menu = pd.DataFrame(collected_items)
        else:
             print("No items were found to build a meal from.")
             return

    elif action_choice == 3: # View Full Menu
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

    final_totals = backend.calculate_meal_macros(menu_df, user_meal_items)

    print("\n--- Your Meal's Nutritional Totals ---")
    print(f"Items: {user_meal_items}")
    for key, value in final_totals.items():
        print(f"{key}: {value}")

# Start the application 
if __name__ == "__main__":
    start_app()