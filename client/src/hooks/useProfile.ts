import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import type { Candidat } from "@/types";

export function useProfile() {
  const { user } = useAuth();
  const [profil, setProfil] = useState<Candidat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .get<Candidat>(`/candidats/${user.id}`)
      .then((data) => {
        setProfil(data);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setProfil(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  return { profil, loading, error };
}
