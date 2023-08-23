from ast import literal_eval
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

    headers = {"Access-Control-Allow-Origin": "*"}

    try:
        # load stm_lines.csv from cloud storage
        static_lines = pd.read_csv(f"{secrets['gcp_bucket']}stm_lines.csv")
        response_list =[]

        for line in static_lines.itertuples():
            obj = {
                "route_id": line.route_id,
                "headsign": line.headsign,
                "route_name": line.route_name,
                "route_color": line.route_color,
                "sequence": literal_eval(line.sequence)
            }
            response_list.append(obj)

        return ({"message": "stm lines retrieved", "data": response_list}, 200, headers)

    # TODO change exception when testing and new exceptions are known
    except Exception as e:
        traceback.print_exc()
        return ({"message": f"Error retriveing stm lines {e}", "data": None}, 500, headers)
