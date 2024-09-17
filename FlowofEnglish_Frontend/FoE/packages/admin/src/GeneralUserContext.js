// UserContext.js
/*eslint-disable*/
import React, { createContext, useContext, useState, useEffect } from 'react';
const GeneralUserContext = createContext();
export const GeneralUserProvider = ({ children }) => {
  const [userType, setUserType] = useState(localStorage.getItem('userType'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  useEffect(() => {
    localStorage.setItem('userType', userType);
  }, [userType]);
  useEffect(() => {
    localStorage.setItem('userId', userId);
  }, [userId]);
  return (
    <GeneralUserContext.Provider value={{ userType, setUserType, userId, setUserId }}>
      {children}
    </GeneralUserContext.Provider>
  );
};
export const useGeneralUser = () => useContext(GeneralUserContext);
/* eslint-enable */