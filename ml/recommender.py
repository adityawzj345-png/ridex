"""
RideX Personalized Recommender Engine
Uses Content-Based & Collaborative heuristics with Cosine Similarity
to suggest the best bikes for a given rider.
"""

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def extract_bike_features(bike, max_price=100.0):
    # Vector: [is_sport, is_cruiser, is_scooter, is_commuter, is_other, normalized_price, rating_normalized]
    b_type = (bike.get('type') or '').lower()
    type_vec = [
        1.0 if 'sport' in b_type else 0.0,
        1.0 if 'cruiser' in b_type else 0.0,
        1.0 if 'scooter' in b_type else 0.0,
        1.0 if 'commuter' in b_type else 0.0,
        1.0 if ('naked' in b_type or 'classic' in b_type) else 0.0
    ]
    price = float(bike.get('price_per_hour', 25))
    norm_price = min(1.0, max(0.1, price / max_price))
    rating = float(bike.get('average_rating', 4.5)) / 5.0
    
    return np.array(type_vec + [norm_price, rating])

def get_recommendations(user_bookings, all_bikes, top_k=3):
    """
    Given user's booking history and list of all bikes,
    ranks and recommends the best bikes for this user.
    """
    if not all_bikes:
        return []

    # If user has no previous bookings, recommend top-rated and best-value bikes
    if not user_bookings:
        # Sort by rating and popularity
        ranked = sorted(
            all_bikes, 
            key=lambda b: (b.get('average_rating', 0), -b.get('price_per_hour', 0)), 
            reverse=True
        )
        recommendations = []
        for i, b in enumerate(ranked[:top_k]):
            recommendations.append({
                **b,
                "match_score": 95 - (i * 4),
                "recommendation_reason": "Top Rated Fleet Pick for New Riders" if i == 0 else "Best Value & Customer Favorite"
            })
        return recommendations

    # Build user preference profile from their past bookings
    booked_bike_ids = {b['bike_id'] for b in user_bookings if 'bike_id' in b}
    past_bikes = [b for b in all_bikes if b['id'] in booked_bike_ids]
    
    if not past_bikes:
        past_bikes = all_bikes[:1]

    user_vecs = [extract_bike_features(b) for b in past_bikes]
    user_profile = np.mean(user_vecs, axis=0).reshape(1, -1)

    candidate_bikes = [b for b in all_bikes]
    candidate_vecs = np.array([extract_bike_features(b) for b in candidate_bikes])

    similarities = cosine_similarity(user_profile, candidate_vecs)[0]

    # Combine similarity with rating boost
    scores = []
    for idx, sim in enumerate(similarities):
        bike = candidate_bikes[idx]
        rating_boost = (bike.get('average_rating', 4.0) / 5.0) * 0.15
        final_score = float(sim * 0.85 + rating_boost)
        scores.append((final_score, bike))

    scores.sort(key=lambda x: x[0], reverse=True)

    recommendations = []
    for score, bike in scores[:top_k]:
        pct_match = min(99, int(score * 100))
        reason = f"{pct_match}% Match based on your previous {bike.get('type')} rides"
        recommendations.append({
            **bike,
            "match_score": pct_match,
            "recommendation_reason": reason
        })

    return recommendations
