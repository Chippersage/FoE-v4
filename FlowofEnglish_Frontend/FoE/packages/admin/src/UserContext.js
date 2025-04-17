import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Initialize userType from localStorage
  const [userType, setUserType] = useState(() => {
    const storedUserType = localStorage.getItem('userType');
    return ['superAdmin', 'orgAdmin'].includes(storedUserType) ? storedUserType : null;
  });

  // Initialize orgId from localStorage regardless of userType
  // This is safer as it doesn't depend on userType being loaded correctly first
  const [orgId, setOrgId] = useState(() => {
    return localStorage.getItem('orgId') || null;
  });

  // Enhanced setUserType to handle localStorage syncing
  const handleSetUserType = (type) => {
    if (['superAdmin', 'orgAdmin', null].includes(type)) {
      setUserType(type);
      if (type) {
        localStorage.setItem('userType', type);
      } else {
        localStorage.removeItem('userType');
      }
    }
  };

  // Enhanced setOrgId to handle localStorage syncing
  // Removed the userType restriction to allow setting orgId in login flows
  const handleSetOrgId = (id) => {
    setOrgId(id);
    if (id) {
      localStorage.setItem('orgId', id);
    } else {
      localStorage.removeItem('orgId');
    }
  };

  // Validate consistency on mount and changes
  useEffect(() => {
    // If userType is not orgAdmin, but orgId exists, clear orgId
    // This ensures consistency between userType and orgId
    if (userType !== 'orgAdmin' && orgId) {
      handleSetOrgId(null);
    }
  }, [userType, orgId]);

  return (
    <UserContext.Provider 
      value={{ 
        userType, 
        setUserType: handleSetUserType, 
        orgId, 
        setOrgId: handleSetOrgId 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);