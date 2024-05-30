import { useEffect, useState } from "react";
import { supabase } from "../supabase";

const RealTimeUserProfile = (userId) => {
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("profile-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const updatedProfile = payload.new;
          setUserProfile(updatedProfile);
        }
      )
      .subscribe();

    // Fetch initial profile data
    const fetchUserProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error.message);
        return;
      }
      setUserProfile(data);
    };

    fetchUserProfile();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return userProfile;
};

export default RealTimeUserProfile;
