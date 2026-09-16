import json
import os
import time
import random
from typing import Dict, Any, List, Optional

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_FILE = os.path.join(DATA_DIR, "db.json")


def get_default_data() -> Dict[str, Any]:
    return {
        "farmers": [
            {
                "id": "f-1",
                "farmerId": "FC-TG-184",
                "name": "Ramesh Naik",
                "phone": "9876543210",
                "state": "Telangana",
                "district": "Medak",
                "village": "Narsapur",
                "farmArea": 4.5,
                "mainCrops": "Tomatoes, Okra",
                "yearsFarming": 12,
                "coordinates": [17.8714, 78.1108],
                "verified": True,
                "createdAt": "2026-09-16T12:00:00.000Z",
            },
            {
                "id": "f-2",
                "farmerId": "FC-MH-092",
                "name": "Sunita Patil",
                "phone": "9822012345",
                "state": "Maharashtra",
                "district": "Ratnagiri",
                "village": "Guhagar",
                "farmArea": 6.0,
                "mainCrops": "Alphonso Mango",
                "yearsFarming": 15,
                "coordinates": [16.9902, 73.3120],
                "verified": True,
                "createdAt": "2026-09-16T12:00:00.000Z",
            },
        ],
        "listings": [
            {
                "id": "1",
                "listingId": "LST-2041",
                "farmerId": "FC-TG-184",
                "farmerName": "Ramesh Naik",
                "cropName": "Tomatoes",
                "variety": "Arka Rakshak",
                "category": "Vegetables",
                "grade": "Grade A",
                "availableQuantity": 620,
                "pricePerKg": 32,
                "harvestDate": "Today",
                "imageUrl": "/src/assets/tomatoes.jpg",
                "location": "Medak, Telangana",
                "createdAt": "2026-09-16T12:00:00.000Z",
            },
            {
                "id": "2",
                "listingId": "LST-2042",
                "farmerId": "FC-MH-092",
                "farmerName": "Sunita Patil",
                "cropName": "Alphonso Mango",
                "variety": "Ratnagiri",
                "category": "Fruits",
                "grade": "Organic",
                "availableQuantity": 380,
                "pricePerKg": 145,
                "harvestDate": "Tomorrow",
                "imageUrl": "/src/assets/mangoes.jpg",
                "location": "Ratnagiri, Maharashtra",
                "createdAt": "2026-09-16T12:00:00.000Z",
            },
            {
                "id": "3",
                "listingId": "LST-2043",
                "farmerId": "FC-KA-311",
                "farmerName": "Mahesh Gowda",
                "cropName": "Fresh Okra",
                "variety": "Parbhani Kranti",
                "category": "Vegetables",
                "grade": "Organic",
                "availableQuantity": 240,
                "pricePerKg": 48,
                "harvestDate": "Today",
                "imageUrl": "/src/assets/okra.jpg",
                "location": "Mysuru, Karnataka",
                "createdAt": "2026-09-16T12:00:00.000Z",
            },
            {
                "id": "4",
                "listingId": "LST-2044",
                "farmerId": "FC-PB-228",
                "farmerName": "Gurpreet Singh",
                "cropName": "Basmati Rice",
                "variety": "Pusa 1121",
                "category": "Grains",
                "grade": "Grade A",
                "availableQuantity": 1800,
                "pricePerKg": 76,
                "harvestDate": "Sep 12",
                "imageUrl": "/src/assets/rice.jpg",
                "location": "Patiala, Punjab",
                "createdAt": "2026-09-16T12:00:00.000Z",
            },
        ],
        "orders": [
            {
                "id": "1",
                "orderId": "K2K-84321",
                "customerId": "C-009",
                "farmerId": "FC-TG-184",
                "cropName": "Tomatoes",
                "quantity": 120,
                "totalAmount": 3840,
                "subtotal": 3840,
                "delivery": 0,
                "status": "PENDING",
                "paymentMethod": "UPI",
                "buyer": "Fresh Basket Café",
                "deliveryAddress": "Shop 12, Jubilee Hills, Hyderabad",
                "items": [
                    {
                        "listingId": "1",
                        "cropName": "Tomatoes",
                        "quantity": 120,
                        "pricePerKg": 32,
                    }
                ],
                "createdAt": "2026-09-16T12:00:00.000Z",
            },
            {
                "id": "2",
                "orderId": "K2K-84318",
                "customerId": "C-102",
                "farmerId": "FC-TG-184",
                "cropName": "Fresh Okra",
                "quantity": 80,
                "totalAmount": 3840,
                "subtotal": 3840,
                "delivery": 0,
                "status": "FARMER_ACCEPTED",
                "paymentMethod": "UPI",
                "buyer": "Aahar Kitchens",
                "deliveryAddress": "Plot 45, Gachibowli, Hyderabad",
                "items": [
                    {
                        "listingId": "3",
                        "cropName": "Fresh Okra",
                        "quantity": 80,
                        "pricePerKg": 48,
                    }
                ],
                "createdAt": "2026-09-16T12:00:00.000Z",
            },
            {
                "id": "3",
                "orderId": "K2K-84296",
                "customerId": "C-047",
                "farmerId": "FC-MH-092",
                "cropName": "Alphonso Mango",
                "quantity": 40,
                "totalAmount": 5800,
                "subtotal": 5800,
                "delivery": 0,
                "status": "DELIVERED",
                "paymentMethod": "COD",
                "buyer": "Green Grocers",
                "deliveryAddress": "MG Road, Pune, Maharashtra",
                "items": [
                    {
                        "listingId": "2",
                        "cropName": "Alphonso Mango",
                        "quantity": 40,
                        "pricePerKg": 145,
                    }
                ],
                "createdAt": "2026-09-16T12:00:00.000Z",
            },
        ],
        "transporterTasks": [
            {
                "id": 1,
                "status": "Pending Pickup",
                "crop": "Tomatoes",
                "quantity": "120 kg",
                "from": "Ramesh Farm, Medak",
                "to": "Banjara Hills Hub",
                "distance": "42 km",
            },
            {
                "id": 2,
                "status": "In Transit",
                "crop": "Basmati Rice",
                "quantity": "640 kg",
                "from": "Patiala Hub",
                "to": "Fresh Cart, Ludhiana",
                "distance": "91 km",
            },
            {
                "id": 3,
                "status": "Delivered",
                "crop": "Fresh Okra",
                "quantity": "80 kg",
                "from": "Mysuru Hub",
                "to": "Aahar Kitchens",
                "distance": "34 km",
            },
        ],
        "hubShipments": [
            {
                "id": "SHP-0192",
                "farmer": "Ramesh Naik",
                "crop": "Tomatoes",
                "qty": "620 kg",
                "eta": "10:20 AM",
                "gradeStatus": "PENDING",
            },
            {
                "id": "SHP-0194",
                "farmer": "Anita Reddy",
                "crop": "Onions",
                "qty": "410 kg",
                "eta": "11:05 AM",
                "gradeStatus": "PENDING",
            },
            {
                "id": "SHP-0198",
                "farmer": "Mahesh Gowda",
                "crop": "Fresh Okra",
                "qty": "240 kg",
                "eta": "12:30 PM",
                "gradeStatus": "PENDING",
            },
        ],
        "hubBatches": [],
        "verifiedUsers": ["F-184", "B-077"],
        "disputesResolved": False,
        "platformStats": {
            "totalHarvestSaved": "18,420 t",
            "extraFarmerIncome": "₹12.8 Cr",
            "activeFarmers": "8,642",
            "avgTurnaroundTime": "21 hrs",
            "gmv": "₹4.82 Cr",
            "systemHealth": "99.98%",
        },
    }


