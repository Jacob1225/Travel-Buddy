# The purpose of this file is to make requests to the stm api
from google.transit import gtfs_realtime_pb2
from urllib.request import urlopen, Request


class StmAPi:
    def __init__(self, api_key):
        self.api_key = api_key

    """
        Private method that setups up the feed and executes the request
        Takes in the stm endpoint url as input
        returns the feed or None if error occured
    """

    def __feedsetup(self, url):
        try:
            feed = gtfs_realtime_pb2.FeedMessage()

            response = Request(url)
            response.add_header("apiKey", self.api_key)
            feed.ParseFromString(urlopen(response).read())
            return feed.entity

        # TODO make sure to catch more specific exceptions if need to handle differently
        except Exception as e:
            print(e)

    """
        Endpoint to retrieve the vehicle positions from api
        No input parameters needed
    """

    def get_vehicle_positions(self):

        url = "https://api.stm.info/pub/od/gtfs-rt/ic/v2/vehiclePositions"
        return self.__feedsetup(url)

    """
        Executes the request to the stm api for trips
        If error occured in feed setup - None is returned
        Ensure to Check for None when calling get_trip_updates
    """

    def get_trip_updates(self):

        url = "https://api.stm.info/pub/od/gtfs-rt/ic/v2/tripUpdates"
        return self.__feedsetup(url)
