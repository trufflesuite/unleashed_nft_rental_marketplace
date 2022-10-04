import { createContext, useContext, useEffect, useState } from "react";

const TimeContext = createContext();

function TimeProvider({ children }) {
  const [now, setNow] = useState(Math.ceil(Date.now() / 1000));

  useEffect(() => {
    const clock = setInterval(() => {
      const nextTick = Math.ceil(Date.now() / 1000);
      if (now !== nextTick) setNow(nextTick);
    }, 999);

    return () => clearInterval(clock);
  }, [now]);

  return (
    <TimeContext.Provider value={now}>
      {children}
    </TimeContext.Provider>
  );
}

const useTime = () => useContext(TimeContext);

export { TimeProvider, useTime };
