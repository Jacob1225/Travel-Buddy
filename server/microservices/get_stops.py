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
        return ({"message": "missing latitude, longitude, or radius", "data": None}, 400)

    try:
        # load stops.csv/trips.csv from cloud storage
        static_stops = pd.read_csv("gs://travel-buddy/static/stops.csv")
        static_trips = pd.read_csv("gs://travel-buddy/static/trips.csv")

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
            trip_headsign = static_trips[static_trips["trip_id"] == entity.trip_update.trip.trip_id].values
            if len(trip_headsign == 0):
                trip_headsign = ""
            else:
                trip_headsign = trip_headsign[0][3]

            trip_obj = TripDocument.from_dict(
                {
                    "trip_id": entity.trip_update.trip.trip_id,
                    "route_id": entity.trip_update.trip.route_id,
                    "trip_headsign": trip_headsign,
                    "schedule_relationship": entity.trip_update.trip.schedule_relationship,
                    "start_date": entity.trip_update.trip.start_date,
                    "stop_sequence": stop_list,
                }
            )
            trips_list.append(trip_obj)

        TripsList.from_any(trips_list)

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
