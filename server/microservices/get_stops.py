import pandas as pd
from ..libraries.util import calculate_distance, get_trip_list
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
        return ({"message": "missing latitude, longitude, or radius", "data": None}, 400)

    try:
        # load stops.csv/trips.csv from cloud storage
        static_stops = pd.read_csv("gs://travel-buddy/static/stops.csv")
        static_trips = pd.read_csv("gs://travel-buddy/static/trips.csv")

        # Fetch trip updates
        trips = stm_api.get_trip_updates()
        if trips is None:
            raise TypeError("None was returned from trips fetch")

        trips_list = get_trip_list(trips, static_trips)

        # Find stops that are within clients radius
        response_dict = {}
        for stop in static_stops.itertuples():
            if calculate_distance(curr_lat, stop.stop_lat, curr_lon, stop.stop_lon) <= radius:

                # See if stop_id exists in trip list
                filtered_trips = list(
                    filter(
                        lambda trip: stop.stop_id
                        in [value for elem in trip.stop_sequence for value in elem.as_dict().values()],
                        trips_list,
                    )
                )
                response_dict[stop.stop_id] = filtered_trips

        return ({"message": "stops retrieved", "data": response_dict}, 200)

    # TODO change exception when testing and new exceptions are known
    except Exception as e:
        print(str(e))
        return ({"message": "Error retriveing stops", "data": None}, 500)
