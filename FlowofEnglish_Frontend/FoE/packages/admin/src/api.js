// api.js
import axios from 'axios';

const apiUrl ='https://flowofenglish.thechippersage.com/api/v1';

// Organisations API calls

// Get all organizations
export const getOrgs = async () => {
  try {
    const response = await axios.get(`${apiUrl}/organizations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return null;
  }
};

export const getOrg = async (organizationId) => {
  try {
    const response = await axios.get(`${apiUrl}/organizations/${organizationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching organization:', error);
    return null;
  }
};

// Create a new organization
export const createOrg = async (data) => {
  try {
    const response = await axios.post(`${apiUrl}/organizations/create`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating organization:', error);
    return null;
  }
};

// Update an existing organization
export const updateOrg = async (organizationId, data) => {
  try {
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    const response = await axios.put(`${apiUrl}/organizations/${organizationId}`, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating organization:', error);
    return null;
  }
};


// Delete an organization by ID
export const deleteOrg = async (organizationId) => {
  try {
    const response = await axios.delete(`${apiUrl}/organizations/${organizationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting organization:', error);
    return null;
  }
};

// Delete multiple organizations (if supported by your API)
export const deleteOrgs = async (organizationIds) => {
  try {
    const response = await axios.delete(`${apiUrl}/organizations`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: { organizationIds }, // Pass IDs in request body for bulk delete
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting organizations:', error);
    return null;
  }
};

// Cohorts API calls

export async function getCohorts() {
  try {
    const res = await axios.get(`${apiUrl}/cohorts`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Error fetching cohorts');
  }
}

export async function getOrgCohorts(organizationId) {
  try {
    const res = await axios.get(`${apiUrl}/cohorts/organization/${organizationId}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Error fetching organization cohorts');
  }
}

export async function createCohort(data) {
  try {
    const res = await axios.post(`${apiUrl}/cohorts/create`, data);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Error creating cohort');
  }
}

export async function updateCohort(id, data) {
  try {
    const res = await axios.put(`${apiUrl}/cohorts/${id}`, data);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Error updating cohort');
  }
}

export async function deleteCohort(id) {
  try {
    const res = await axios.delete(`${apiUrl}/cohorts/${id}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Error deleting cohort');
  }
}

// Users API calls

export async function getUsers() {
  try {
    const res = await axios.get(`${apiUrl}/users`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function createUser(data) {
  try {
    const res = await axios.post(`${apiUrl}/users/create`, data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}


export async function createUsers(data) {
  try {
      const res = await axios.post(`${apiUrl}/users/bulkcreate/csv`, data);
      return res.data;
  } catch (err) {
      console.error('API error:', err);
      return { 
          message: 'Error processing CSV file.',
          errors: err.response?.data?.errors || []
      };
  }
}

export async function deleteUser(id) {
  try {
    const res = await axios.delete(`${apiUrl}/users/${id}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function deleteUsers(userIds) {
  try {
    const response = await axios({
      method: 'delete',
      url: `${apiUrl}/users/bulk-delete`,
      data: { userIds },
      headers: { 'Content-Type': 'application/json' }
    });
    console.log("Delete response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting users:", error);
    throw error;
  }
}

export async function getUser(id) {
  try {
    const res = await axios.get(`${apiUrl}/users/${id}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function updateUser(id, data) {
  try {
    const res = await axios.put(`${apiUrl}/users/${id}`, data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function getOrgUsers(organizationId) {
  try {
    const res = await axios.get(`${apiUrl}/users/organization/${organizationId}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

// UserCohortMappings API Calls

// Get all UserCohortMappings
export async function getUserCohortMappings() {
  try {
    const response = await axios.get(`${apiUrl}/user-cohort-mappings`);
    return response.data;
  } catch (error) {
    console.error("Error fetching UserCohortMappings:", error);
  }
  return null;
}

export async function getCohortMapping(cohortId) {
  console.log("Cohort ID received:", cohortId); // Log the received cohortId
  
  try {
    const response = await axios.get(`${apiUrl}/user-cohort-mappings/cohort/${cohortId}`);
    
    console.log("Response received for Cohort ID:", cohortId); // Log the response for the given cohortId
    console.log("Response data:", response.data); // Log the actual response data
    
    return response.data;
  } catch (error) {
    console.error("Error fetching UserCohortMapping:", error); 
  }
  
  return null; // In case of error, return null
}


export async function getUserCohortMapping(userId) {
  try {
    const response = await axios.get(`${apiUrl}/user-cohort-mappings/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching UserCohortMapping:", error);
  }
  return null;
}

// Create a new UserCohortMapping

export async function createUserCohortMapping(data) {
  try {
    const response = await axios.post(`${apiUrl}/user-cohort-mappings/create`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating UserCohortMapping:", error);
    return null;
  }
}


export async function updateUserCohortMapping(userId, data) {
  try {
    const response = await axios.put(`${apiUrl}/user-cohort-mappings/user/${userId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating UserCohortMapping:", error);
  }
  return null;
}


export async function deleteUserCohortMapping(userId) {
  try {
    const response = await axios.delete(`${apiUrl}/user-cohort-mappings/user${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting UserCohortMapping:", error);
  }
  return null;
}






// Programs API calls

export async function getPrograms() {
  try {
    const res = await axios.get(`${apiUrl}/programs`);
    // console.log(res);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export const getSelectedPrograms = async (organisationId) => {
  const response = await fetch(`${apiUrl}/organisations/${organisationId}/programs`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};


export async function createProgram(data) {
  try {
    const res = await axios.post(`${apiUrl}/programs/create`, data);
    // console.log(res);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}


export async function updateProgram(id, data) {
  try {
    const res = await axios.put(`${apiUrl}/programs/${id}`, data);
    // console.log(res);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function deleteProgram(id) {
  try {
    const res = await axios.delete(`${apiUrl}/programs/${id}`);
    // console.log(res);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function deletePrograms(ids) {
  // console.log('ids', ids);
  try {
    const res = await axios.post(`${apiUrl}/programs/delete`, ids);
    // console.log(res);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}


// Unit API calls
export async function getLevels() {
  try {
    const res = await axios.get(`${apiUrl}/units`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}


export async function getProgramLevels(id) {
  try {
    const res = await axios.get(`${apiUrl}/units/program/${id}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}


export async function createLevel(data) {
  try {
    const res = await axios.post(`${apiUrl}/units/create`, data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}


export async function updateLevel(id, data) {
  try {
    const res = await axios.put(`${apiUrl}/units/${id}`, data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function deleteLevel(id) {
  try {
    const res = await axios.delete(`${apiUrl}/units/${id}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}



export async function deleteLevels(ids) {
  // console.log('ids', ids);
  try {
    const res = await axios.post(`${apiUrl}/units/delete`, ids);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

// CohortProgram API calls

export async function getCohortProgram(cohortId, programId, unitId) {
  try {
    const res = await axios.get(`${apiUrl}/cohortprogram/${cohortId}/${unitId}/${programId}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function createCohortProgram(data) {
  try {
    const res = await axios.post(`${apiUrl}/cohortprogram`, data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function deleteCohortProgram(cohortProgramId) {
  try {
    const res = await axios.delete(`${apiUrl}/cohortprogram/${cohortProgramId}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

// Concept API calls

export async function getConcepts() {
  try {
    const res = await axios.get(`${apiUrl}/concepts`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function getConcept(conceptId) {
  try {
    const res = await axios.get(`${apiUrl}/concepts/${conceptId}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function createConcept(data) {
  try {
    const res = await axios.post(`${apiUrl}/concepts/create`, data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function updateConcept(conceptId, data) {
  try {
    const res = await axios.put(`${apiUrl}/concepts/${conceptId}`, data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function deleteConcept(conceptId) {
  try {
    const res = await axios.delete(`${apiUrl}/concepts/${conceptId}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

 // Subconcepts API Calls

// Get all Subconcepts
export async function getSubconcepts() {
  try {
    const response = await axios.get(`${apiUrl}/subconcepts`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Subconcepts:", error);
  }
  return null;
}

// Get a specific Subconcept by ID
export async function getSubconcept(subconceptId) {
  try {
    const response = await axios.get(`${apiUrl}/subconcepts/${subconceptId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Subconcept:", error);
  }
  return null;
}

// Create a new Subconcept
export async function createSubconcept(data) {
  try {
    const response = await axios.post(`${apiUrl}/subconcepts/create`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating Subconcept:", error);
  }
  return null;
}

// Update an existing Subconcept by ID
export async function updateSubconcept(subconceptId, data) {
  try {
    const response = await axios.put(`${apiUrl}/subconcepts/${subconceptId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating Subconcept:", error);
  }
  return null;
}

// Delete a Subconcept by ID
export async function deleteSubconcept(subconceptId) {
  try {
    const response = await axios.delete(`${apiUrl}/subconcepts/${subconceptId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting Subconcept:", error);
  }
  return null;
}


// ProgramConceptsMappings API calls

export async function getProgramConceptsMappings() {
  try {
    const response = await axios.get(`${apiUrl}/programconceptsmappings`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Program Concepts Mappings:", error);
  }
  return null;
}

export async function getProgramConceptsMapping(programConceptId) {
  try {
    const response = await axios.get(`${apiUrl}/programconceptsmappings/${programConceptId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Program Concepts Mapping:", error);
  }
  return null;
}

export async function createProgramConceptsMapping(data) {
  try {
    const response = await axios.post(`${apiUrl}/programconceptsmappings/create`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating Program Concepts Mapping:", error);
  }
  return null;
}

export async function updateProgramConceptsMapping(programConceptId, data) {
  try {
    const response = await axios.put(`${apiUrl}/programconceptsmappings/${programConceptId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating Program Concepts Mapping:", error);
  }
  return null;
}

export async function deleteProgramConceptsMapping(programConceptId) {
  try {
    const response = await axios.delete(`${apiUrl}/programconceptsmappings/${programConceptId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting Program Concepts Mapping:", error);
  }
  return null;
}

// LevelUnitMapping API calls

export async function getLevelUnitMappings() {
  try {
    const res = await axios.get(`${apiUrl}/levelunitmappings`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function getLevelUnitMapping(levelId) {
  try {
    const res = await axios.get(`${apiUrl}/levelunitmappings/${levelId}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function createLevelUnitMapping(data) {
  try {
    const res = await axios.post(`${apiUrl}/levelunitmappings/create`, data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function updateLevelUnitMapping(levelId, data) {
  try {
    const res = await axios.put(`${apiUrl}/levelunitmappings/${levelId}`, data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function deleteLevelUnitMapping(levelId) {
  try {
    const res = await axios.delete(`${apiUrl}/levelunitmappings/${levelId}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}


// Languages API calls

export async function getLangs() {
  try {
    const res = await axios.get(`${apiUrl}/languages`);
    // console.log(res);
    // console.log(res.data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function createLang(data) {
  try {
    const res = await axios.post(`${apiUrl}/languages`, data);
    // console.log(res);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function updateLang(id, data) {
  try {
    const res = await axios.put(`${apiUrl}/languages/${id}`, data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function deleteLang(id) {
  try {
    const res = await axios.delete(`${apiUrl}/languages/${id}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function deleteLangs(ids) {
  // console.log('ids', ids);
  try {
    const res = await axios.post(`${apiUrl}/languages/delete`, ids);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}


// UserAttempts API Calls

// Get all UserAttempts
export async function getUserAttempts() {
  try {
    const response = await axios.get(`${apiUrl}/user-attempts`);
    return response.data;
  } catch (error) {
    console.error("Error fetching UserAttempts:", error);
  }
  return null;
}

// Get a specific UserAttempt by userAttemptId
export async function getUserAttempt(userAttemptId) {
  try {
    const response = await axios.get(`${apiUrl}/user-attempts/${userAttemptId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching UserAttempt:", error);
  }
  return null;
}

// Create a new UserAttempt
export async function createUserAttempt(data) {
  try {
    const response = await axios.post(`${apiUrl}/user-attempts`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating UserAttempt:", error);
  }
  return null;
}

// Update an existing UserAttempt by userAttemptId
export async function updateUserAttempt(userAttemptId, data) {
  try {
    const response = await axios.put(`${apiUrl}/user-attempts/${userAttemptId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating UserAttempt:", error);
  }
  return null;
}

// Delete a UserAttempt by userAttemptId
export async function deleteUserAttempt(userAttemptId) {
  try {
    const response = await axios.delete(`${apiUrl}/user-attempts/${userAttemptId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting UserAttempt:", error);
  }
  return null;
}

// UserSessionMappings API Calls
// Get all UserSessionMappings
export async function getUserSessionMappings() {
  try {
    const response = await axios.get(`${apiUrl}/user-session-mappings`);
    return response.data;
  } catch (error) {
    console.error("Error fetching UserSessionMappings:", error);
  }
  return null;
}

// Get a specific UserSessionMapping by sessionId
export async function getUserSessionMapping(sessionId) {
  try {
    const response = await axios.get(`${apiUrl}/user-session-mappings/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching UserSessionMapping:", error);
  }
  return null;
}

// Create a new UserSessionMapping
export async function createUserSessionMapping(data) {
  try {
    const response = await axios.post(`${apiUrl}/user-session-mappings`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating UserSessionMapping:", error);
  }
  return null;
}

// Update an existing UserSessionMapping by sessionId
export async function updateUserSessionMapping(sessionId, data) {
  try {
    const response = await axios.put(`${apiUrl}/user-session-mappings/${sessionId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating UserSessionMapping:", error);
  }
  return null;
}

// Delete a UserSessionMapping by sessionId
export async function deleteUserSessionMapping(sessionId) {
  try {
    const response = await axios.delete(`${apiUrl}/user-session-mappings/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting UserSessionMapping:", error);
  }
  return null;
}



// Din't updated

export async function getOrgPrograms(organisationId) {
  try {
    const res = await axios.get(`${apiUrl}/organisations/${organisationId}/Programs`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export const addProgramsToOrganization = async (organisationId, ProgramIds) => {
  try {
    const response = await axios.post(`${apiUrl}/organisations/add-cource-to-organisation`, {
      organisationId,
      ProgramIds,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to add Programs to organization: ${error.message}`);
  }
};

export async function getOrgLangs(id) {
  try {
    const res = await axios.get(`${apiUrl}/organisations/${id}/languages`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function getUserPrograms(id) {
  try {
    const res = await axios.get(`${apiUrl}/users/${id}/Programs`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}


export async function getAllWorkflowsByLevel(id) {
  try {
    const res = await axios.get(`${apiUrl}/workflows/levels/${id}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function createContentWorkflow(data) {
  try {
    const res = await axios.post(`${apiUrl}/content-masters/workflow`, data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function updateContentWorkflow(id, data) {
  try {
    const res = await axios.put(`${apiUrl}/content-masters/workflow/${id}`, data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function getLaststep(Program_id, level_id) {
  try {
    const res = await axios.get(`${apiUrl}/content-masters/laststep/${Program_id}/${level_id}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function runContentWorkflow() {
  try {
    const res = await axios.post(`${apiUrl}/workflows/run`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}


// get users by organisation id , level, Program
export async function getOrgCohortUsers(organisationId, cohortId, Program_id) {
  try {
    const res = await axios.get(`${apiUrl}/users/organization/${organisationId}/${cohortId}/${Program_id}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function deleteUserProgramInfo(id) {
  try {
    const res = await axios.delete(`${apiUrl}/user-Program/${id}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

// get user workflow logs
export async function getUserWorklogs(user_id) {
  try {
    const res = await axios.get(`${apiUrl}/workflow-logs/user/${user_id}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

// get user details
export async function getUserDetails(user_id) {
  // console.log('user_id', user_id);
  try {
    const res = await axios.get(`${apiUrl}/users/${user_id}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

// export users
export async function exportUsers(organizationId) {
  try {
    const res = await axios.get(`${apiUrl}/users/organization/${organizationId}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

// content CRUD operations
export async function getContents() {
  try {
    const res = await axios.get(`${apiUrl}/content-masters`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function updateContent(id, data) {
  try {
    const res = await axios.put(`${apiUrl}/content-masters/${id}`, data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function createContent(data) {
  try {
    const res = await axios.post(`${apiUrl}/content-masters/create`, data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function deleteContent(id) {
  // console.log('Delete Workflow', id);
  try {
    const res = await axios.delete(`${apiUrl}/content-masters/${id}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function deleteContents(id) {
  // console.log('ids', id);
  try {
    const res = await axios.delete(`${apiUrl}/content-masters/delete/${id}`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
  return null;
}