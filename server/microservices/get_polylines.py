from ast import literal_eval
from os import path
import sys

sys.path.append(path.join(path.dirname(__file__), "."))
import pandas as pd
import traceback
from libraries.security import Authenticator

authenticator = Authenticator()
secrets = authenticator.load_secrets("stm-secret")

"""
    Post request the loads the stm transit lines
    from cloud storage and returns the polylines
    as an array of dict to the client
"""


def get_polylines(request):
    try:
        # load stm_lines.csv from cloud storage
        static_lines = pd.read_csv(f"{secrets['gcp_bucket']}stm_lines.csv")
        response_list = []

        for line in static_lines.itertuples():
            obj = {
                "route_id": line.route_id,
                "headsign": line.headsign,
                "route_name": line.route_name,
                "route_color": line.route_color,
                "sequence": literal_eval(line.sequence),
            }
            response_list.append(obj)

        return {"message": "stm lines retrieved", "data": response_list}

    except Exception as e:
        raise Exception("Error retrieving stm lines")
