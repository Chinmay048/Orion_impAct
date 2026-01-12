// src/lib/api.ts
const API_URL = "http://localhost:3000/api";

export interface Decision {
  id: string;
  source: string;
  destination: string;
  commodity: string;
  quantity: number;
  timestamp: string;
}

export interface CostCalculation {
  distance_km: number;
  transport_cost: number;
  commodity_total_cost: number;
  total_cost: number;
}

export const fetchCities = async () => {
  const res = await fetch(`${API_URL}/cities`);
  return res.json();
};

export const fetchCommodities = async () => {
  const res = await fetch(`${API_URL}/commodities`);
  return res.json();
};

export const calculateCost = async (source: string, destination: string, commodity: string, quantity: number) => {
  const res = await fetch(`${API_URL}/calculate-cost`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, destination, commodity, quantity }),
  });
  return res.json();
};

export const submitDecision = async (data: any) => {
  const res = await fetch(`${API_URL}/submit-decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  return json.id;
};

export const fetchDecisionHistory = async () => {
  const res = await fetch(`${API_URL}/history`);
  return res.json();
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};