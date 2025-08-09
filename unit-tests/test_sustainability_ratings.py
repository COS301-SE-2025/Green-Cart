import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models.sustainability_ratings import SustainabilityRating

def test_rating_valid():
    rating = SustainabilityRating(
        id=1,
        product_id=1,
        type=1,  # Integer type ID
        value=4,
        verification=False  # Boolean verification
    )
    assert rating.id == 1
    assert rating.product_id == 1
    assert rating.type == 1
    assert 1 <= rating.value <= 5
    assert rating.verification == False
