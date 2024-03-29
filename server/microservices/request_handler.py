import traceback
import sys
import os
from os import path
from dotenv import load_dotenv
from jwt import InvalidSignatureError
from werkzeug.exceptions import BadRequest

sys.path.append(path.join(path.dirname(__file__), "."))

from libraries.security import Authenticator
from libraries.util import make_authorized_request

"""
    Request handler is the entry point to all microservices
    This function first validates the google auth credentials
    sent by the client. 
    If credentials are valid, a new encrypted token is generated for the session
    and is used during subsequent http requests to other microservices

    Payload must have target url of cloud function to be called
"""
authenticator = Authenticator()

# For local testing only - must be changed for each developers local path to .env
load_dotenv(dotenv_path="/Users/jacobcarlone/Travel-Buddy/server/microservices/environments/.env")


def request_handler(request):
    allowed_origins = None

    if "GCP_PROJECT" in os.environ:
        # Production env
        allowed_origins = os.environ["PROD_ORIGIN"]
    else:
        allowed_origins = os.getenv("DEV_ORIGIN")

    if request.method == "OPTIONS":
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            "Access-Control-Allow-Origin": allowed_origins,
            "Access-Control-Allow-Methods": ["GET", "POST"],
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "3600",
        }

        return ("", 204, headers)

    headers = {"Access-Control-Allow-Origin": allowed_origins}

    # cipher = request.data
    payload = request.get_json()
    print("PAYLOAD: ", payload)

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

        else:
            payload["token"] = request.headers["Authorization"]

        res = make_authorized_request(target_url, payload)

        if res:
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
            return ({"message": str(e)}, 403, headers)

    except InvalidSignatureError:
        return ({"message": "jwt signature invalid:"}, 403, headers)

    except Exception as e:
        print("exception ", e)
        print(e)
        print(traceback.print_exc())
        return ({"message": str(e)}, 500, headers)
