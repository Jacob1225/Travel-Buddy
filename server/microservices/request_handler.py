from inspect import trace
import requests
import traceback
import sys
import json
from os import path
from jwt import InvalidSignatureError, ExpiredSignatureError
from werkzeug.exceptions import BadRequest

sys.path.append(path.join(path.dirname(__file__), "."))

from libraries.security import Authenticator

"""
    Request handler is the entry point to all microservices
    This function first validates the google auth credentials
    sent by the client. 
    If credentials are valid, a new encrypted token is generated for the session
    and is used during subsequent http requests to other microservices

    Payload must have target url of cloud function to be called
"""
authenticator = Authenticator()


def request_handler(request):

    if request.method == "OPTIONS":
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": ["GET", "POST"],
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "3600",
        }

        return ("", 204, headers)

    headers = {"Access-Control-Allow-Origin": "*"}

    # cipher = request.data
    payload = request.get_json()

    if not payload:
        raise BadRequest(description="Bad Request: no payload given")

    try:
        # decrypt the payload - UPDATE - Browser encryption is not being decrypted
        # decoded_cipher = authenticator.decrypt_cipher(cipher)
        # payload = json.loads(decoded_cipher)

        # validate that the url is in the payload
        if "target_url" not in payload:
            raise BadRequest(description="microservice target url not specified")

        target_url = payload["target_url"]
        target_name = payload["target_name"]
        payload.pop("target_url")
        payload.pop("target_name")

        # validate user credentials
        new_jwt = None
        if target_name != "authenticate_user":
            # authenticator.validate_google_credentials(request.headers["Authorization"])
            # google credentials valid and jwt is being used
            new_jwt = authenticator.validate_token(request.headers["Authorization"])

        res = requests.post(url=target_url, json=payload, headers=request.headers)
        response = res.json()
        if new_jwt:
            response["new_token"] = new_jwt

        return (response, 200, headers)

    except BadRequest as e:
        print("bad request error ", e)
        return ({"message": f"Bad Request: {e}"}, 400, headers)

    except ValueError as e:
        # If thrown google token invalid
        if e == "improper encryption":
            return ({"message": "payload is improperly encrypted"}, 400, headers)
        else:
            return ({"message": "Invalid or Expired Google Credentials"}, 403, headers)

    except InvalidSignatureError:
        return ({"message": "jwt signature invalid:"}, 403, headers)

    except Exception as e:
        print("exception ", e)
        print(e)
        print(traceback.print_exc())
        return ({"message": str(e)}, 500, headers)
