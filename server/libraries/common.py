from dataclasses import asdict, dataclass
from datetime import datetime
from dacite import from_dict
from typing import List, Dict, Optional

"""
    Class the provides helper methods for dervied classes to use
"""


@dataclass
class BaseDocument(object):
    def as_dict(self):
        data = asdict(self)
        return data

    @classmethod
    def from_any(cls, obj):

        if isinstance(obj, dict):
            return cls.from_dict(obj)

        return cls.from_class(obj)

    @classmethod
    def from_dict(cls, obj: dict):
        return from_dict(data_class=cls, data=obj)


"""
    Class defining the schema for a stop sequence in a trip object
"""


@dataclass
class StopSequenceObj(BaseDocument):
    stop_sequence_id: str
    stop_id: str
    departure_time: Optional[datetime] = None
    schedule_relationship: Optional[str] = None
    arrival: Optional[datetime] = None


"""
    Class defining the schema of a trip object
"""


@dataclass
class TripDocument(BaseDocument):
    trip_id: str
    route_id: str
    schedule_relationship: str
    start_date: str
    stop_sequence: List[StopSequenceObj]


"""
    Class defining the schema for a vehicle position object
"""


@dataclass
class VehiclePosition(BaseDocument):
    vehicle_id: str
    trip_id: str
    start_time: str
    start_date: str
    route_id: str
    latitude: float
    longitude: float
    speed: float
    current_stop_sequence_id: int
    current_status: str
    occupancy_status: str
    current_stop_id: Optional[str] = None
