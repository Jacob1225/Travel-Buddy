import pandas as pd
import traceback
from libraries.util import calculate_distance, get_trip_list
from libraries.security import Authenticator
from libraries.stm_api import StmAPi
from libraries.common import VehiclePosition

authenticator = Authenticator()
secrets = authenticator.load_secrets("stm-secret")
stm_api = StmAPi(secrets["api_key"])


"""
    Post request to retrieve active buses within x radius from client
    Requires the current latitude, longitude and radius as input
    Returns schedules of these buses, next stops, occupancy level as dict
"""


def get_vehicles(request):
    # TODO: add token authentication

    payload = request.get_json()

    curr_lat = payload.get("lat")
    curr_lon = payload.get("lon")
    radius = payload.get("radius")

    if not curr_lat or not curr_lon or not radius:
        return ({"message": "missing latitude, longitude, or radius", "data": None}, 400)

    try:
        # load trips.csv from cloud storage
        static_trips = pd.read_csv("gs://travel-buddy/static/trips.csv")

        # fetch vehicle positions from api
        vehicles = stm_api.get_vehicle_positions()
        if not vehicles:
            raise TypeError("Stm api did not fetch any vehicles")

        trips = stm_api.get_trip_updates()
        if not trips:
            raise TypeError("stm api did not fetch any trips")

        # Fetch the trip list
        trips_list = get_trip_list(trips, static_trips)

        response_dict = {}

        # iterate over each vehicle and calculate distance from the client
        for vehicle in vehicles:
            vehicle_lat = vehicle.vehicle.position.latitude
            vehicle_lon = vehicle.vehicle.position.longitude

            if calculate_distance(curr_lat, vehicle_lat, curr_lon, vehicle_lon) <= float(radius):
                # create vehiclePositionDocument
                trip_obj = list(filter(lambda trip: vehicle.vehicle.trip.trip_id == trip.trip_id, trips_list))

                vehicle_obj = VehiclePosition.from_dict(
                    {
                        "vehicle_id": vehicle.id,
                        "trip": trip_obj,
                        "start_time": vehicle.vehicle.trip.start_time,
                        "start_date": vehicle.vehicle.trip.start_date,
                        "route_id": vehicle.vehicle.trip.route_id,
                        "latitude": vehicle.vehicle.position.latitude,
                        "longitude": vehicle.vehicle.position.longitude,
                        "speed": vehicle.vehicle.position.speed,
                        "current_stop_sequence": str(vehicle.vehicle.current_stop_sequence),
                        "current_status": str(vehicle.vehicle.current_status),
                        "occupancy_status": str(vehicle.vehicle.occupancy_status),
                    }
                )
                response_dict[vehicle.id] = vehicle_obj.as_dict()

        return ({"message": "vehicles retrieved", "data": response_dict}, 200)

    # TODO change exception when testing and new exceptions are known
    except Exception as e:
        traceback.print_exc()
        return ({"message": f"Error retriveing vehicles {e}", "data": None}, 500)
