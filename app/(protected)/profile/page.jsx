"use client";

import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from "chart.js";
import { LoaderCircle } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import GitHubCalendar from 'react-github-calendar';

// Registro de componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);


export default function Profile() {
  const [userData, setUserData] = useState({});
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [pieData, setPieData] = useState({
    labels: [],
    datasets: [{
      label: "Emociones",
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: []
    }]
  });
  const [error, setError] = useState(null)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const processEmotionsData = (emotions) => {
    // Count occurrences of each emotion
    const emotionCounts = emotions.reduce((acc, curr) => {
      const emotion = curr.emotion_state;
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});

    // Define colors for each emotion
    const emotionColors = {
      "Alegría": "#FFD700",     // Gold
      "Tristeza": "#4682B4",    // Steel Blue
      "Enojo": "#FF4500",       // Red Orange
      "Miedo": "#800080",       // Purple
      "Sorpresa": "#32CD32",    // Lime Green
      "Decepción": "#708090",   // Slate Gray
      "Neutral": "#A9A9A9"      // Dark Gray
    };

    // Prepare data for pie chart
    const labels = Object.keys(emotionCounts);
    const data = Object.values(emotionCounts);
    const colors = labels.map(emotion => emotionColors[emotion] || "#999999");

    return {
      labels,
      datasets: [{
        label: "Emociones",
        data,
        backgroundColor: colors,
        hoverBackgroundColor: colors
      }]
    };
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataString = localStorage.getItem('user_data');

        if (!userDataString) {
          throw new Error('No user data found in localStorage');
        }

        const userData = JSON.parse(userDataString);
        const userId = userData.id;
        setUserEmail(userData.email)

        const response = await fetch(`${API_BASE_URL}/api/user_profile/${userId}`)

        if (!response.ok) {
          throw new Error(`Failed GET /api/users/ req with status: ${response.status}`);
        }

        const data = await response.json();
        setUserData(data)

        // Process and set pie chart data
        if (data.data && data.data.emotions) {
          const chartData = processEmotionsData(data.data.emotions);
          setPieData(chartData);
        }
      } catch (error) {
        console.error('Error fetching user data from /api/users: ', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [])

  // const pieData = {
  //   labels: ["Rojo", "Azul", "Amarillo"],
  //   datasets: [
  //     {
  //       label: "Colores favoritos",
  //       data: [300, 50, 100],
  //       backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
  //       hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
  //     },
  //   ],
  // };

  const barData = {
    labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo"],
    datasets: [
      {
        label: "Ventas",
        data: [65, 59, 80, 81, 56],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  const theme = {
    light: [
      '#ebedf0',  // Nivel 0: Sin contribuciones
      '#9be9a8',  // Nivel 1: Pocas contribuciones
      '#40c463',  // Nivel 2
      '#30a14e',  // Nivel 3
      '#216e39',  // Nivel 4: Muchas contribuciones
    ],
    dark: [
      '#ebedf0',  // Nivel 0: Sin contribuciones
      '#9be9a8',  // Nivel 1: Pocas contribuciones
      '#40c463',  // Nivel 2
      '#30a14e',  // Nivel 3
      '#216e39',  // Nivel 4: Muchas contribuciones
    ]
  };

  const labels = {
    months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    weekdays: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    totalCount: 'Contribuciones en el último año',
    legend: {
      less: 'Menos',
      more: 'Más'
    }
  };


  return (
    <div className="flex flex-col items-center gap-8 md:px-32 p-8 bg-gray-100 min-h-screen">
      {/* Perfil del usuario */}
      <div className="flex md:flex-row flex-wrap overflow-hidden justify-center items-center gap-8 bg-white shadow-md rounded-lg p-6 w-full ">
        <Image
          src={"/avatar.png"}
          alt="Avatar"
          width={80}
          height={80}
          className="rounded-full"
        />
        <h2 className="text-xl font-bold text-gray-800 mt-3">{userEmail || "Username"}</h2>
      </div>

      {/* Gráficos */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 w-full">
        {/* Card para gráfico de torta */}
        <div className="bg-white shadow-md rounded-lg p-4 md:p-7 w-full min-h-[320px] flex justify-center items-center border border-gray-200">
          <div className="w-full h-full flex justify-center items-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <LoaderCircle className={`animate-spin`} />
                <p>Loading data...</p>
              </div>
            ) : pieData.datasets[0].data.length === 0 ? (
              <div className="flex flex-col justify-center items-center gap-2 text-gray-500">
                <p className="text-lg text-center font-medium">No hay datos disponibles</p>
                <p className="text-sm">Aún no hay registros</p>
              </div>
            ) : (
              <div className="w-full flex justify-center max-w-xl max-h-[300px]">
                <Pie data={pieData} options={{ 
                  responsive: true,
                  maintainAspectRatio: true
                }} />
              </div>
            )}
          </div>
        </div>

        {/* Card para gráfico de barras */}
        {/* <div className="bg-white shadow-md rounded-lg p-7 w-80 h-80 flex justify-center items-center border border-gray-200">
          <div className="w-full h-full flex justify-center items-center">
            <Bar data={barData} options={barOptions} />
          </div>
        </div> */}
      </div>

      {/* Card para historial de conversaciones */}
      <div
        className="bg-white shadow-md rounded-lg p-7 flex justify-center items-center border border-gray-200 w-full"
        style={{ maxWidth: '90vw' }}
      >
        <div className="w-full h-full flex justify-center items-center">
          <GitHubCalendar
            username="satelerd"
            colorScheme="light"
            fontSize={16}
            blockSize={10}
            hideTotalCount
            theme={theme}
            labels={labels}
          />
        </div>
      </div>

    </div>
  );
}