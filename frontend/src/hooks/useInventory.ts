import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ⚠️ Ensure this matches your Backend URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
 

export const useInventory = () => {
  return useQuery({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/dashboard-data`);
      if (!res.ok) throw new Error("Failed to fetch data");
      return res.json();
    },
    refetchInterval: 5000, // Live updates every 5s
  });
};

export const useRestock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount }: { id: number; amount: number }) => {
      await fetch(`${API_URL}/api/restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, amount }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
    },
  });
};