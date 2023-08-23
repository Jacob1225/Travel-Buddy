import pandas as pd
import os 
from ast import literal_eval
import traceback
from libraries.util import calculate_distance
from libraries.security import Authenticator
from libraries.stm_api import StmAPi

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
    if request.method == "OPTIONS":
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }

        return ("", 204, headers)

    payload = request.get_json()
    print('payload', payload)
    headers = {"Access-Control-Allow-Origin": "*"}
    
    try:
        stops = []
        # load stop_schedule.csv as dataframe from cloud storage
        static_stops = pd.read_csv(f"{os.environ['BUCKET']}filtered_stops_2.csv")
        
        for stop in static_stops.itertuples():
            stops.append(
                {
                    "stop_id": stop.stop_id,
                    "stop_name": stop.stop_name,
                    "stop_lat": stop.stop_lat,
                    "stop_lon": stop.stop_lon,
                    "route_id": stop.route_id,
                    "trip_headsign": stop.trip_headsign,
                    "arrival_time": literal_eval(stop.arrival_time),
                    "route_short_name": stop.route_short_name,
                    "route_long_name": stop.route_long_name,
                    "route_type": stop.route_type
                }
            )
        print('reached success')
        return ({"message": "stop schedule retrieved", "data": stops}, 200, headers)

    # TODO change exception when testing and new exceptions are known
    except Exception as e:
        traceback.print_exc()
        print(e)
        return ({"message": f"Error retriveing stops: {e}", "data": None}, 500, headers)
