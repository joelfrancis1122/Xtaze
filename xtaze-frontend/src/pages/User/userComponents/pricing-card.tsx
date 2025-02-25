"use client";

import { cn } from "../../../utils/utils";


interface PricingCardProps {
  name: string;
  price: number;
  period: string;
  features: string[];
  featured?: boolean;
  onGetPremium?: () => Promise<void>; // Add this optional prop
}

export function PricingCard({ name, price, period, features, featured, onGetPremium }: PricingCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-6 bg-gray-900 border border-gray-800 flex flex-col justify-between",
        featured && "border-red-500 shadow-lg shadow-red-500/20"
      )}
    >
      <div>
        <h2 className="text-2xl font-bold">{name}</h2>
        <div className="mt-4">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-gray-400"> /{period}</span>
        </div>
        <ul className="mt-6 space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="text-gray-300">
              • {feature}
            </li>
          ))}
        </ul>
      </div>
      {name === "Premium" && (
        <button
          onClick={onGetPremium}
          className="mt-6 w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors"
        >
          Get Premium
        </button>
      )}
    </div>
  );
}