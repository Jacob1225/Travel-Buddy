from math import sin, cos, sqrt, atan2, radians

#calculates the distance between two coordinates
def calculate_distance(lat1: int, lat2: int, lon1: int, lon2: int) -> int:
    
    #radius of the earth in km
    R = 6373.0
    
    #convert latitude and longitude to radians
    r_lat1 = radians(lat1)
    r_lon1 = radians(lon1)
    r_lat2 = radians(lat2)
    r_lon2 = radians(lon2)

    dlon = r_lon2 - r_lon1
    dlat = r_lat2 - r_lat1

    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    distance = R * c
    
    return distance