#!/usr/bin/env python3

import jwt
import time
from datetime import datetime, timedelta

# Supabase JWT secret
JWT_SECRET = "9X+DwteUPtQ/zb7564GDDW/2ckm1rULgqxW0Cy6AaUUFhISQvVWFsqwUxls/XwzmkoZcGJRUd58vzFdqt+pIiw=="

# User ID from the logs
USER_ID = "a90f0ea5-ba98-44f5-a3a7-a922db9e1523"

# Create a JWT token similar to what Supabase would create
now = datetime.utcnow()
exp = now + timedelta(hours=1)

payload = {
    "iss": "supabase",
    "ref": "bkaiuwzwepdxdwhznwbt",
    "role": "authenticated",
    "iat": int(now.timestamp()),
    "exp": int(exp.timestamp()),
    "sub": USER_ID,
    "aud": "authenticated",
    "email": "ptroupgalligan@gmail.com"
}

# Generate the token
token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
print(f"Generated JWT token: {token}")
