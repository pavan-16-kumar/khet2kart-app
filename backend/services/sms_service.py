import os
import requests
import base64
from typing import Dict, Any


def send_sms_otp(phone: str, otp: str) -> Dict[str, Any]:
    """
    Sends real cellular SMS to an Indian phone number using available SMS gateway.
    Supports Fast2SMS, 2Factor.in, and Twilio.
    """
    fast2sms_key = os.getenv("FAST2SMS_API_KEY")
    twofactor_key = os.getenv("TWOFACTOR_API_KEY")
    twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
    twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_from = os.getenv("TWILIO_PHONE_NUMBER")

    # 1. Fast2SMS (India OTP route)
    if fast2sms_key:
        try:
            url = "https://www.fast2sms.com/dev/bulkV2"
            headers = {
                "authorization": fast2sms_key,
                "Content-Type": "application/json",
            }
            payload = {
                "route": "otp",
                "variables_values": otp,
                "numbers": phone,
            }
            res = requests.post(url, json=payload, headers=headers, timeout=10)
            data = res.json()
            print(f"📡 [SMS GATEWAY] Fast2SMS dispatched to +91-{phone}: {data}")
            return {"sent": True, "provider": "Fast2SMS", "details": data}
        except Exception as e:
            print(f"❌ [SMS GATEWAY] Fast2SMS dispatch failed: {e}")

    # 2. 2Factor.in (India SMS)
    if twofactor_key:
        try:
            url = f"https://2factor.in/v1/API/V1/{twofactor_key}/SMS/+91{phone}/{otp}/Khet2Kart"
            res = requests.get(url, timeout=10)
            data = res.json()
            print(f"📡 [SMS GATEWAY] 2Factor.in dispatched to +91-{phone}: {data}")
            return {"sent": True, "provider": "2Factor.in", "details": data}
        except Exception as e:
            print(f"❌ [SMS GATEWAY] 2Factor.in dispatch failed: {e}")

    # 3. Twilio
    if twilio_sid and twilio_token and twilio_from:
        try:
            auth_str = f"{twilio_sid}:{twilio_token}"
            b64_auth = base64.b64encode(auth_str.encode()).decode()
            url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json"
            headers = {
                "Authorization": f"Basic {b64_auth}",
                "Content-Type": "application/x-www-form-urlencoded",
            }
            payload = {
                "To": f"+91{phone}",
                "From": twilio_from,
                "Body": f"Your Khet2Kart verification code is: {otp}. Valid for 5 minutes. Do not share this OTP.",
            }
            res = requests.post(url, data=payload, headers=headers, timeout=10)
            data = res.json()
            print(f"📡 [SMS GATEWAY] Twilio dispatched to +91-{phone}: {data}")
            return {"sent": True, "provider": "Twilio", "details": data}
        except Exception as e:
            print(f"❌ [SMS GATEWAY] Twilio dispatch failed: {e}")

    # Development terminal log when no SMS API key is configured yet:
    print("\n======================================================")
    print("⚠️  [SMS SERVICE] No external SMS API Key in backend/.env")
    print(f"📲 SMS intended for mobile: +91-{phone}")
    print(f"🔑 Verification OTP Code:   {otp}")
    print("💡 To receive real cellular SMS on your mobile phone, add FAST2SMS_API_KEY in backend/.env")
    print("======================================================\n")

    return {"sent": False}
