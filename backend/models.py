import re
from typing import List, Optional, Tuple, Literal
from pydantic import BaseModel, Field, field_validator

PHONE_REGEX = re.compile(r"^[6-9]\d{9}$")


class SendOtpRequest(BaseModel):
    phone: str = Field(..., description="10-digit Indian mobile number")

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        clean = v.strip()
        if not PHONE_REGEX.match(clean):
            raise ValueError("Must be a valid 10-digit Indian mobile number (starting with 6-9)")
        return clean


class VerifyOtpRequest(BaseModel):
    phone: str = Field(...)
    otp: str = Field(..., min_length=6, max_length=6)

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, v: str) -> str:
        clean = v.strip()
        if not clean.isdigit() or len(clean) != 6:
            raise ValueError("OTP must be exactly 6 digits")
        return clean


class FarmerRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2)
    phone: str = Field(...)
    state: str = Field(..., min_length=2)
    district: str = Field(..., min_length=2)
    village: Optional[str] = ""
    farmArea: float = Field(..., gt=0, description="Farm area must be greater than 0 acres")
    mainCrops: str = Field(..., min_length=2)
    yearsFarming: Optional[int] = Field(0, ge=0)
    coordinates: Optional[Tuple[float, float]] = [17.8714, 78.1108]
    verificationToken: str = Field(..., min_length=10)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        clean = v.strip()
        if not PHONE_REGEX.match(clean):
            raise ValueError("Must be a valid 10-digit Indian mobile number")
        return clean


class CropListingCreate(BaseModel):
    farmerId: str = "FC-TG-184"
    farmerName: str = "Ramesh Naik"
    cropName: str = Field(..., min_length=2)
    variety: str = Field(..., min_length=2)
    category: Literal["Vegetables", "Fruits", "Grains"] = "Vegetables"
    grade: str = "Grade A"
    availableQuantity: int = Field(..., gt=0, description="Quantity must be greater than 0 kg")
    pricePerKg: float = Field(..., gt=0, description="Price per kg must be greater than 0")
    harvestDate: str = "Tomorrow"
    imageUrl: Optional[str] = "/src/assets/okra.jpg"
    location: str = "Medak, Telangana"


class OrderItem(BaseModel):
    listingId: str
    cropName: str
    quantity: int = Field(..., gt=0)
    pricePerKg: float = Field(..., gt=0)


class OrderCreate(BaseModel):
    buyer: str = Field(..., min_length=2)
    deliveryAddress: str = Field(..., min_length=5)
    paymentMethod: Literal["UPI", "COD"] = "UPI"
    items: List[OrderItem] = Field(..., min_length=1)
    subtotal: float = Field(..., ge=0)
    delivery: float = Field(..., ge=0)
    totalAmount: float = Field(..., gt=0)
    farmerId: Optional[str] = "FC-TG-184"


class OrderStatusUpdate(BaseModel):
    status: Literal["PENDING", "FARMER_ACCEPTED", "IN_TRANSIT", "DELIVERED"]


class TransporterTaskUpdate(BaseModel):
    status: Literal["Pending Pickup", "In Transit", "Delivered"]


class BatchCreate(BaseModel):
    route: Optional[str] = "Hyderabad Route · HYD-221"
    description: Optional[str] = "4 farmer lots · 1,280 kg"


class QuickRoleLoginRequest(BaseModel):
    role: Literal["FARMER", "CUSTOMER", "DELIVERY_PARTNER", "STORE_MANAGER", "ADMIN"]


class IncomingReceiveRequest(BaseModel):
    shipmentId: str
    expectedKg: float = Field(..., gt=0)
    actualKg: float = Field(..., gt=0)
    acceptedKg: float = Field(..., ge=0)
    rejectedKg: float = Field(0.0, ge=0)
    grade: Literal["Grade A", "Grade B", "Grade C"] = "Grade A"
    freshness: Literal["Excellent", "Good", "Fair", "Substandard"] = "Good"
    damagePct: float = Field(0.0, ge=0, le=100)
    temperature: str = "18°C"
    decision: Literal["APPROVE", "REJECT", "PARTIAL_ACCEPT"] = "APPROVE"


class OrderPickPackAdvanceRequest(BaseModel):
    pickTaskId: str
    orderId: str
    stage: Literal["START_PICKING", "QUALITY_CHECK", "PACK_ORDER", "READY_FOR_DELIVERY"]
    notes: Optional[str] = ""


class DriverLocationPingRequest(BaseModel):
    driverId: str = "DP-HYD-042"
    lat: float
    lng: float
    speedKmh: Optional[float] = 28.5
    heading: Optional[float] = 142.0
    etaMinutes: Optional[int] = 18


class DriverDeliveryStatusRequest(BaseModel):
    deliveryId: str
    status: Literal["ACCEPTED", "PICKED_UP_FROM_HUB", "OUT_FOR_DELIVERY", "DELIVERED"]
    proofOtp: Optional[str] = None


class WastageRecordRequest(BaseModel):
    batchId: str
    cropName: str
    wastageKg: float = Field(..., gt=0)
    reason: str = Field(..., min_length=3)


class AutoHubSelectRequest(BaseModel):
    customerAddress: str
    coordinates: Optional[Tuple[float, float]] = (17.4325, 78.4073)
    items: List[OrderItem]


class OAuthLoginRequest(BaseModel):
    provider: Literal["google", "agristack", "demo_oauth"] = "google"
    role: Literal["FARMER", "CUSTOMER", "DELIVERY_PARTNER", "STORE_MANAGER", "ADMIN"]
    email: str
    name: str
    avatar: Optional[str] = None
    token: Optional[str] = None


class RolePermissionUpdateRequest(BaseModel):
    enabled: bool
    adminApproved: Optional[bool] = True
    permissions: Optional[List[str]] = None


