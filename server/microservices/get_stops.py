import pandas as pd
from ..libraries.distance import calculate_distance
from ..libraries.security import Authenticator
from ..libraries.stm_api import StmAPi
from ..libraries.common import StopSequenceObj, TripDocument, TripsList

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

        # process the feed
        for entity in trips:
            stop_list = []
            trips_list = []

            for stop in trips.trip_update.stop_time_update:

                # create the stop sequence object
                stop_obj = StopSequenceObj.from_dict(
                    {
                        "stop_sequence_id": stop.stop_sequence,
                        "stop_id": stop.stop_id,
                        "schedule_relationship": stop.schedule_relationship,
                        "departure_time": stop.departure.time,
                        "arrival_time": stop.arrival.time,
                    }
                )
                stop_list.append(stop_obj)

            # create the trip obj
            trip_obj = TripDocument.from_dict(
                {
                    "trip_id": entity.trip_update.trip.trip_id,
                    "route_id": entity.trip_update.trip.route_id,
                    "schedule_relationship": entity.trip_update.trip.schedule_relationship,
                    "start_date": entity.trip_update.trip.start_date,
                    "stop_sequence": stop_list,
                }
            )
            trips_list.append(trip_obj)

        TripsList.from_any(trips_list)

        # Find stops that are within clients radius
        for stop in stops.itertuples():
            if calculate_distance(curr_lat, stop.stop_lat, curr_lon, stop.stop_lon) <= radius:
                print(stop)  # for now get stop information

        return ("stops retrieved", 200)

    # TODO change exception when testing and new exceptions are known
    except Exception as e:
        print(str(e))
        return ("Error retriveing stops", 500)
