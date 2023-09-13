import pandas as pd
from ast import literal_eval
from os import path
import sys

sys.path.append(path.join(path.dirname(__file__), "."))

import traceback
from libraries.security import Authenticator
from libraries.stm_api import StmAPi

authenticator = Authenticator()
secrets = authenticator.load_secrets("stm-secret")


"""
    Post request to retrieve stop arrival time schedules.
    Main purpose is to reduce the response size when retrieving
    stop information.
"""


def get_arrival_times(request):
    try:
        times = []
        # load stop_schedule.csv as dataframe from cloud storage
        static_stops = pd.read_csv(f"{secrets['gcp_bucket']}filtered_stops_2.csv")

        for stop in static_stops.itertuples():
            # Match schedule by stop_id to be filter on the client side
            schedule = literal_eval(stop.arrival_time)
            list_schedule = list(set(schedule))
            times.append({"stop_id": stop.stop_id, "arrival_time": list_schedule})
        return {"message": "arrival times retrieved", "data": times}

    except Exception as e:
        traceback.print_exc()
        print(e)
        raise Exception("Error retrieving arrival times")
