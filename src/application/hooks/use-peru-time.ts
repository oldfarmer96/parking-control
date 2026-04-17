import { useState, useEffect } from "react";

export const usePeruTime = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updatePeruTime = () => {
      setTime(new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).format(new Date()));
    };

    updatePeruTime();
    const intervalId = setInterval(updatePeruTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return time;
};
