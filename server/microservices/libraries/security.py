import json, os
import jwt
from dotenv import load_dotenv
from jwt import InvalidSignatureError, ExpiredSignatureError
from google.oauth2 import id_token
from google.auth.transport import requests
from google.cloud import secretmanager
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding

# For local testing only - must be changed for each developers local path to .env
load_dotenv(dotenv_path="/Users/jacobcarlone/Travel-Buddy/server/microservices/environments/.env")


class Authenticator:
    def __init__(self):
        if "GCP_PROJECT" in os.environ:
            self.project_id = os.environ["GCP_PROJECT"]
            self.allowed_user = os.environ["ALLOWED_USERS"]
            self.pk_pwd = os.environ["PRIVATE_KEY_PWD"]
            self.client_id = os.environ["CLIENT_ID"]

        # else cloud function is running locally
        else:
            self.allowed_user = os.getenv("ALLOWED_USERS")
            self.pk_pwd = os.getenv("PRIVATE_KEY_PWD")
            self.client_id = os.getenv("CLIENT_ID")

            with open(os.path.abspath("credentials.json"), "r") as fp:
                credentials = json.load(fp)
                self.project_id = credentials["project_id"]

        self.keys = self.load_keys()

    """
        Method used to load secrets within microservices
        returns a dictionary format for the requested secret
        Ex: {'apiKey': 'xr434sdssx'}
    """

    def load_secrets(self, secret_name):
        secret_client = secretmanager.SecretManagerServiceClient()
        secret_request = {"name": f"projects/{self.project_id}/secrets/{secret_name}/versions/latest"}

        response = secret_client.access_secret_version(secret_request)
        secrets = response.payload.data.decode("UTF-8")
        secrets_dict = json.loads(secrets)

        return secrets_dict

    """
        Method used to decrypt ciphertext that was sent 
        by the client and encrypted.
    """

    def decrypt_cipher(self, cipher):
        try:
            payload = self.keys["loaded_pk"].decrypt(
                cipher, padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None)
            )
            return payload.decode("utf-8")
        except Exception as e:
            print(e)
            raise Exception("cipher could not be decrypted")

    """
        Method that loads the private key from its secret
        and returns a dict with the private key in 
        pem and loaded format.
    """

    def load_keys(self):
        try:
            # load private key & public keys in pem format
            secret_keys = self.load_secrets("travel-buddy-private-key")
            pem_pk = secret_keys["private_key"]
            pem_pub = secret_keys["public_key"]
            loaded_pk = serialization.load_pem_private_key(
                str.encode(pem_pk), password=str.encode(self.pk_pwd), backend=default_backend()
            )
            loaded_pub = serialization.load_pem_public_key(str.encode(pem_pub))
            return {"pem_pk": pem_pk, "loaded_pk": loaded_pk, "loaded_pub": loaded_pub}

        except Exception as e:
            print(" ExCEPTION", e)
            raise Exception("error loading private key")

    """
        Method that signs a payload 
    """

    def sign_payload(self, payload):
        try:
            signature = self.keys["loaded_pk"].sign(
                str.encode(payload),
                padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
                hashes.SHA256(),
            )
            return signature

        except Exception as e:
            raise Exception("payload could not be signed")

    """
        Method that validates if the google login credentials 
        are valid and returns a sign & encoded jwt token to the client
        that is to be used in future requests
    """

    def validate_google_credentials(self, token):
        try:
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), self.client_id)

            # ID token is valid - check if user is allowed to sign in
            # Only allow test users to sign in
            if idinfo["email"] != self.allowed_user:
                raise ValueError("Google user has insufficient access")

            encoded_jwt = jwt.encode(
                {
                    "userid": idinfo["sub"],
                    "email": idinfo["email"],
                    "exp": idinfo["exp"],
                },
                self.keys["loaded_pk"],
                algorithm="RS256",
            )

            # sign encoded jwt token
            # signed_jwt = self.sign_payload(encoded_jwt)
            # return {"jwt": encoded_jwt, "signed_jwt": signed_jwt}
            return encoded_jwt

        except ValueError as e:
            # Invalid token or User is not test user
            raise ValueError(e)

        except Exception as e:
            # Other unknown exceptions to be caught/raised
            raise Exception(e)

    def validate_token(self, jwt_token):
        try:
            jwt.decode(jwt_token, self.keys["loaded_pub"], algorithms=["RS256"])

        except InvalidSignatureError:
            raise InvalidSignatureError

        except ExpiredSignatureError:
            raise ExpiredSignatureError

        except Exception as e:
            print("Unknown Token Exception caught: ", e)
            raise Exception("Unknown Token Exception caught: ", e)
