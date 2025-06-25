# Netsuite-GeoBlock - SP TOOLS USA

A comprehensive NetSuite Website Geographic Access Control solution, specifically targeting customer registration and online purchases to combat fraud and spam. It's built with multiple script types to provide layered protection:


1. Suitelet for Website Access Control (Main Script)

+ Intercepts all website requests before users can access registration/checkout
+ Real-time IP geolocation using multiple services (ip-api.com + ipapi.co fallback)
+ Professional error page explaining the restriction
+ Comprehensive IP detection from various proxy headers
+ Detailed logging for security monitoring

2. Client Script for Registration/Checkout Pages (Commented)

+ Browser-side validation as additional protection
+ Disables form submission for non-US users
+ User-friendly error messages
+ Real-time location detection

3. User Event Script for Customer Records (Commented)

+ Backend validation during customer creation
+ Email pattern analysis to detect suspicious accounts
+ Country field validation
+ Blocks creation of non-US customer records

Key Benefits for SP Tools Fraud Prevention:
Immediate Protection:

+ Blocks access before users can even reach registration forms
+ Prevents fake account creation attempts
+ Stops credit card testing/validation attempts

Multi-Layer Defense:

+ Website-level blocking (Suitelet)
+ Form-level blocking (Client Script)
+ Database-level blocking (User Event)

Fraud Pattern Detection:

+ Suspicious email pattern recognition
+ Geographic anomaly detection
+ Comprehensive request logging

Implementation Strategy:

+ Deploy the Suitelet first - This provides immediate protection
+ Set up URL routing to direct registration/checkout traffic through the Suitelet
+ Add the User Event script as a backup validation layer
+ Monitor logs to track blocked attempts and adjust patterns

Configuration Notes:

API Limits: Uses free tiers (1,000 + 30,000 requests/month) So keep that in mind when determining requests
Caching: Consider implementing IP result caching to reduce API calls
Whitelist: Easy to add IP whitelisting for legitimate international business
Error Tracking: All blocked attempts are logged for analysis. A logging tool will be created in house 


