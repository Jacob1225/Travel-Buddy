import pandas as pd
from ..libraries.distance import calculate_distance
from ..libraries.security import Authenticator
from ..libraries.stm_api import StmApi

authenticator = Authenticator()
secrets = authenticator.load_secrets("stm-secret")
stm_api = StmApi(secrets["api_key"])


"""
    Post request to retrieve active buses within x radius from client
    Requires the current latitude, longitude and radius as input
    Returns schedules of these buses, next stops, occupancy level as dict
"""


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
        if vehicles is None:
            raise TypeError("None was returned from vehicles fetched")

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
