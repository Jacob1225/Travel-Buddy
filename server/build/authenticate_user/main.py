import sys
from os import path
from libraries.security import Authenticator
from werkzeug.exceptions import BadRequest

sys.path.append(path.join(path.dirname(__file__), "."))

"""
    This microservice validates the identity of the user
    based on their google one tap credentials.
    Returns an encoded Jwt token and signature to the client.
"""
authenticator = Authenticator()


def authenticate_user(request):
    try:
        print("executing")
        payload = request.get_json()

        if "token" not in payload:
            raise BadRequest(description="No token provided in payload")

        credentials = authenticator.validate_google_credentials(payload["token"])
        return ({"message": "User authentication successful", "token": credentials}, 200)

    except Exception as e:
        print("unknown exception raised: ", e)
        raise Exception("User authentication failed")
