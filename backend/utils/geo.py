from typing import Tuple

def is_in_egypt(lat: float, lng: float) -> bool:
    """Check if coordinates are roughly within Egypt's bounds."""
    return 21.0 <= lat <= 32.0 and 24.0 <= lng <= 37.0

def get_bounding_box(lat: float, lng: float, radius_km: float = 2.0) -> Tuple[float, float, float, float]:
    """
    Calculate a bounding box (min_lng, min_lat, max_lng, max_lat) 
    around a center point given a radius in km.
    1 degree of latitude is roughly 111 km.
    1 degree of longitude is roughly 111 * cos(latitude) km.
    """
    import math
    
    lat_delta = radius_km / 111.0
    lng_delta = radius_km / (111.0 * math.cos(math.radians(lat)))
    
    min_lat = lat - lat_delta
    max_lat = lat + lat_delta
    min_lng = lng - lng_delta
    max_lng = lng + lng_delta
    
    return (min_lng, min_lat, max_lng, max_lat)
