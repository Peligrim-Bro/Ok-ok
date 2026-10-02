# Practical Pattaya map

The map remains behind the existing home map button. New shortcuts: Bali Hai ferry, U-Tapao airport and the Jomtien–Suvarnabhumi bus. Added Na Baan return pier, transport filter, name search, local favourites and shareable `?mapPlace=<id>` links. Deep links open the map and selected card. No new navigation tab or paid service.

Times use Asia/Bangkok even when the visitor device uses another timezone. Next scheduled trip refreshes every minute. It is a calculation from a reference timetable, not a real-time departure or operating-status confirmation. At the listed departure minute, the display moves to the next trip. Ferry times may change with weather. No Tawaen schedule is mixed into the Na Baan route.

Reference sources reviewed 2026-10-02:
- Na Baan timetable: https://pattayacitytourcoltd.com/blog/details/pattaya-to-koh-larn-ferry-complete-guide-to-traveling-from-pattaya-to-koh-larn-island
- Boarding instructions and indicative public ferry fare: https://www.kohlarn.com/getting-to-koh-larn.html
- Jomtien–BKK timetable/fare/pickup map: https://airportpattayabus.com/airport-jomtien/
- UTP official schedule: https://www.utapao.com/th/flight-schedule
- External flight status: https://www.flightradar24.com/data/airports/utp/arrivals and /departures
- Approximate Na Baan and UTP marker coordinates: https://mapcarta.com/W587327615 and https://mapcarta.com/24947954

Bali Hai coordinates identify the pier area, not a guaranteed ferry berth. Cards tell visitors to walk to the end and verify boarding. UTP marker identifies the airport area; directions search uses the airport name. Jomtien bus coordinates use the operator's embedded map. UTP and BKK are explicitly distinguished. No flight times are hard-coded from potentially outdated airport images. Links lead to the airport/operator/status provider and seats/departures must be checked there. Static transport data does not inherit the daily news refresh.

Favourites use localStorage `okok-map-saved-v1`. Save failures are displayed honestly. They do not sync across devices. Sharing is initiated only by the user's button press; no messages are sent automatically. Senate referral remains `start=fi10072`. Existing landmarks remain available. Cards, filtering and favourites work if Leaflet fails; street tiles still require network access.

Build copies travel-map.js and travel-map.css into assets/spatial and versions the map/cache references. The project check parses the map script. Mobile browser tests cover RU/EN/TH, both themes, 320/390/1024px, timezone calculation, favourite persistence, deep links and Leaflet fallback. Core checks also verify timer, five-item navigation and OKI/analytics.
