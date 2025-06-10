import { useEffect, useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("http://127.0.0.1:8000/api/me/", {
      headers: { Authorization: `Token ${token}` },
    })
      .then(res => {
        if (res.ok) return res.json();
        localStorage.removeItem("token");
        setUser(null);
        return null;
      })
      .then(data => {
        if (data && data.email) setUser(data);
        else setUser(null);
      });
  }, []);

  return { user, setUser };
}