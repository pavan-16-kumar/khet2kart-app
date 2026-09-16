import time
import random
import secrets
from typing import Dict, Any, Optional
from services.sms_service import send_sms_otp


class OtpService:
    def __init__(self):
        # phone -> {otp, expires_at, attempts, created_at}
        self.otps: Dict[str, Dict[str, Any]] = {}
        # phone -> {token, verified_at, expires_at}
        self.sessions: Dict[str, Dict[str, Any]] = {}

    def generate_otp(self, phone: str) -> Dict[str, Any]:
        now = time.time()
        existing = self.otps.get(phone)

        # Rate limit: 20 seconds between attempts
        if existing and (now - existing["created_at"]) < 20:
            wait_seconds = int(20 - (now - existing["created_at"]))
            raise ValueError(f"Please wait {wait_seconds}s before requesting a new OTP")

        # Generate 6-digit numeric OTP
        otp = str(random.randint(100000, 999999))
        expires_in = 300  # 5 minutes
        expires_at = now + expires_in

        self.otps[phone] = {
            "phone": phone,
            "otp": otp,
            "expires_at": expires_at,
            "attempts": 0,
            "created_at": now,
        }

        # Dispatch real SMS
        send_sms_otp(phone, otp)

        return {
            "success": True,
            "message": f"OTP sent successfully to +91 {phone}",
            "expiresInSeconds": expires_in,
        }

    def verify_otp(self, phone: str, input_otp: str) -> Dict[str, Any]:
        record = self.otps.get(phone)
        now = time.time()

        if not record:
            raise ValueError("No active OTP found for this phone number. Please request a new OTP.")

        if now > record["expires_at"]:
            del self.otps[phone]
            raise ValueError("OTP has expired. Please request a new OTP.")

        if record["attempts"] >= 3:
            del self.otps[phone]
            raise ValueError("Too many failed attempts. Please request a new OTP.")

        if record["otp"] != input_otp.strip():
            record["attempts"] += 1
            remaining = 3 - record["attempts"]
            raise ValueError(f"Invalid OTP. {remaining} attempt{'s' if remaining != 1 else ''} remaining.")

        # Valid OTP! Issue single-use session verification token
        token = f"k2k_vtok_{secrets.token_hex(24)}"
        self.sessions[phone] = {
            "phone": phone,
            "token": token,
            "verified_at": now,
            "expires_at": now + (30 * 60),  # 30 minutes
        }

        # Clean up OTP
        del self.otps[phone]

        return {
            "success": True,
            "verificationToken": token,
            "message": "Phone number verified successfully!",
        }

    def is_token_valid(self, phone: str, token: str) -> bool:
        session = self.sessions.get(phone)
        if not session:
            return False
        if session["token"] != token:
            return False
        if time.time() > session["expires_at"]:
            del self.sessions[phone]
            return False
        return True

    def consume_token(self, phone: str, token: str) -> None:
        if self.is_token_valid(phone, token):
            del self.sessions[phone]


otp_service = OtpService()
