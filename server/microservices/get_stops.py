import pandas as pd
from ..libraries.distance import calculate_distance
from ..libraries.security import Authenticator
from ..libraries.stm_api import StmAPi

DEFAULT_RADIUS = 2
authenticator = Authenticator()
secrets = authenticator.load_secrets("stm-secret")
stm_api = StmAPi(secrets["api_key"])

"""
    Post request to retrieve stops within x radius from client
    Requires the current latitude, longitude and radius as input
    Returns stop name, and trip schedules about stops within radius as dict
"""


def get_stops(request):

    # TODO: add token authentication

    payload = request.get_json()

    curr_lat = payload.get("lat")
    curr_lon = payload.get("lon")
    radius = payload.get("radius")

    if not curr_lat or not curr_lon or not radius:
        return ("missing latitude, longitude, or radius", 400)

    try:
        # load stops.csv from cloud storage
        stops = pd.read_csv("gs://travel-buddy/static.stops.csv")

        # Fetch trip updates
        trips = stm_api.get_trip_updates()
        if trips is None:
            raise TypeError("None was returned from trips fetch")

        for stop in stops.itertuples():
            if calculate_distance(curr_lat, stop.stop_lat, curr_lon, stop.stop_lon) <= radius:
                print(stop)  # for now get stop information

        return ("stops retrieved", 200)

    # TODO change exception when testing and new exceptions are known
    except Exception as e:
        print(str(e))
        return ("Error retriveing stops", 500)
