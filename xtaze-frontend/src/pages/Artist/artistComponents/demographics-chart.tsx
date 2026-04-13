
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
} from "recharts";
import { RootState } from "../../../store/store";
import { aggregateDemographics } from "../../../utils/demographics";
import { fetchArtistTracks } from "../../../services/artistService";
import { fetchUserDetails } from "../../../services/adminService";

// Define the structure for chart data
interface ChartData {
  category: string;
  value: number;
}

export function DemographicsChart() {
  const [genderData, setGenderData] = useState<ChartData[]>([]);
  const [ageData, setAgeData] = useState<ChartData[]>([]);
  const [countryData, setCountryData] = useState<ChartData[]>([]);
  const user = useSelector((state: RootState) => state.artist.signupData);

  useEffect(() => {
    const fetchDemographics = async () => {
      const token = localStorage.getItem("artistToken");

      if (!token || !user?.id) {
        console.error("Token or User ID not found. Please login.");
        setGenderData([]);
        setAgeData([]);
        setCountryData([]);
        return;
      }

      try {
        const tracks = await fetchArtistTracks(user.id);
        const listenerIds = Array.from(
          new Set(tracks.data.flatMap((track) => track.listeners))
        );
        
        if (listenerIds.length === 0) {
          setGenderData([]);
          setAgeData([]);
          setCountryData([]);
          return;
        }

        // Fetch user details for all listeners
        const users = await fetchUserDetails(listenerIds);
        
        // Aggregate demographics
        const { genderData, ageData, countryData } = aggregateDemographics(users);
        setGenderData(genderData);
        setAgeData(ageData);
        setCountryData(countryData);
      } catch (error) {
        console.error("Error fetching demographics:", error);
        setGenderData([]);
        setAgeData([]);
        setCountryData([]);
      }
    };

    fetchDemographics();
  }, [user?.id]);

  // Define color palettes for each chart
  const genderColors = ["#FF6B6B", "#4ECDC4", "#45B7D1"];
  const ageColors = ["#96CEB4"];
  const countryColors = ["#FFD93D", "#6BCB77", "#4D96FF", "#FF6B6B"];

  // Render Gender Pie Chart
  const renderGenderChart = () => (
    <div className="w-full h-full bg-black rounded-lg p-4 shadow-md border border-black">
      <h3 className="text-lg font-semibold mb-2 text-white text-center">Gender Distribution</h3>
      {genderData.length > 0 ? (
        <div className="h-[400px] w-[full]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genderData}
                dataKey="value"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label={({ name, percent }: { name: string; percent: number }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                labelLine={true}
                isAnimationActive={false}
              >
                {genderData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={genderColors[index % genderColors.length]}
                  />
                ))}
              </Pie>
              {/* Tooltip removed to disable hover effects */}
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: "10px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-black text-center">No gender data available</p>
      )}
    </div>
  );

  // Render Age Bar Chart
  const renderAgeChart = () => (
    <div className="w-full bg-black rounded-lg p-4 shadow-md border border-black">
      <h3 className="text-lg font-semibold mb-2 text-white text-center">Age Distribution</h3>
      {ageData.length > 0 ? (
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ageData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <XAxis
                dataKey="category"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `${Math.round(value)}%`}
                domain={[0, 100]}
              />
              {/* Tooltip removed to disable hover effects */}
              <Legend />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                barSize={30}
                isAnimationActive={false}
              >
                {ageData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={ageColors[index % ageColors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-black text-center">No age data available</p>
      )}
    </div>
  );

  // Render Country Bar Chart
  const renderCountryChart = () => (
    <div className="w-full bg-black rounded-lg p-4 shadow-md border border-black">
      <h3 className="text-lg font-semibold mb-2 text-white text-center">Country Distribution</h3>
      {countryData.length > 0 ? (
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={countryData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <XAxis
                dataKey="category"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `${Math.round(value)}%`}
                domain={[0, 100]}
              />
              {/* Tooltip removed to disable hover effects */}
              <Legend />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                barSize={30}
                isAnimationActive={false}
              >
                {countryData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={countryColors[index % countryColors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-gray-400 text-center">No country data available</p>
      )}
    </div>
  );

  return (
    <div className="w-full p-6 bg-black rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-white text-center">Listener Demographics</h2>
      <div className="flex flex-col gap-8">
        {renderGenderChart()}
        {renderAgeChart()}
        {renderCountryChart()}
      </div>
    </div>
  );
}