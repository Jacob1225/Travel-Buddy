import json, os
from google.cloud import secretmanager


class Authenticator:
    def __init__(self):
        if 'GCP_PROJECT' in os.environ:
            self.project_id = os.environ['GCP_PROJECT']
        
        #else cloud function is running locally 
        else:
            with open(os.path.abspath('credentials.json'), 'r') as fp:
                credentials = json.load(fp)
                self.project_id = credentials['project_id']
        
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
