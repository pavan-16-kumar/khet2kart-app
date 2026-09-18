import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Missing Supabase credentials in .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
db_file = os.path.join(os.path.dirname(__file__), "data", "db.json")

def seed_database():
    print("Loading data from db.json...")
    with open(db_file, "r") as f:
        data = json.load(f)

    print("Seeding Farmers...")
    for f in data.get("farmers", []):
        try:
            supabase.table("farmers").insert({
                "id": f["id"],
                "farmer_id": f["farmerId"],
                "name": f["name"],
                "phone": f["phone"],
                "state": f.get("state"),
                "district": f.get("district"),
                "village": f.get("village"),
                "farm_area": f.get("farmArea"),
                "main_crops": f.get("mainCrops"),
                "years_farming": f.get("yearsFarming"),
                "lat": f.get("coordinates", [0, 0])[0],
                "lng": f.get("coordinates", [0, 0])[1],
                "verified": f.get("verified", True)
            }).execute()
        except Exception as e:
            print(f"Skipping farmer {f['farmerId']} - {e}")

    print("Seeding Hubs...")
    for h in data.get("hubs", []):
        try:
            supabase.table("hubs").insert({
                "id": h["id"],
                "name": h["name"],
                "address": h["address"],
                "lat": h.get("coordinates", [0, 0])[0],
                "lng": h.get("coordinates", [0, 0])[1],
                "coverage_radius_km": h.get("coverageRadiusKm"),
                "capacity_kg": h.get("capacityKg"),
                "current_stock_kg": h.get("currentStockKg"),
                "status": h.get("status"),
                "manager": h.get("manager"),
                "available_crops": h.get("availableCrops", [])
            }).execute()
        except Exception as e:
            print(f"Skipping hub {h['id']} - {e}")

    print("Seeding Listings...")
    for l in data.get("listings", []):
        try:
            supabase.table("listings").insert({
                "id": l["id"],
                "listing_id": l["listingId"],
                "farmer_id": l["farmerId"],
                "farmer_name": l["farmerName"],
                "crop_name": l["cropName"],
                "variety": l["variety"],
                "category": l["category"],
                "grade": l["grade"],
                "available_quantity": l.get("availableQuantity"),
                "price_per_kg": l.get("pricePerKg"),
                "harvest_date": l.get("harvestDate"),
                "image_url": l.get("imageUrl"),
                "location": l.get("location")
            }).execute()
        except Exception as e:
            print(f"Skipping listing {l['listingId']} - {e}")

    print("Seeding Orders...")
    for o in data.get("orders", []):
        try:
            supabase.table("orders").insert({
                "id": o["id"],
                "order_id": o["orderId"],
                "customer_id": o["customerId"],
                "farmer_id": o["farmerId"],
                "crop_name": o["cropName"],
                "quantity": o.get("quantity"),
                "total_amount": o.get("totalAmount"),
                "subtotal": o.get("subtotal"),
                "delivery_fee": o.get("delivery"),
                "status": o.get("status"),
                "payment_method": o.get("paymentMethod"),
                "buyer": o.get("buyer"),
                "delivery_address": o.get("deliveryAddress")
            }).execute()
            
            # Seed order items
            for item in o.get("items", []):
                supabase.table("order_items").insert({
                    "order_ref": o["id"],
                    "listing_id": item["listingId"],
                    "crop_name": item["cropName"],
                    "quantity": item["quantity"],
                    "price_per_kg": item["pricePerKg"]
                }).execute()
        except Exception as e:
            print(f"Skipping order {o['orderId']} - {e}")

    print("Seeding Inventory Batches...")
    for b in data.get("inventoryBatches", []):
        try:
            supabase.table("inventory_batches").insert({
                "batch_id": b["batchId"],
                "crop_name": b["cropName"],
                "farmer_id": b["farmerId"],
                "farmer_name": b["farmerName"],
                "quantity_kg": b["quantityKg"],
                "grade": b["grade"],
                "harvest_date": b["harvestDate"],
                "age_days": b["ageDays"],
                "shelf_life_days": b["shelfLifeDays"],
                "hub_id": b["hubId"],
                "status": b["status"],
                "price_per_kg": b["pricePerKg"],
                "temperature": b["temperature"]
            }).execute()
        except Exception as e:
            print(f"Skipping batch {b['batchId']} - {e}")

    print("Seeding Database Complete! 🚀")

if __name__ == "__main__":
    seed_database()
