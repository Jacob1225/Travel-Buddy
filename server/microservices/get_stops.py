import pandas as pd
import traceback
from libraries.util import calculate_distance, get_trip_list
from libraries.security import Authenticator
from libraries.stm_api import StmAPi

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
    print('starting...')
    payload = request.get_json()

    try:
        stops = []
        # load stop_schedule.csv as dataframe from cloud storage
        static_stops = pd.read_csv("gs://travel-buddy/static/filtered_stops_1.csv")

        for stop in static_stops.itertuples():
            stops.append(
                {
                    "stop_id": stop.stop_id,
                    "route_id": stop.route_id,
                    "trip_headsign": stop.trip_headsign,
                    "arrival_time": stop.arrival_time,
                    "route_short_name": stop.route_short_name,
                    "route_long_name": stop.route_long_name,
                    "route_type": stop.route_type
                }
            )
        
        return ({"message": "stop schedule retrieved", "data": stops}, 200)

    # TODO change exception when testing and new exceptions are known
    except Exception as e:
        traceback.print_exc()
        print(e)
        return ({"message": f"Error retriveing stops: {e}", "data": None}, 500)
