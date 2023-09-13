import pandas as pd
from os import path
import sys
from ast import literal_eval

sys.path.append(path.join(path.dirname(__file__), "."))

import traceback
from libraries.security import Authenticator
from libraries.stm_api import StmAPi

authenticator = Authenticator()
secrets = authenticator.load_secrets("stm-secret")

"""
    Post request to retrieve stops within x radius from client
    Requires the current latitude, longitude and radius as input
    Returns stop name, and trip schedules about stops within radius as dict
"""


def get_stops(request):
    try:
        stops = []
        # load stop_schedule.csv as dataframe from cloud storage
        static_stops = pd.read_csv(f"{secrets['gcp_bucket']}filtered_stops_2.csv")

        for stop in static_stops.itertuples():
            times = literal_eval(stop.arrival_time)
            schedule = list(set(times))
            stops.append(
                {
                    "stop_id": stop.stop_id,
                    "stop_name": stop.stop_name,
                    "stop_lat": stop.stop_lat,
                    "stop_lon": stop.stop_lon,
                    "route_id": stop.route_id,
                    "trip_headsign": stop.trip_headsign,
                    "arrival_time": schedule,
                    "route_short_name": stop.route_short_name,
                    "route_long_name": stop.route_long_name,
                    "route_type": stop.route_type,
                }
            )
        return {"message": "stop schedule retrieved", "data": stops}

    except Exception as e:
        traceback.print_exc()
        print(e)
        raise Exception("Error retrieving stops")