class Database:
    def __init__(self):
        self.data = self._load()

    def _load(self) -> Dict[str, Any]:
        os.makedirs(DATA_DIR, exist_ok=True)
        if os.path.exists(DB_FILE):
            try:
                with open(DB_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Failed to read db.json: {e}")
        default_d = get_default_data()
        self._save(default_d)
        return default_d

    def _save(self, data: Optional[Dict[str, Any]] = None):
        if data is None:
            data = self.data
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    # Farmers
    def get_farmers(self) -> List[Dict[str, Any]]:
        return self.data.get("farmers", [])

    def add_farmer(self, farmer_data: Dict[str, Any]) -> Dict[str, Any]:
        farmers = self.data.setdefault("farmers", [])
        state_code = farmer_data["state"][:2].upper()
        dist_code = farmer_data["district"][:3].upper()
        num = str(len(farmers) + 185).zfill(6)
        farmer_id = f"FC-{state_code}-{dist_code}-26-{num}"

        record = {
            **farmer_data,
            "id": f"f-{int(time.time() * 1000)}",
            "farmerId": farmer_id,
            "verified": True,
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        farmers.insert(0, record)

        # Update active farmers count
        stats = self.data.setdefault("platformStats", {})
        count_str = stats.get("activeFarmers", "8,642").replace(",", "")
        new_count = int(count_str) + 1
        stats["activeFarmers"] = f"{new_count:,}"

        self._save()
        return record

    # Listings
    def get_listings(self) -> List[Dict[str, Any]]:
        return self.data.get("listings", [])

    def add_listing(self, listing_data: Dict[str, Any]) -> Dict[str, Any]:
        listings = self.data.setdefault("listings", [])
        listing_id = f"LST-{2040 + len(listings) + 1}"
        record = {
            **listing_data,
            "id": str(int(time.time() * 1000)),
            "listingId": listing_id,
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        listings.insert(0, record)
        self._save()
        return record

    # Orders
    def get_orders(self) -> List[Dict[str, Any]]:
        return self.data.get("orders", [])

    def add_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        orders = self.data.setdefault("orders", [])
        listings = self.data.setdefault("listings", [])
        tasks = self.data.setdefault("transporterTasks", [])

        # Deduct stock
        for it in order_data.get("items", []):
            for l in listings:
                if l["id"] == it["listingId"]:
                    l["availableQuantity"] = max(0, l["availableQuantity"] - it["quantity"])

        total_qty = sum(it["quantity"] for it in order_data.get("items", []))
        primary_item = order_data["items"][0] if order_data.get("items") else None
        crop_title = (
            f"{primary_item['cropName']} +{len(order_data['items']) - 1}"
            if len(order_data.get("items", [])) > 1
            else (primary_item["cropName"] if primary_item else "Produce")
        )

        record = {
            "id": str(int(time.time() * 1000)),
            "orderId": f"K2K-{random.randint(84000, 84999)}",
            "customerId": f"C-{random.randint(100, 999)}",
            "farmerId": order_data.get("farmerId") or "FC-TG-184",
            "cropName": crop_title,
            "quantity": total_qty,
            "totalAmount": order_data["totalAmount"],
            "subtotal": order_data["subtotal"],
            "delivery": order_data["delivery"],
            "status": "PENDING",
            "paymentMethod": order_data["paymentMethod"],
            "buyer": order_data["buyer"],
            "deliveryAddress": order_data["deliveryAddress"],
            "items": order_data["items"],
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        orders.insert(0, record)

        # Automatically create transporter pickup task
        task_id = len(tasks) + 1
        tasks.insert(
            0,
            {
                "id": task_id,
                "status": "Pending Pickup",
                "crop": record["cropName"],
                "quantity": f"{total_qty} kg",
                "from": "Collection Center, Medak",
                "to": order_data["deliveryAddress"],
                "distance": f"{random.randint(18, 48)} km",
            },
        )

        self._save()
        return record

    def update_order_status(self, order_id: str, status: str) -> Optional[Dict[str, Any]]:
        orders = self.data.setdefault("orders", [])
        for o in orders:
            if o["id"] == order_id:
                o["status"] = status
                self._save()
                return o
        return None

    # Logistics & Hub
    def get_transporter_tasks(self) -> List[Dict[str, Any]]:
        return self.data.get("transporterTasks", [])

    def update_transporter_task(self, task_id: int, status: str) -> Optional[Dict[str, Any]]:
        tasks = self.data.setdefault("transporterTasks", [])
        for t in tasks:
            if t["id"] == task_id:
                t["status"] = status
                self._save()
                return t
        return None

    def get_hub_shipments(self) -> List[Dict[str, Any]]:
        return self.data.get("hubShipments", [])

    def approve_hub_shipment(self, shipment_id: str) -> Optional[Dict[str, Any]]:
        shipments = self.data.setdefault("hubShipments", [])
        for s in shipments:
            if s["id"] == shipment_id:
                s["gradeStatus"] = "GRADE A APPROVED"
                self._save()
                return s
        return None

    def seal_hub_batch(self, route: str, description: str) -> Dict[str, Any]:
        batches = self.data.setdefault("hubBatches", [])
        batch = {
            "id": f"BATCH-{int(time.time() * 1000)}",
            "route": route,
            "description": description,
            "sealedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        batches.append(batch)
        self._save()
        return batch

    # Admin & Platform
    def get_admin_users(self) -> List[Dict[str, Any]]:
        verified = self.data.get("verifiedUsers", [])
        farmers = self.data.get("farmers", [])
        users = [
            {"id": "F-184", "name": "Ramesh Naik", "type": "Farmer", "location": "Medak, TG", "status": "VERIFIED" if "F-184" in verified else "PENDING"},
            {"id": "T-042", "name": "Ravi Kumar", "type": "Transporter", "location": "Hyderabad, TG", "status": "VERIFIED" if "T-042" in verified else "PENDING"},
            {"id": "B-077", "name": "Fresh Basket Café", "type": "Buyer", "location": "Hyderabad, TG", "status": "VERIFIED" if "B-077" in verified else "PENDING"},
        ]
        for f in farmers:
            users.append({
                "id": f["farmerId"],
                "name": f["name"],
                "type": "Farmer",
                "location": f"{f['district']}, {f['state']}",
                "status": "VERIFIED",
            })
        return users

    def verify_user(self, user_id: str) -> List[str]:
        verified = self.data.setdefault("verifiedUsers", [])
        if user_id not in verified:
            verified.append(user_id)
            self._save()
        return verified

    def resolve_dispute(self) -> Dict[str, Any]:
        self.data["disputesResolved"] = True
        self._save()
        return {"resolved": True}

    def get_platform_stats(self) -> Dict[str, Any]:
        return self.data.get("platformStats", {})


db = Database()
