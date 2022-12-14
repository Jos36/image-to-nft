import React, { useReducer } from "react";

export const defaultContext = {
  user: {},
  setUser: (data) => {},
};

export const Context = React.createContext(defaultContext);

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
};

export const ContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, defaultContext);

  return (
    <Context.Provider
      value={{
        ...state,
        setUser: (data) => {
          dispatch({ type: "SET_USER", payload: data });
          return data;
        },
      }}
    >
      {children}
    </Context.Provider>
  );
};
