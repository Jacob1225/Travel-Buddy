import json
from google.cloud import secretmanager


class Authenticator:
    def __init__(self):
        self.project_id = "travel-buddy-362314"

    """
        Method used to load secrets within microservices
        returns a dictionary format for the requested secret
        Ex: {'apiKey': 'xr434sdssx'}
    """

    def load_secrets(self, secret_name):
        secret_client = secretmanager.SecretManagerServiceClient()
        secret_request = {"name": f"projects/{self.project_id}/secrets/{secret_name}/versions/latest"}

        response = secret_client.access_secret_version(secret_request)
        secrets = response.secrets.data.decode("UTF-8")
        secrets_dict = json.loads(secrets)

        return secrets_dict
