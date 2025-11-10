#!/usr/bin/env python3

import json
import base64

def test_jwt_decode():
    # Test with a properly formatted JWT token (header.payload.signature)
    # This is a sample JWT token with a simple payload
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().rstrip('=')
    payload = base64.urlsafe_b64encode(json.dumps({"sub": "test-user", "iat": 1234567890}).encode()).decode().rstrip('=')
    signature = "fake-signature"
    fake_token = f"{header}.{payload}.{signature}"
    
    print(f"Testing JWT decode with token: {fake_token}")
    
    try:
        # Split the JWT token into its parts
        parts = fake_token.split('.')
        print(f"Token parts: {parts}")
        print(f"Number of parts: {len(parts)}")
        
        if len(parts) != 3:
            print("❌ Invalid JWT format - not 3 parts")
            return
        
        # Decode the payload (second part)
        payload_part = parts[1]
        print(f"Payload part: {payload_part}")
        
        # Add padding if needed for base64 decoding
        payload_part += '=' * (4 - len(payload_part) % 4)
        print(f"Payload part with padding: {payload_part}")
        
        # Decode base64 and parse JSON
        payload_bytes = base64.urlsafe_b64decode(payload_part)
        print(f"Decoded bytes: {payload_bytes}")
        
        payload = json.loads(payload_bytes.decode('utf-8'))
        print(f"✅ Decoded payload: {payload}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"Error type: {type(e)}")

if __name__ == "__main__":
    test_jwt_decode()
