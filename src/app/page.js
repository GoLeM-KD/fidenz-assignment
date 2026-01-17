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

  const [cityCode, setCityCode] = useState("");
  const [weatherData, setWeatherData] = useState([]);
  const [rankedWeather, setRankedWeather] = useState([]);
  const [greeting, setGreeting] = useState("");
  const [greetingImage, setGreetingImage] = useState("/gm.jpg");

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
    } else if (nowInHour > 15 && nowInHour < 22) {
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

  if (!rankedWeather.length || !rankedWeather[0]?.main ||isLoading) {
    return <p className="text-black text-center mt-10">Loading weather...</p>;
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
                {new Date(
                  rankedWeather[0].dt * 1000,
                ).toLocaleString("en-US", {
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
                          : rankedWeather[0].weather[0].main === "Rain" ||
                              "Drizzle" ||
                              "Thunderstorm"
                            ? "/rainy.png"
                            : rankedWeather[0].weather[0].main === "Mist" ||
                                "Fog" ||
                                "Haze"
                              ? "/foggy.png"
                              : "/sunny.png"
                    }
                    alt={rankedWeather[0].weather.main}
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
                            : rankedWeather[0].weather[0].main === "Mist" ||
                                "Fog" ||
                                "Haze"
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
                    {Math.round(rankedWeather[0].wind.speed)} km/h
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
            <p className="w-full text-[24px] font-bold text-center mt-[23px]">Ranking</p>
            {rankedWeather.map((data, idx) => (
              idx === 0 ? (
                <div key={data.id} className="w-[204px] h-[197px] bg-[#456882] rounded-[15px] relative cursor-pointer transition-transform ease-in-out duration-300 hover:scale-105" onClick={()=>setCityCode(data.id)}>
                  <Image src="/crown.png" alt="crown" width={50} height={50} className="absolute top-[-40] left-[175] rotate-[22.02deg]"/>
                  <p className="font-bold text-[20px] mt-[12px] text-center">{data.name}</p>
                  <p className="text-[36px] mt-[23px] text-center">{Math.round(data.main.temp)} °C</p>
                  <p className="text-[15px] mt-[23px] text-center">Comfort Score: {data.fixedComfortIndex}</p>
                  <p className="text-[15px] font-bold text-center">Rank: {idx+1}</p>
                </div>
              ) 
              : (
                <div key={data.id} className="w-[204px] h-[197px] bg-[#456882] rounded-[15px] flex flex-col items-center cursor-pointer transition-transform ease-in-out duration-300 hover:scale-105" onClick={()=>setCityCode(data.id)}>
                  <p className="font-bold text-[20px] mt-[12px]">{data.name}</p>
                  <p className="text-[36px] mt-[23px]">{Math.round(data.main.temp)} °C</p>
                  <p className="text-[15px] mt-[23px]">Comfort Score: {data.fixedComfortIndex}</p>
                  <p className="text-[15px] font-bold">Rank: {idx+1}</p>
                </div>
              )
            ))}
          </div>
        </div>
      ) : (
        weatherData && (
          <div>
            <p>{weatherData.name}</p>
            <p>{weatherData.main.temp} °C</p>
            <p>{weatherData.fixedComfortIndex}</p>
          </div>
        )
      )}

      <LogoutButton />
    </div>
  );
}
