
import { ListenerUser } from "../pages/User/types/IListenerUser";
import {  } from "../services/adminService";

// Define the structure for chart data
interface ChartData {
  category: string;
  value: number;
}

// Aggregate demographics for gender, age, and country
export const aggregateDemographics = (users: ListenerUser[]): {
  genderData: ChartData[];
  ageData: ChartData[];
  countryData: ChartData[];
} => {
  const totalUsers = users.length;
  if (totalUsers === 0) {
    return {
      genderData: [],
      ageData: [],
      countryData: [],
    };
  }

  // Aggregate Gender
  const genderCounts: { [key: string]: number } = {
    Male: 0,
    Female: 0,
    Other: 0,
  };
  users.forEach((user) => {
    const gender = user.gender
      ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1).toLowerCase()
      : "Other";
    genderCounts[gender] = (genderCounts[gender] || 0) + 1;
  });
  const genderData: ChartData[] = Object.entries(genderCounts)
    .filter(([_, count]) => count > 0)
    .map(([category, count]) => ({
      category,
      value: (count / totalUsers) * 100,
    }));

  // Aggregate Age Groups
  const currentYear = new Date().getFullYear(); // 2025
  const ageGroups: { [key: string]: number } = {
    "18-24": 0,
    "25-34": 0,
    "35-44": 0,
    "45+": 0,
  };
  users.forEach((user) => {
    const age = user.year ? currentYear - user.year : 0;
    if (age >= 18 && age <= 24) ageGroups["18-24"]++;
    else if (age >= 25 && age <= 34) ageGroups["25-34"]++;
    else if (age >= 35 && age <= 44) ageGroups["35-44"]++;
    else if (age >= 45) ageGroups["45+"]++;
  });
  const ageData: ChartData[] = Object.entries(ageGroups)
    .filter(([_, count]) => count > 0)
    .map(([category, count]) => ({
      category,
      value: (count / totalUsers) * 100,
    }));

  // Aggregate Countries
  const countryCounts: { [key: string]: number } = {};
  users.forEach((user) => {
    // Validate country (basic check for valid country names)
    const country = user.country && /^[A-Z\s]+$/.test(user.country) ? user.country : "Unknown";
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });

  // Group smaller countries into "Other" if there are too many
  const countryEntries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]);
  const topCountries = countryEntries.slice(0, 3); // Top 3 countries
  const otherCount = countryEntries.slice(3).reduce((sum, [_, count]) => sum + count, 0);
  const countryData: ChartData[] = [
    ...topCountries.map(([category, count]) => ({
      category,
      value: (count / totalUsers) * 100,
    })),
    ...(otherCount > 0 ? [{ category: "Other", value: (otherCount / totalUsers) * 100 }] : []),
  ];

  return { genderData, ageData, countryData };
};