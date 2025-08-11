import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models.sustainability_ratings import SustainabilityRating

def test_rating_valid():
    rating = SustainabilityRating(
        id=1,
        product_id=1,
        type="eco",
        value=4
    )
    assert rating.id == 1
    assert rating.product_id == 1
    assert rating.type == "eco"
    assert 1 <= rating.value <= 5
