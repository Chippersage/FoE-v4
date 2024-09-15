// UserContext.js
/*eslint-disable*/
import React, { createContext, useContext, useState, useEffect } from 'react';
const UserContext = createContext();
export const UserProvider = ({ children }) => {
  const [userType, setUserType] = useState(localStorage.getItem('userType'));
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  useEffect(() => {
    localStorage.setItem('userType', userType);
  }, [userType]);
  useEffect(() => {
    localStorage.setItem('orgId', orgId);
  }, [orgId]);
  return <UserContext.Provider value={{ userType, setUserType, orgId, setOrgId }}>{children}</UserContext.Provider>;
};
export const useUser = () => useContext(UserContext);
/* eslint-enable */
