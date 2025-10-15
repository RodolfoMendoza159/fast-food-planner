import csv
from django.core.management.base import BaseCommand
from core.models import Restaurant, MenuItem

class Command(BaseCommand):
    help = 'Loads menu data from a CSV file into the database'

    def handle(self, *args, **kwargs):
        csv_file_path = 'core/Restaurant_data.csv'
        
        self.stdout.write(self.style.SUCCESS('--- STARTING DATA LOAD SCRIPT ---'))
        
        MenuItem.objects.all().delete()
        Restaurant.objects.all().delete()
        self.stdout.write('Cleared existing Restaurant and MenuItem data.')

        try:
            with open(csv_file_path, mode='r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                
                #  DEBUG: Print the headers the script is seeing ---
                self.stdout.write(f"CSV Headers found: {reader.fieldnames}")

                restaurants = {}
                item_count = 0
                
                for i, row in enumerate(reader):
                    restaurant_name = row.get('Restaurant') or row.get('rest_name')
                    item_name = row.get('Item') or row.get('item_name')

                    # --- DEBUG: Print the first 3 rows to see the data ---
                    if i < 3:
                        self.stdout.write(f"Processing Row {i+1}: {row}")

                    if not restaurant_name or not item_name:
                        self.stdout.write(self.style.WARNING(f"Skipping row {i+1} due to missing restaurant or item name."))
                        continue

                    if restaurant_name not in restaurants:
                        restaurant, created = Restaurant.objects.get_or_create(name=restaurant_name)
                        restaurants[restaurant_name] = restaurant
                    
                    restaurant_obj = restaurants[restaurant_name]

                    MenuItem.objects.create(
                        restaurant=restaurant_obj,
                        name=item_name,
                        category=row.get('category'),
                        serving_size=row.get('serving_size'),
                        calories=int(float(row.get('calories', 0))),
                        fat=float(row.get('fat', 0)),
                        sat_fat=float(row.get('sat_fat', 0)),
                        trans_fat=float(row.get('trans_fat', 0)),
                        cholesterol=float(row.get('cholesterol', 0)),
                        sodium=float(row.get('sodium', 0)),
                        carbohydrates=float(row.get('carbohydrates', 0)),
                        fiber=float(row.get('fiber', 0)),
                        sugar=float(row.get('sugar', 0)),
                        protein=float(row.get('protein', 0))
                    )
                    item_count += 1
                
            self.stdout.write(self.style.SUCCESS(f'--- SCRIPT FINISHED: Successfully loaded {item_count} menu items! ---'))
        
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"ERROR: File not found at {csv_file_path}."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'An error occurred: {e}'))