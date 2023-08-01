import sys
from os import path
sys.path.append(path.join(path.dirname(__file__), '..'))
from microservices.get_vehicles import get_vehicles
from microservices.get_stops import get_stops

get_stops