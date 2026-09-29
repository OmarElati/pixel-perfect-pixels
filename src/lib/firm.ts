import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FirmMembership = {
  firm_id: string;
  role: "admin" | "comptable" | "assistant";
  firms: { id: string; name: string } | null;
};

export function useFirm() {
  return useQuery({
    queryKey: ["firm"],
    queryFn: async (): Promise<FirmMembership | null> => {
      const { data, error } = await supabase
        .from("firm_members")
        .select("firm_id, role, firms(id, name)")
        .order("created_at", { ascending: true })
        .limit(1);
      if (error) throw error;
      return (data?.[0] as unknown as FirmMembership) ?? null;
    },
  });
}
