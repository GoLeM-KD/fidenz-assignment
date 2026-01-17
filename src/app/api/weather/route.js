import cities from "../../cities.json";
// ComfortIndex = (Temprature(F) + Humidity)/4
// C ----> F = (C * 9/5)+ 32
const cacheData = {};
const CACHE_TIME = 12 * 60 * 1000;

function genrateComfortIndex(temp, Humidity) {

  const IDEAL_TEMP = 71.6 // has converted 22C into F because Im gonna use F as the temp in the formula
  const IDEAL_HUMIDITY = 50;

  const fixedTemp = Math.abs((((temp * 9/5)+32) - IDEAL_TEMP) * 0.7);
  const fixedHum = Math.abs((Humidity - IDEAL_HUMIDITY) * 0.3);

  let ComfortIndex = 100 - ((fixedTemp + fixedHum)/4);
  ComfortIndex = Math.max(0, Math.min(100, ComfortIndex));

  return Math.round(ComfortIndex);

}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const cityCode = searchParams.get("cityCode") || "";
  const nowTime = Date.now();
  let weatherSet = []; // to store weather data when theres no city code

  // If cityCode empty it returns the wheathers of whole cities in cities.json
  if (!cityCode) {
    const cityCodes = cities.List.map((city) => city.CityCode);

    try {
      let cacheStatusLoop; // to handle the cachestatus dynamically

      for (let i = 0; i < cityCodes.length; i++) {
        if (
          cacheData[cityCodes[i]] &&
          nowTime - cacheData[cityCodes[i]].timestamp < CACHE_TIME
        ) {
          weatherSet.push(cacheData[cityCodes[i]].data);
          cacheStatusLoop = "HIT";
        } else {
          const requestWithoutCityCode = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?id=${cityCodes[i]}&units=metric&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
          );
          const resultWithoutCityCode = await requestWithoutCityCode.json();

          const editedResultWithoutCoe = {...resultWithoutCityCode , fixedComfortIndex : genrateComfortIndex(resultWithoutCityCode.main.temp,resultWithoutCityCode.main.humidity)}

          cacheData[cityCode] = {
            timestamp: nowTime,
            data: editedResultWithoutCoe,
          };

          weatherSet.push(editedResultWithoutCoe);

          cacheStatusLoop = "MISS";
        }
      }

      return new Response(
        JSON.stringify({ cacheStatus: cacheStatusLoop, data: weatherSet }),
        { status: 200 }
      );

    } catch (err) {
      console.log("ERROR IN WITHOUT CITY CODE LOOP.....", err);
      return new Response(JSON.stringify({ error: err }), { status: 500 });
    }
  }
  // End of the loop

  if (
    cacheData[cityCode] &&
    nowTime - cacheData[cityCode].timestamp < CACHE_TIME
  ) {
    return new Response(
      JSON.stringify({ cacheStatus: "HIT", data: cacheData[cityCode].data }),
      { status: 200 }
    );
  }


  try {
    const request = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?id=${cityCode}&units=metric&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
    );
    const result = await request.json();

    const editedResult = {...result, fixedComfortIndex : genrateComfortIndex(result.main.temp, result.main.humidity)}

    cacheData[cityCode] = {
      timestamp: nowTime,
      data: editedResult,
    };

    return new Response(JSON.stringify({ cacheStatus: "MISS", data: editedResult }), {
      status: 200,
    });
  } catch (err) {
    console.log("ERROR........", err);
    return new Response(JSON.stringify({ error: err }), { status: 500 });
  }
}
