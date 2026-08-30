from typing import List

def get_recommendations(factors: List[dict]) -> List[str]:
    """
    Transparent rule-based recommendation service based on risk factors.
    """
    recommendations = set()
    
    for factor in factors:
        factor_name = factor.get("factor", "").lower()
        impact = factor.get("impact", "LOW")
        direction = factor.get("direction", "")
        
        if direction != "INCREASES_RISK" or impact == "LOW":
            continue
            
        if "attendance" in factor_name:
            recommendations.add("ATTENDANCE_SUPPORT")
            
        elif "gpa" in factor_name or "assignment" in factor_name or "fail" in factor_name or "backlog" in factor_name:
            recommendations.add("ACADEMIC_MENTORING")
            if impact == "HIGH":
                recommendations.add("REMEDIAL_SUPPORT")
                
        elif "lms" in factor_name:
            recommendations.add("COUNSELING_SESSION")
            
    # Default if no specific mapping
    if not recommendations:
        recommendations.add("COUNSELING_SESSION")
        
    return list(recommendations)
