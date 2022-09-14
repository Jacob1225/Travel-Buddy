# The purpose of this file is to make requests to the stm api
from google.transit import gtfs_realtime_pb2
from urllib.request import urlopen, Request


class StmAPi:
    def __init__(self, api_key):
        self.api_key = api_key

    """
        Endpoint to retrieve the vehicle positions from api
        No input parameters needed
    """

    def get_vehicle_positions(self):

        try:
            url = "https://api.stm.info/pub/od/gtfs-rt/ic/v2/vehiclePositions"

            feed = gtfs_realtime_pb2.FeedMessage()

            response = Request(url)
            response.add_header("apiKey", self.api_key)

            feed.ParseFromString(urlopen(response).read())

            return feed.entity

        # TODO make sure to catch more specific exceptions if need to handle differently
        except Exception as e:
            print(str(e))
            return None
