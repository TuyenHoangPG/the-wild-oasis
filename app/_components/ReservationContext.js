"use client";
const { useContext, useState, createContext } = require("react");

const ReservationContext = createContext();
const initialState = {
  from: null,
  to: null,
};

function ReservationProvider({ children }) {
  const [range, setRange] = useState(initialState);

  function resetRange() {
    setRange(initialState);
  }

  return (
    <ReservationContext.Provider value={{ range, setRange, resetRange }}>
      {children}
    </ReservationContext.Provider>
  );
}

function useReservation() {
  const context = useContext(ReservationContext);

  if (!context) {
    throw new Error("useReservation must be used within a ReservationProvider");
  }

  return context;
}

export { ReservationProvider, useReservation };
