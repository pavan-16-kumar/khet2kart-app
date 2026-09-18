import os
import time
from typing import Dict, Any, List, Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            print("WARNING: Supabase URL or Key missing!")
        self.supabase: Client = create_client(url, key)

    # ------------------ USERS & ROLES ------------------
    def get_users(self) -> List[Dict[str, Any]]:
        res = self.supabase.table("profiles").select("*").execute()
        return res.data

    def get_user_by_phone(self, phone: str) -> Optional[Dict[str, Any]]:
        clean_phone = phone.strip().replace("+91", "").strip()
        res = self.supabase.table("profiles").select("*").eq("phone", clean_phone).execute()
        return res.data[0] if res.data else None

    def get_user_by_role(self, role: str) -> Optional[Dict[str, Any]]:
        res = self.supabase.table("profiles").select("*").eq("role", role.upper()).execute()
        return res.data[0] if res.data else None

    # ------------------ FARMERS ------------------
    def get_farmers(self) -> List[Dict[str, Any]]:
        res = self.supabase.table("farmers").select("*").execute()
        return res.data

    def add_farmer(self, farmer_data: Dict[str, Any]) -> Dict[str, Any]:
        state_code = farmer_data.get("state", "XX")[:2].upper()
        dist_code = farmer_data.get("district", "XXX")[:3].upper()
        num = str(int(time.time()))[-6:]
        farmer_id = f"FC-{state_code}-{dist_code}-26-{num}"
        
        record = {
            "id": f"f-{int(time.time() * 1000)}",
            "farmer_id": farmer_id,
            "name": farmer_data.get("name"),
            "phone": farmer_data.get("phone"),
            "state": farmer_data.get("state"),
            "district": farmer_data.get("district"),
            "village": farmer_data.get("village"),
            "farm_area": farmer_data.get("farmArea"),
            "main_crops": farmer_data.get("mainCrops"),
            "years_farming": farmer_data.get("yearsFarming"),
            "lat": farmer_data.get("coordinates", [0, 0])[0] if "coordinates" in farmer_data else None,
            "lng": farmer_data.get("coordinates", [0, 0])[1] if "coordinates" in farmer_data else None,
            "verified": True
        }
        res = self.supabase.table("farmers").insert(record).execute()
        return res.data[0] if res.data else record

    # ------------------ LISTINGS ------------------
    def get_listings(self) -> List[Dict[str, Any]]:
        res = self.supabase.table("listings").select("*").execute()
        return res.data

    def add_listing(self, listing_data: Dict[str, Any]) -> Dict[str, Any]:
        record = {
            "id": str(int(time.time())),
            "listing_id": f"LST-{int(time.time())}",
            "farmer_id": listing_data.get("farmerId"),
            "farmer_name": listing_data.get("farmerName"),
            "crop_name": listing_data.get("cropName"),
            "variety": listing_data.get("variety"),
            "category": listing_data.get("category"),
            "grade": listing_data.get("grade"),
            "available_quantity": listing_data.get("availableQuantity"),
            "price_per_kg": listing_data.get("pricePerKg"),
            "harvest_date": listing_data.get("harvestDate"),
            "image_url": listing_data.get("imageUrl"),
            "location": listing_data.get("location")
        }
        res = self.supabase.table("listings").insert(record).execute()
        return res.data[0] if res.data else record

    # ------------------ ORDERS ------------------
    def get_orders(self) -> List[Dict[str, Any]]:
        res = self.supabase.table("orders").select("*, order_items(*)").execute()
        orders = []
        for o in res.data:
            o["items"] = o.pop("order_items", [])
            orders.append(o)
        return orders

    def add_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        order_id = f"K2K-{int(time.time())}"
        record = {
            "id": str(int(time.time())),
            "order_id": order_id,
            "customer_id": order_data.get("customerId"),
            "farmer_id": order_data.get("farmerId"),
            "crop_name": order_data.get("cropName"),
            "quantity": order_data.get("quantity"),
            "total_amount": order_data.get("totalAmount"),
            "subtotal": order_data.get("subtotal"),
            "delivery_fee": order_data.get("delivery"),
            "status": "PENDING",
            "payment_method": order_data.get("paymentMethod"),
            "buyer": order_data.get("buyer"),
            "delivery_address": order_data.get("deliveryAddress")
        }
        res = self.supabase.table("orders").insert(record).execute()
        
        for item in order_data.get("items", []):
            self.supabase.table("order_items").insert({
                "order_ref": record["id"],
                "listing_id": item.get("listingId"),
                "crop_name": item.get("cropName"),
                "quantity": item.get("quantity"),
                "price_per_kg": item.get("pricePerKg")
            }).execute()
            
        return record

    def update_order_status(self, order_id: str, status: str) -> Optional[Dict[str, Any]]:
        res = self.supabase.table("orders").update({"status": status}).eq("order_id", order_id).execute()
        return res.data[0] if res.data else None

    # ------------------ INVENTORY ------------------
    def get_inventory_batches(self, crop: Optional[str] = None, hub_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        query = self.supabase.table("inventory_batches").select("*")
        if crop: query = query.eq("crop_name", crop)
        if hub_id: query = query.eq("hub_id", hub_id)
        if status: query = query.eq("status", status)
        res = query.execute()
        return res.data

    def get_inventory_summary(self) -> Dict[str, Any]:
        res = self.supabase.table("inventory_batches").select("*").execute()
        return {"totalBatches": len(res.data), "data": res.data}

    def get_inventory_ledger(self) -> List[Dict[str, Any]]:
        return self.supabase.table("inventory_movements").select("*").execute().data

    def record_wastage(self, batch_id: str, crop_name: str, wastage_kg: float, reason: str, actor: str = "Store Manager") -> Dict[str, Any]:
        # Dummy implementation for now to satisfy router
        return {"status": "recorded"}

    # ------------------ HUBS ------------------
    def get_hubs(self) -> List[Dict[str, Any]]:
        return self.supabase.table("hubs").select("*").execute().data

    def auto_select_hub(self, customer_address: str, coordinates: Optional[List[float]], items: List[Dict[str, Any]]) -> Dict[str, Any]:
        hubs = self.get_hubs()
        return {"hubId": hubs[0]["id"] if hubs else "HUB-1"}

    def get_hub_workload(self, hub_id: str) -> Dict[str, Any]:
        return {"hubId": hub_id, "tasks": []}

    def receive_incoming_stock(self, shipment_id: str, expected_kg: float, actual_kg: float, accepted_kg: float, rejected_kg: float, grade: str, freshness: str, damage_pct: float, temperature: str, decision: str, actor: str) -> Dict[str, Any]:
        return {"status": "received"}

    # ------------------ PICKING & DRIVERS ------------------
    def update_pick_pack(self, pick_task_id: str, order_id: str, stage: str, notes: str = "", actor: str = "Store Worker") -> Optional[Dict[str, Any]]:
        return {"status": "updated"}

    def get_driver_tasks(self, driver_id: str) -> List[Dict[str, Any]]:
        return self.supabase.table("driver_deliveries").select("*").eq("driver_id", driver_id).execute().data

    def update_driver_location(self, driver_id: str, lat: float, lng: float, speed_kmh: Optional[float] = None, heading: Optional[float] = None, eta_minutes: Optional[int] = None) -> Dict[str, Any]:
        return {"status": "updated"}

    def update_driver_delivery_status(self, delivery_id: str, status: str, proof_otp: Optional[str] = None, actor: str = "Driver") -> Optional[Dict[str, Any]]:
        return {"status": "updated"}

    # ------------------ ADMIN & STATS ------------------
    def get_admin_overview(self) -> Dict[str, Any]:
        return {"status": "ok"}

    def get_order_trace(self, order_id: str) -> Dict[str, Any]:
        return {"orderId": order_id, "trace": []}

    def get_audit_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self.supabase.table("audit_logs").select("*").limit(limit).execute().data

    def add_audit_log(self, role: str, actor: str, action: str, details: str):
        self.supabase.table("audit_logs").insert({
            "id": f"AUD-{int(time.time())}",
            "role": role,
            "actor": actor,
            "action": action,
            "details": details
        }).execute()

    def get_users_by_role(self, role: Optional[str] = None) -> List[Dict[str, Any]]:
        return self.get_users()

    def get_transporter_tasks(self) -> List[Dict[str, Any]]:
        return self.supabase.table("transporter_tasks").select("*").execute().data

    def update_transporter_task(self, task_id: int, status: str) -> Optional[Dict[str, Any]]:
        return {"status": "updated"}

    def get_hub_shipments(self) -> List[Dict[str, Any]]:
        return self.supabase.table("hub_shipments").select("*").execute().data

    def approve_hub_shipment(self, shipment_id: str) -> Optional[Dict[str, Any]]:
        return {"status": "approved"}

    def seal_hub_batch(self, route: str, description: str) -> Dict[str, Any]:
        return {"status": "sealed"}

    def get_admin_users(self) -> List[Dict[str, Any]]:
        return self.get_users()

    def verify_user(self, user_id: str) -> List[str]:
        return []

    def resolve_dispute(self) -> Dict[str, Any]:
        return {"status": "resolved"}

    def get_platform_stats(self) -> Dict[str, Any]:
        return {
            "totalHarvestSaved": "18,420 t",
            "extraFarmerIncome": "₹12.8 Cr",
            "activeFarmers": "8,642",
            "avgTurnaroundTime": "21 hrs",
            "gmv": "₹4.82 Cr",
            "systemHealth": "99.98%"
        }

    def get_role_permissions(self) -> Dict[str, Any]:
        return {}

    def is_role_allowed(self, role: str) -> bool:
        return True

    def update_role_permission(self, role: str, updates: Dict[str, Any], actor: str = "Admin") -> Optional[Dict[str, Any]]:
        return {"status": "updated"}

    # ------------------ AUTHENTICATION ------------------
    def verify_oauth_login(self, email: str, name: str, google_id: str) -> Dict[str, Any]:
        res = self.supabase.table("profiles").select("*").eq("email", email).execute()
        if res.data:
            return res.data[0]
        else:
            new_user = {
                "id": str(int(time.time())),
                "email": email,
                "full_name": name,
                "role": "CUSTOMER"
            }
            self.supabase.table("profiles").insert(new_user).execute()
            return new_user
