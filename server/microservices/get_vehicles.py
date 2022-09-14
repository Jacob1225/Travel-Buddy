from ..libraries.distance import calculate_distance
from ..libraries.stm_api import StmApi
from google.cloud import secretmanager
import pandas as pd
import json

# Load google secrets
secret_client = secretmanager.SecretManagerServiceClient()
secret_request = {"name": f"projects/travel-buddy-362314/secrets/stm-secret/versions/latest"}

response = secret_client.access_secret_version(secret_request)
secrets = response.secrets.data.decode("UTF-8")
secrets_dict = json.loads(secrets)

# initialize the stm api class
stm_api = StmApi(secrets_dict["api_key"])


def get_vehicles(request):

    # TODO: add token authentication

    payload = request.get_json()

    curr_lat = payload.get("lat")
    curr_lon = payload.get("lon")
    radius = payload.get("radius")

    if not curr_lat or not curr_lon or not radius:
        return ("missing latitude, longitude, or radius", 400)

    try:
        # fetch vehicle positions from api
        vehicles = stm_api.get_vehicle_positions()

        # iterate over each vehicle and calculate distance from the client
        for vehicle in vehicles:
            vehicle_lat = vehicle.get("vehicle").get("position").get("latitude")
            vehicle_lon = vehicle.get("vehicle").get("position").get("longitude")

            if calculate_distance(curr_lat, vehicle_lat, curr_lon, vehicle_lon) <= radius:
                print(vehicle)  # for now get all vehicle information

        return ("vehicles retrieved", 200)

    # TODO change exception when testing and new exceptions are known
    except Exception as e:
        print(str(e))
        return ("Error retriveing vehicles", 500)
