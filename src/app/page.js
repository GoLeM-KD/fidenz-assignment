"use client";
import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import cities from "./cities.json";

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  const [cityCode, setCityCode] = useState("");
  const [weatherData, setWeatherData] = useState([]);
  const [rankedWeather, setRankedWeather] = useState([]);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }

    const now = new Date();
    const nowInHour = now.getHours();
    
    if(nowInHour < 12) {

      setGreeting("Good Morning!");

    } else if (nowInHour >= 12 && nowInHour < 15) {

      setGreeting("Good Afternoon!");

    } else if (nowInHour > 15 && nowInHour < 22) {

      setGreeting("Good Evening!");

    } else {

      setGreeting("Good Night!");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const getWeatherData = async () => {
      if (cityCode) {
        try {
          const requesting = await fetch(
            `./api/weather?cityCode=${cityCode}`
          );
          const result = await requesting.json();

          console.log(result);

          setWeatherData(result.data);
          
        } catch (e) {
          alert(e);
        }
      } else {
        const requesting = await fetch(
          `./api/weather`
        );

        const result = await requesting.json();

        console.log(result);
        
        setWeatherData(result.data);

      }
    };

    getWeatherData();
    console.log("DATA.......",weatherData);
  }, [cityCode]);

  useEffect(() => {
    if(Array.isArray(weatherData)) {
      
      setRankedWeather([...weatherData].sort((a , b) => b.fixedComfortIndex - a.fixedComfortIndex));
      
    }
    console.log("DATA 02......", weatherData);
  },[weatherData]);

  if (isLoading) return <p>Loading...</p>;
  if (!user) return null;

  return (
    <div>
      <p>Hello {greeting}, {user.name}</p>
      <select onChange={(e) => setCityCode(e.target.value)}>
        <option value="">Select a city</option>
        {cities.List.map((city) => (
          <option key={city.CityCode} value={city.CityCode}>
            {city.CityName}
          </option>
        ))}
      </select>

      {Array.isArray(weatherData) 
        ? rankedWeather.map((data) => (
            <div key={data.id}>
              <p>{data.name}</p>
              <p>{data.main.temp} °C</p>
              <p>{data.fixedComfortIndex}</p>
            </div>
          ))
        : weatherData && (
            <div>
              <p>{weatherData.name}</p>
              <p>{weatherData.main.temp} °C</p>
              <p>{weatherData.fixedComfortIndex}</p>
            </div>
          )
      }
      
      <LogoutButton/>
    </div>
  );
}
