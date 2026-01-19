"use client";
import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import cities from "./cities.json";
import Image from "next/image";

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  const [cityCode, setCityCode] = useState(""); // This stores the city code automatically whenever we choose a city
  const [weatherData, setWeatherData] = useState([]); // to store the row dataset of the weather (THROUGH API)
  const [rankedWeather, setRankedWeather] = useState([]); // to store the dataset after sorted according to the comfort Index
  const [greeting, setGreeting] = useState(""); // to catch the Greeting according to the Time ex:- Good Morning!
  const [greetingImage, setGreetingImage] = useState("/gm.jpg"); // To catch the picture according to the greeting

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }

    const now = new Date();
    const nowInHour = now.getHours();

    if (nowInHour < 12) {
      setGreeting("Good Morning!");
      setGreetingImage("/gm.jpg");
    } else if (nowInHour >= 12 && nowInHour < 15) {
      setGreeting("Good Afternoon!");
      setGreetingImage("/af.jpg");
    } else if (nowInHour >= 15 && nowInHour < 22) {
      setGreeting("Good Evening!");
      setGreetingImage("/ev.jpg");
    } else {
      setGreeting("Good Night!");
      setGreetingImage("/gn.jpg");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const getWeatherData = async () => {
      if (cityCode) {
        try {
          const requesting = await fetch(`./api/weather?cityCode=${cityCode}`);
          const result = await requesting.json();

          console.log(result);

          setWeatherData(result.data);
        } catch (e) {
          alert(e);
        }
      } else {
        const requesting = await fetch(`./api/weather`);

        const result = await requesting.json();

        console.log(result);

        setWeatherData(result.data);
      }
    };

    getWeatherData();
    console.log("DATA.......", weatherData);
  }, [cityCode]);

  useEffect(() => {
    if (Array.isArray(weatherData)) {
      setRankedWeather(
        [...weatherData].sort(
          (a, b) => b.fixedComfortIndex - a.fixedComfortIndex,
        ),
      );
    }
    console.log("DATA 02......", weatherData);
  }, [weatherData]);

  if (!user) return null;

  if (!rankedWeather.length || !rankedWeather[0]?.main || isLoading) {
    return <p className="text-black text-center mt-10">Loading weather...</p>;
  }

  function getWindDirection(deg) {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];

    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
  }

  return (
    <div className="bg-[#1B3C53] w-full min-h-full text-[#FFFFFF] flex flex-col items-center">
      {/* --- Static Part --- */}
      <div
        className="w-full min-h-[15.09vh] bg-no-repeat bg-cover bg-center flex items-center md:pl-[2.14vw] justify-center md:justify-start"
        style={{ backgroundImage: `url("${greetingImage}")` }}
      >
        <p className="text-[20px] md:text-[24px] font-bold text-center md:text-left">
          Hello {greeting}, {user.name}
        </p>
      </div>

      <div className="w-full flex justify-center items-center mt-[4.17vh]">
        <select
          onChange={(e) => setCityCode(e.target.value)}
          className="bg-[#D2C1B6] rounded-[15px] text-[#000000] w-[300px] min-h-[50px] p-[5px]"
        >
          <option value="">Select a city</option>
          {cities.List.map((city) => (
            <option key={city.CityCode} value={city.CityCode}>
              {city.CityName}
            </option>
          ))}
        </select>
      </div>
      {/* --- END static --- */}

      {/* --- Dynamic Part --- */}
      {Array.isArray(weatherData) && rankedWeather.length > 0 ? (
        <div className="w-full 2xl:w-[77.76vw] flex flex-col 2xl:flex-wrap 2xl:flex-row items-center 2xl:items-start justify-center 2xl:justify-between mt-[4.17vh] 2xl:mt-[7.22vh] gap-[2vh] 2xl:gap-0">
          {/* First Rank show case */}
          <div className="w-[300px] md:w-[638px] bg-[#234C6A] rounded-[15px] pb-[50px] flex flex-col items-center">
            <div className="flex flex-row justify-between w-[197px] md:w-[535px] items-center mt-[1.39vh]">
              <p className="text-[30px] md:text-[40px]">
                {rankedWeather[0].name}
              </p>
              <p className="text-[16px]">
                {new Date(rankedWeather[0].dt * 1000).toLocaleString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>

            <div className="w-[197px] md:w-[535px] h-[1px] border-1 border-[#FFFFFF] mt-[1.11vh]"></div>

            {/* ------- Second part -------- */}
            <div className="w-[197px] md:w-[535px] flex flex-col md:flex-row justify-center md:justify-between items-center md:items-start mt-[4.63vh] gap-[4vh] md:gap-0">
              {/* Image and Temp */}
              <div className="w-[115px] md:w-[239px] flex flex-col md:flex-row md:justify-between">
                {/* Image weather */}
                <div className="w-[108px] flex flex-col items-center md:items-center">
                  <Image
                    src={
                      rankedWeather[0].weather[0].main === "Clear"
                        ? "/sunny.png"
                        : rankedWeather[0].weather[0].main === "Clouds"
                          ? "/cloudy.png"
                          : ["Rain", "Drizzle", "Thunderstorm"].includes(
                                rankedWeather[0].weather[0].main,
                              )
                            ? "/rainy.png"
                            : ["Fog", "Haze", "Mist"].includes(
                                  rankedWeather[0].weather[0].main,
                                )
                              ? "/foggy.png"
                              : "/sunny.png"
                    }
                    alt={rankedWeather[0].weather[0].main}
                    width={108}
                    height={108}
                    className="w-[50px] md:w-[108px] h-[50px] md:h-[108px]"
                  />

                  <p className="text-[20px] md:text-[24px]">
                    {rankedWeather[0].weather[0].main === "Clear"
                      ? "Sunny"
                      : rankedWeather[0].weather[0].main === "Clouds"
                        ? "Cloudy"
                        : rankedWeather[0].weather[0].main === "Rain"
                          ? "Rainy"
                          : rankedWeather[0].weather[0].main === "Drizzle"
                            ? "Light Rain"
                            : ["Fog", "Haze", "Mist"].includes(
                                  rankedWeather[0].weather[0].main,
                                )
                              ? "Foggy"
                              : rankedWeather[0].weather[0].main}
                  </p>
                </div>

                {/* Temp and Humidty */}
                <div className="w-full md:w-[115px] h-auto md:min-h-full flex flex-col justify-center items-center">
                  <p className="text-[30px] md:text-[40px]">
                    {Math.round(rankedWeather[0].main.temp)} °C
                  </p>
                  <p className="text-[16px]">
                    Humidity: {rankedWeather[0].main.humidity}%
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="w-full md:w-[255px] flex flex-col gap-[1.94vh]">
                {/* RealFeel */}
                <div className="w-full flex flex-row justify-between text-[18px] md:text-[20px]">
                  <p>RealFeel Shade</p>
                  <p className="font-bold">
                    {Math.round(rankedWeather[0].main.feels_like)}°
                  </p>
                </div>

                <div className="w-full h-[1px] border-1 border-[#FFFFFF]"></div>

                {/* Wind */}
                <div className="w-full flex flex-row justify-between text-[18px] md:text-[20px]">
                  <p>Wind</p>
                  <p className="font-bold">
                    {Math.round(rankedWeather[0].wind.speed) * 3.6} km/h
                  </p>
                </div>

                <div className="w-full h-[1px] border-1 border-[#FFFFFF]"></div>

                {/* Comfort Index */}
                <div className="w-full flex flex-row justify-between text-[18px] md:text-[20px]">
                  <p>Comfort Index</p>
                  <p className="font-bold">
                    {rankedWeather[0].fixedComfortIndex}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* All ranks show case */}
          <div className="w-[300px] md:w-[37.92vw] md:min-w-[244px] flex flex-col md:flex-wrap md:flex-row bg-[#234C6A80] rounded-[15px] pb-[37px] justify-center gap-[7.52vh] md:gap-[1.61vw] items-center">
            <p className="w-full text-[24px] font-bold text-center mt-[23px]">
              Ranking
            </p>
            {rankedWeather.map((data, idx) =>
              idx === 0 ? (
                <div
                  key={data.id}
                  className="w-[204px] h-[197px] bg-[#456882] rounded-[15px] relative cursor-pointer transition-transform ease-in-out duration-300 hover:scale-105"
                  onClick={() => setCityCode(data.id)}
                >
                  <Image
                    src="/crown.png"
                    alt="crown"
                    width={50}
                    height={50}
                    className="absolute top-[-40] left-[175] rotate-[22.02deg]"
                  />
                  <p className="font-bold text-[20px] mt-[12px] text-center">
                    {data.name}
                  </p>
                  <p className="text-[36px] mt-[23px] text-center">
                    {Math.round(data.main.temp)} °C
                  </p>
                  <p className="text-[15px] mt-[23px] text-center">
                    Comfort Score: {data.fixedComfortIndex}
                  </p>
                  <p className="text-[15px] font-bold text-center">
                    Rank: {idx + 1}
                  </p>
                </div>
              ) : (
                <div
                  key={data.id}
                  className="w-[204px] h-[197px] bg-[#456882] rounded-[15px] flex flex-col items-center cursor-pointer transition-transform ease-in-out duration-300 hover:scale-105"
                  onClick={() => setCityCode(data.id)}
                >
                  <p className="font-bold text-[20px] mt-[12px]">{data.name}</p>
                  <p className="text-[36px] mt-[23px]">
                    {Math.round(data.main.temp)} °C
                  </p>
                  <p className="text-[15px] mt-[23px]">
                    Comfort Score: {data.fixedComfortIndex}
                  </p>
                  <p className="text-[15px] font-bold">Rank: {idx + 1}</p>
                </div>
              ),
            )}
          </div>
        </div>
      ) : (
        weatherData && (
          <div className="w-[350px] sm:w-[500px] lg:w-[1037px] flex flex-col bg-[#234C6A] rounded-[15px] pt-[29px] pb-[61px] items-center mb-[106px] mt-[133px]">
            <div className="w-[299px] sm:w-[399px] lg:w-[936px] flex flex-row justify-between items-center">
              <p className="text-[40px]">{weatherData.name}</p>
              <p className="text-[16px]">
                {new Date(weatherData.dt * 1000).toLocaleString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>

            <div className="w-[299px] sm:w-[399px] lg:w-[936px] h-[1px] bg-[#FFFFFF]"></div>

            {/* Second Part */}
            <div className="w-[299px] sm:w-[399px] lg:w-[936px] flex flex-col lg:flex-row justify-start lg:justify-between items-center lg:items-start mt-[44px]">
              {/* Image and the Temp and ranks */}
              <div className="w-[299px] sm:w-[331px] flex flex-col sm:flex-row justify-between items-center sm:items-start">
                {/* Image and the weather */}
                <div className="w-[167px] flex flex-col items-center sm:items-start">
                  <Image
                    src={
                      weatherData.weather[0].main === "Clear"
                        ? "/sunny.png"
                        : weatherData.weather[0].main === "Clouds"
                          ? "/cloudy.png"
                          : ["Rain", "Drizzle", "Thunderstorm"].includes(
                                weatherData.weather[0].main,
                              )
                            ? "/rainy.png"
                            : ["Fog", "Haze", "Mist"].includes(
                                  weatherData.weather[0].main,
                                )
                              ? "/foggy.png"
                              : "/sunny.png"
                    }
                    alt={weatherData.weather[0].main}
                    width={167}
                    height={167}
                    className="w-[100px] sm:w-[167px] h-[100px] sm:h-[167px]"
                  />
                  <p className="text-[32px]">
                    {weatherData.weather[0].main === "Clear"
                      ? "Sunny"
                      : weatherData.weather[0].main === "Clouds"
                        ? "Cloudy"
                        : weatherData.weather[0].main === "Rain"
                          ? "Rainy"
                          : weatherData.weather[0].main === "Drizzle"
                            ? "Light Rain"
                            : ["Fog", "Haze", "Mist"].includes(
                                  weatherData.weather[0].main,
                                )
                              ? "Foggy"
                              : weatherData.weather[0].main}
                  </p>
                </div>
                {/* Temp and Ranks,Humidity */}
                <div className="w-[133px] h-full flex flex-col justify-center items-center sm:items-start">
                  <p className="text-[48px]">
                    {Math.round(weatherData.main.temp)} °C
                  </p>
                  <p>Humidity: {weatherData.main.humidity}%</p>
                  <p>RealFeel: {Math.round(weatherData.main.feels_like)}°</p>
                  <p>
                    Rank:{" "}
                    {rankedWeather.findIndex(
                      (city) => city.id === weatherData.id,
                    ) + 1}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="w-[299px] sm:w-[409px] flex flex-col gap-[1.94vh] mt-[4vh] lg:mt-0 text-[20px] sm:text-[32px]">
                <div className="w-full flex flex-row justify-between">
                  <p>RealFeel</p>
                  <p className="font-bold">
                    {Math.round(weatherData.main.feels_like)}°
                  </p>
                </div>

                <div className="w-full h-[1px] bg-[#FFFFFF]"></div>

                <div className="w-full flex flex-row justify-between">
                  <p>Wind</p>
                  <p className="font-bold">
                    {getWindDirection(weatherData.wind.deg)}{" "}
                    {Math.round(weatherData.wind.speed) * 3.6} km/h
                  </p>
                </div>

                <div className="w-full h-[1px] bg-[#FFFFFF]"></div>

                {weatherData.wind.gust && (
                  <div className="w-full flex flex-col gap-[1.94vh]">
                    <div className="w-full flex flex-row justify-between">
                      <p>Gust</p>
                      <p className="font-bold">
                        {Math.round(weatherData.wind.gust) * 3.6} km/h
                      </p>
                    </div>

                    <div className="w-full h-[1px] bg-[#FFFFFF]"></div>
                  </div>
                )}

                <div className="w-full flex flex-row justify-between">
                  <p>Air Quality</p>
                  <p
                    className={
                      weatherData.airQlty === 1
                        ? "text-[#08E028] font-bold"
                        : weatherData.airQlty === 2
                          ? "text-[#8FC932] font-bold"
                          : weatherData.airQlty === 3
                            ? "text-[#E0BE37] font-bold"
                            : weatherData.airQlty === 4
                              ? "text-[#C2643D] font-bold"
                              : weatherData.airQlty === 5
                                ? "text-[#F81111] font-bold"
                                : "font-bold text-[#FFFFFF]"
                    }
                  >
                    {weatherData.airQlty === 1
                      ? "Healthy"
                      : weatherData.airQlty === 2
                        ? "Fair"
                        : weatherData.airQlty === 3
                          ? "Moderate"
                          : weatherData.airQlty === 4
                            ? "Bad"
                            : weatherData.airQlty === 5
                              ? "Unhealthy"
                              : "Unexpected"}
                  </p>
                </div>

                <div className="w-full h-[1px] bg-[#FFFFFF]"></div>

                <div className="w-full flex flex-row justify-between">
                  <p>Comfort Score</p>
                  <p className="font-bold">{weatherData.fixedComfortIndex}</p>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      <LogoutButton />
    </div>
  );
}
