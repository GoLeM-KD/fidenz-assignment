## Technologies and Setup Instructions

- Next.js  
- Auth0  
- OpenWeatherMap API (City Code and Latitude/Longitude based)  
- Tailwind CSS  

1. Open the project directory.
2. Press `Ctrl + L`, type `cmd`, and press Enter.
3. Run the following command: 
    ```bash

    npm run dev
4. The application runs on http://localhost:3000 by default.
5. If the application runs on a different port, update the **APP_BASE_URL** value in the `.env.local` file and save the changes.

* Has hosted on **Vercel** : https://fidenzassignment.vercel.app/
## Comfort Index

To understand the concept of a Comfort Index, I researched existing approaches and found a reference formula:

`ComfortIndex = (Temperature (°F) + Humidity) / 4`

* This formula requires temperature values in Fahrenheit.
* The OpenWeatherMap API returns temperature in Celsius when using the `units=metric` parameter.
* Therefore, Celsius values were converted to Fahrenheit using the following formula: `(C × 9/5) + 32`

During the initial calculation, the resulting Comfort Index values exceeded the required range of 0 to 100, which was not acceptable according to the assignment requirements.

To resolve this:

1) Penalty values were calculated by subtracting the current temperature and humidity from predefined ideal values.

2) These penalty values were weighted and subtracted from 100 to represent overall comfort versus discomfort.

3) The final Comfort Index value was clamped between 0 and 100.

This approach ensures consistent and interpretable Comfort Index values while meeting the assignment constraints.

## Reasoning Behind Variable Weights

* Temperature is displayed in Celsius in the UI using the units=metric API parameter because it is more familiar to users.

* Internally, temperature values are converted to Fahrenheit within the generateComfortIndex() function to match the reference formula.

* In the generateComfortIndex() function:
    * Temperature penalty is weighted at 70% (0.7) because temperature has the most direct impact on human comfort.
    * Humidity penalty is weighted at 30% (0.3) because it affects comfort but to a lesser extent.

* Two separate state arrays are used in page.js to improve clarity and avoid unnecessary rendering issueses while meeting the assignment constraints.

## Trade-offs Considered

1) Technology Stack
Next.js and Tailwind CSS were chosenn for rapid development and responsive UI support
**Trade-off**: Introduces framework-specific conventions compared to a plain React setup.

2) Backend vs Frontend Computation
All complex caluclation was calculated in the back-end such as Comfort Index
**Trade-off** : Improves security and consistency but increases server-side processing

3) Weather Data Caching Strategy
**Trade-off** : Weather API responses are cached for 5 minutes.

4) Comfort Index Formula Simplicity
A simplified weighted formula using ideal temperature and humidity values was used.
**Trade-off** : Easy to understand and maintain, but not scientifically precise.

5) Authentication via Auth0
Auth0 was used to implement authentication with login and logout functionality.  
Multi-Factor Authentication (MFA) was considered; however, in this tenant email-based MFA is not available.  
Domain based access control was enforced using a custom Auth0 Action, allowing only `@fidenz.com` users to authenticate.
**Trade-off** : Auth0 provides a secure and scalable authentication solution. MFA is planned for enterprise setup, but free/test tenants only allow Authenticator App or
                SMS based MFA.

6) Restricted User Access
Domain-based access control blocks non @fidenz.com users.
**Trade-off** : Improves security and meets assignment requirements, but prevents open public registration.

7) Responsive UI Design
The UI supports both mobile and desktop layouts.
**Trde-off** : Requires additional styling effort but improves accessibility and user experience.

## Cache design explanation

To reduce the number of API calls to OpenWeatherMap, a server-side caching mechanism was implemented.

- **CACHE_TIME** is set as:
  ```js
  const CACHE_TIME = 5 * 60 * 1000; // app/api/weather/route.js ---> line 5

This represents 5 minutes in milliseconds, which can be easily adjusted if a different cache duration is desired.

* **cacheData** is an object that stores API responses, keyed by `cityCode`.

* When a request is received:
    1. The current time is obtained using `Date.now()` and stored in the variable **nowTime**.
    2. Before making a new API call, the code checks if the requested `cityCode` exists in **cacheData**.
    3. It calculates the difference between **nowTime** and the cached `timestamp` for that city:
        * If the difference is less than 5 minutes (300,000 milliseconds), the cached data is returned (cache HIT), avoiding an unnecessary API call.
        * If the difference is greater than 5 minutes or the city is not in the cache, a new API call is made, and the resulting data is stored in **cacheData** with the current
            `timestamp: (nowTime)` as its key (cache MISS)

This caching approach ensures that repeated requests for the same city within a short time window use cached data, improving performance and reducing unnecessary external API calls.

## Known Limitations

* The Comfort Index is a simplified model and does not represent a scientifically validated comfort standard.  
* Weather data accuracy depends on the OpenWeatherMap API.  
* Only temperature and humidity are considered for comfort evaluation; other factors like wind, cloudiness, or pressure are not included.  
* Multi-Factor Authentication (MFA) was not implemented because the Auth0 free tenant does not support email-based MFA.  
