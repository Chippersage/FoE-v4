// // UserContext.js
// /*eslint-disable*/
// import React, { createContext, useContext, useState, useEffect } from 'react';
// const UserContext = createContext();
// export const UserProvider = ({ children }) => {
//   const [userType, setUserType] = useState(localStorage.getItem('userType'));
//   const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
//   useEffect(() => {
//     localStorage.setItem('userType', userType);
//   }, [userType]);
//   useEffect(() => {
//     localStorage.setItem('orgId', orgId);
//   }, [orgId]);
//   return <UserContext.Provider value={{ userType, setUserType, orgId, setOrgId }}>{children}</UserContext.Provider>;
// };
// export const useUser = () => useContext(UserContext);
// /* eslint-enable */
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userType, setUserType] = useState(() => {
    // Initialize from localStorage with validation
    const storedUserType = localStorage.getItem('userType');
    return ['superAdmin', 'orgAdmin'].includes(storedUserType) ? storedUserType : null;
  });

  const [orgId, setOrgId] = useState(() => {
    // Only set orgId if userType is orgAdmin
    return userType === 'orgAdmin' ? localStorage.getItem('orgId') : null;
  });

  // Enhanced setUserType to handle logout and type setting
  const enhancedSetUserType = (type) => {
    if (['superAdmin', 'orgAdmin', null].includes(type)) {
      setUserType(type);
      if (type) {
        localStorage.setItem('userType', type);
      } else {
        localStorage.removeItem('userType');
      }
    }
  };

  // Enhanced setOrgId to handle org-specific logic
  const enhancedSetOrgId = (id) => {
    if (userType === 'orgAdmin' || id === null) {
      setOrgId(id);
      if (id) {
        localStorage.setItem('orgId', id);
      } else {
        localStorage.removeItem('orgId');
      }
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        userType, 
        setUserType: enhancedSetUserType, 
        orgId, 
        setOrgId: enhancedSetOrgId 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);