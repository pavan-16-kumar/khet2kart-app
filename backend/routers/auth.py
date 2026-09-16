from fastapi import APIRouter, HTTPException, status
from models import SendOtpRequest, VerifyOtpRequest, FarmerRegisterRequest
from services.otp_service import otp_service
from database import db

router = APIRouter(tags=["Auth & Farmers"])


@router.post("/send-otp")
def send_otp(payload: SendOtpRequest):
    """
    POST /api/auth/send-otp
    Generates and sends OTP to Indian 10-digit mobile number via real SMS
    """
    try:
        result = otp_service.generate_otp(payload.phone)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS if "wait" in str(e).lower() else status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to dispatch SMS: {str(e)}",
        )


@router.post("/verify-otp")
def verify_otp(payload: VerifyOtpRequest):
    """
    POST /api/auth/verify-otp
    Validates 6-digit OTP and issues a single-use verification session token
    """
    try:
        result = otp_service.verify_otp(payload.phone, payload.otp)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/register")
def register_farmer(payload: FarmerRegisterRequest):
    """
    POST /api/farmers/register (or /api/auth/register)
    Completes verified farmer onboarding with full profile and GPS location
    """
    token_valid = otp_service.is_token_valid(payload.phone, payload.verificationToken)
    if not token_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Phone verification expired or invalid. Please verify phone number with OTP first.",
        )

    farmer = db.add_farmer({
        "name": payload.name,
        "phone": payload.phone,
        "state": payload.state,
        "district": payload.district,
        "village": payload.village or "",
        "farmArea": payload.farmArea,
        "mainCrops": payload.mainCrops,
        "yearsFarming": payload.yearsFarming or 0,
        "coordinates": payload.coordinates or [17.8714, 78.1108],
    })

    # Invalidate token to prevent replay attacks
    otp_service.consume_token(payload.phone, payload.verificationToken)

    return {
        "success": True,
        "message": "Farmer registered successfully",
        "farmer": farmer,
    }


@router.get("")
@router.get("/")
def get_farmers():
    """
    GET /api/farmers
    Returns all registered farmers
    """
    return {
        "success": True,
        "farmers": db.get_farmers(),
    }
