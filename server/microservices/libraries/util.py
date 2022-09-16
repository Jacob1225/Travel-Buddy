from math import sin, cos, sqrt, atan2, radians
from typing import List
from libraries.common import StopSequenceObj, TripDocument, TripsList


"""
    calculates the distance between two coordinates
"""


def calculate_distance(lat1: int, lat2: int, lon1: int, lon2: int) -> int:

    # radius of the earth in km
    R = 6373.0

    # convert latitude and longitude to radians
    r_lat1 = radians(lat1)
    r_lon1 = radians(lon1)
    r_lat2 = radians(lat2)
    r_lon2 = radians(lon2)

    dlon = r_lon2 - r_lon1
    dlat = r_lat2 - r_lat1

    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    distance = R * c

    return distance


"""
    Creates a trip list document
    Useful to retrieve trip information from a trip_id
    Requires the api trip response and static trip dataframe as input
"""


def get_trip_list(trips, static_trips) -> List:
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
        TripsList.from_any(trips_list)  # validate list is properly created

        return trips_list
