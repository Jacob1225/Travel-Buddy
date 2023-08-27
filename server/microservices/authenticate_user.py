import sys
from os import path
from libraries.security import Authenticator

sys.path.append(path.join(path.dirname(__file__), "."))

"""
    This microservice validates the identity of the user
    based on their google one tap credentials.
    Returns an encoded Jwt token and signature to the client.
"""
authenticator = Authenticator()


def authenticate_user(request):
    print(request.headers)
    try:
        credentials = authenticator.validate_google_credentials(request.headers["Authorization"])
        return ({"message": "User authentication successful", "token": credentials}, 200)

    except ValueError:
        raise ValueError

    except Exception as e:
        print(e)
        raise Exception("User authentication failed")
