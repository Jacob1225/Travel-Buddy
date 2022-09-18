import json, os, base64
from google.cloud import secretmanager
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.serialization import load_pem_private_key


class Authenticator:
    def __init__(self):
        self.project_id = os.environ["GCP_PROJECT"]

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


    #load_pem_private_key(str.encode(private_key), password=None)
    """
        Method used to sign messages from the microservices
        returns the signature or None if error during signing
    """
    def sign(self, message):
        try:
            if isinstance(message, dict):
                message = json.dumps(message)
            elif isinstance(message, str):
                raise Exception("must be dict not str")

            signature = self.private_key.sign(
                message.encode("utf-8"),
                padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
                hashes.SHA256(),
            )
            return signature

        except Exception as e:
            print(str(e))
            return None

    """
        Method to decrypt the payload sent by the client
        Returns 
    """
    def decrypt(self, ciphertext, payload_type=None):
        try:
            load_cipher = json.loads(ciphertext)
            plaintext = ""

            if load_cipher and isinstance(load_cipher, list):

                for cipher_chunk in load_cipher:
                    if isinstance(cipher_chunk, str):
                        encoded_chunk = base64.b64decode(cipher_chunk)
                    elif isinstance(cipher_chunk, bytes):
                        encoded_chunk = cipher_chunk
                    else:
                        raise Exception("not string or bytes")

                    decrypted_cypher = self.private_key.decrypt(
                        encoded_chunk,
                        padding.OAEP(
                            mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None
                        ),
                    ).decode()
                    plaintext += decrypted_cypher

            else:
                if isinstance(ciphertext, str):
                    ciphertext_encoded = base64.b64decode(ciphertext)
                elif isinstance(ciphertext, bytes):
                    ciphertext_encoded = ciphertext
                else:
                    raise Exception("not string or bytes")

                plaintext = self.private_key.decrypt(
                    ciphertext_encoded,
                    padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None),
                ).decode()

            return plaintext if payload_type != "json" else json.loads(plaintext)

        except Exception:
            print(str(e))
            return None
    
    """
        Method that validates the serial sent in the Authorization header
        Seperate method for validation, due to more complex validation logic 
        can be added here in future iterations
    """
    def validate_serial(self, serial, secret_serial):
        return serial == secret_serial

