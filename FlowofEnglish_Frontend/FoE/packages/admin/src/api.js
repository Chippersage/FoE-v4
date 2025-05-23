// api.js
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

// Organizations API calls
export const getOrgs = async () => {
  try {
    const response = await axios.get(`${apiUrl}/organizations`);
    console.log('Organizations API Response:', response);
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

export const getOrgPrograms = async (organizationId) => {
  try {
    const response = await axios.get(`${apiUrl}/organizations/${organizationId}/programs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching organization programs:', error);
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
    return response;  // Ensure the response is returned, not just the data
  } catch (error) {
    console.error('Error creating organization:', error);
    return null;  // Return null in case of error
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
    return response;
  } catch (error) {
    console.error('Error updating organization:', error);
    return { status: 400, message: 'Error updating organization' };
  }
};

// Delete an organization by ID
export const deleteOrg = async (organizationId) => {
  try {
    const response = await axios.delete(`${apiUrl}/organizations/${organizationId}`);
    return response;  // Return the full response so we can check for success/failure
  } catch (error) {
    console.error('Error deleting organization:', error);
    return null;  // Return null in case of an error
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

export async function getOrgCohorts(organizationId) {
  try {
    const res = await axios.get(`${apiUrl}/cohorts/organization/${organizationId}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Error fetching organization cohorts');
  }
}

export async function getOrgProgramSubscriptions(organizationId) {
  try {
    const res = await axios.get(`${apiUrl}/subscriptions/organization/${organizationId}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Error fetching organization program subscriptions');
  }
}
// Create a new Program Subscription
export const createSubscription = async (data) => {
  try {
    const response = await axios.post(`${apiUrl}/subscriptions`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return { status: 'success', data: response.data };
  } catch (error) {
    console.error('Error creating subscription:', error);
    return { status: 'fail', message: error.response?.data?.message || 'Error creating subscription' };
  }
};

// Update an existing Program Subscription
export const updateSubscription = async (subscriptionId, data) => {
  try {
    const response = await axios.put(`${apiUrl}/subscriptions/${subscriptionId}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return { status: 'success', data: response.data };
  } catch (error) {
    console.error('Error updating subscription:', error);
    return { status: 'fail', message: error.response?.data?.message || 'Error updating subscription' };
  }
};

// Get a Program Subscription by ID
export const getSubscription = async (subscriptionId) => {
  try {
    const response = await axios.get(`${apiUrl}/subscriptions/${subscriptionId}`);
    return { status: 'success', data: response.data };
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return { status: 'fail', message: error.response?.data?.message || 'Error fetching subscription' };
  }
};

// Get all Program Subscriptions
export const getAllSubscriptions = async () => {
  try {
    const response = await axios.get(`${apiUrl}/subscriptions`);
    return { status: 'success', data: response.data };
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return { status: 'fail', message: error.response?.data?.message || 'Error fetching subscriptions' };
  }
};

// Delete a Program Subscription by ID
export const deleteSubscription = async (subscriptionId) => {
  try {
    const response = await axios.delete(`${apiUrl}/subscriptions/${subscriptionId}`);
    return { status: 'success', message: 'Subscription deleted successfully' };
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return { status: 'fail', message: error.response?.data?.message || 'Error deleting subscription' };
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
    console.error("Error creating user:", err);
    return { success: false, error: err.message };
  }
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

// API function to update user
export async function updateUser(id, data) {
  try {
    // Make sure status is uppercase for consistency
    if (data.status) {
      data.status = data.status.toUpperCase();
    }
    
    const res = await axios.put(`${apiUrl}/users/${id}`, data);
    return res.data;
  } catch (err) {
    console.log('Error in updateUser:', err);
    // Return more detailed error message from the server if available
    return { 
      success: false, 
      message: err.response?.data?.message || 'Server error occurred during update'
    };
  }
}

// API function to get user status options
export function getUserStatusOptions() {
  return [
    { value: "ACTIVE", label: "Active" },
    { value: "DISABLED", label: "Disabled" }
  ];
}

// API function to check if user is active in any cohort
export async function isUserActiveInAnyCohort(userId) {
  try {
    const res = await axios.get(`${apiUrl}/users/${userId}/active-in-cohorts`);
    return res.data;
  } catch (err) {
    console.log('Error checking if user is active in cohorts:', err);
    return { active: false };
  }
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

// Function to get User Session Mappings by User ID
export async function getUserSessionMappingsByUserId(userId) {
  try {
    const res = await axios.get(`${apiUrl}/user-session-mappings/user/${userId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching user session mappings:", err);
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
  // console.log("Cohort ID received:", cohortId); // Log the received cohortId
  
  try {
    const response = await axios.get(`${apiUrl}/user-cohort-mappings/cohort/${cohortId}/learner`);
    
    // console.log("Response received for Cohort ID:", cohortId); // Log the response for the given cohortId
    // console.log("Response data:", response.data); // Log the actual response data
    
    return response.data;
  } catch (error) {
    // console.error("Error fetching UserCohortMapping:", error);
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


export async function updateUserCohortMapping(userId, cohortId, data) {
  try {
    const response = await axios.put(`${apiUrl}/user-cohort-mappings/user/${userId}/cohort/${cohortId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating UserCohortMapping:", error);
  }
  return null;
}


export async function importUserCohortMappings(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${apiUrl}/user-cohort-mappings/bulkcreate`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data; // The map with success and error messages
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
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

// // Submit a new assignment
// export const submitAssignment = async (userId, cohortId, programId, stageId, unitId, subconceptId, file) => {
//   try {
//     const formData = new FormData();
//     formData.append('userId', userId);
//     formData.append('cohortId', cohortId);
//     formData.append('programId', programId);
//     formData.append('stageId', stageId);
//     formData.append('unitId', unitId);
//     formData.append('subconceptId', subconceptId);
//     formData.append('file', file);

//     const response = await axios.post(`${apiUrl}/assignments/submit`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     console.log('Assignment submission successful:', response.data);
//     return {
//       success: true,
//       data: response.data,
//       message: 'Assignment submitted successfully'
//     };
//   } catch (error) {
//     console.error('Error submitting assignment:', error);
//     return {
//       success: false,
//       message: error.response?.data?.message || 'Failed to submit assignment. Please try again.'
//     };
//   }
// };

// Submit a corrected assignment
export const submitCorrectedAssignment = async (assignmentId, score, file) => {
  try {
    const formData = new FormData();
    formData.append('score', score);
    formData.append('file', file);

    const response = await axios.post(`${apiUrl}/assignments/${assignmentId}/correct`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      success: true,
      data: response.data,
      message: 'Corrected assignment submitted successfully'
    };
  } catch (error) {
    console.error('Error submitting corrected assignment:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to submit corrected assignment. Please try again.'
    };
  }
};

// Get assignments by user ID
export const getAssignmentsByUserId = async (userId) => {
  try {
    const response = await axios.get(`${apiUrl}/assignments/user/${userId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching user assignments:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch user assignments.'
    };
  }
};

// Get assignments by cohort ID
export const getAssignmentsByCohortId = async (cohortId) => {
  try {
    const response = await axios.get(`${apiUrl}/assignments/cohort/${cohortId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching cohort assignments:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch cohort assignments.'
    };
  }
};

// Get assignments by cohort ID and user ID
export const getAssignmentsByCohortIdAndUserId = async (cohortId, userId) => {
  try {
    const response = await axios.get(`${apiUrl}/assignments/cohort/${cohortId}/user/${userId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching assignments for user and cohort:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch user and cohort assignments.'
    };
  }
};

// Download all assignments for a cohort
export const downloadAllAssignments = async (cohortId) => {
  try {
    const response = await axios.get(`${apiUrl}/assignments/bulk-download?cohortId=${cohortId}`, {
      responseType: 'blob', // Important for file downloads
    });
    
    // Create a download link and trigger it
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'assignments.zip');
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return {
      success: true,
      message: 'Download successful'
    };
  } catch (error) {
    console.error('Error downloading assignments:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to download assignments.'
    };
  }
};

// Upload multiple corrected assignments
export const uploadCorrectedAssignments = async (files, scores, assignmentIds) => {
  try {
    const formData = new FormData();
    
    // Ensure we have matching counts
    if (files.length !== scores.length || scores.length !== assignmentIds.length) {
      return {
        success: false,
        message: 'Mismatched number of files, scores, and assignment IDs.'
      };
    }
    
    // Append all files, scores, and assignment IDs to the form data
    files.forEach(file => formData.append('files', file));
    scores.forEach(score => formData.append('scores', score));
    assignmentIds.forEach(id => formData.append('assignmentIds', id));
    
    const response = await axios.post(`${apiUrl}/assignments/bulk-upload-corrected`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return {
      success: true,
      message: response.data || 'Corrected assignments uploaded successfully'
    };
  } catch (error) {
    console.error('Error uploading corrected assignments:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to upload corrected assignments.'
    };
  }
};

// Get submitted file for an assignment
export const getSubmittedFile = async (assignmentId) => {
  try {
    const response = await axios.get(`${apiUrl}/assignments/${assignmentId}/file`, {
      responseType: 'blob',
    });
    
    // Extract filename from content disposition header if available
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'assignment-file';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch && filenameMatch.length === 2) {
        filename = filenameMatch[1];
      }
    }
    
    // Create a download link and trigger it
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return {
      success: true,
      message: 'File downloaded successfully'
    };
  } catch (error) {
    console.error('Error downloading submitted file:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to download submitted file.'
    };
  }
};

// Get corrected file for an assignment
export const getCorrectedFile = async (assignmentId) => {
  try {
    const response = await axios.get(`${apiUrl}/assignments/${assignmentId}/corrected-file`, {
      responseType: 'blob',
    });
    
    // Extract filename from content disposition header if available
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'corrected-assignment';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch && filenameMatch.length === 2) {
        filename = filenameMatch[1];
      }
    }
    
    // Create a download link and trigger it
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return {
      success: true,
      message: 'Corrected file downloaded successfully'
    };
  } catch (error) {
    console.error('Error downloading corrected file:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to download corrected file.'
    };
  }
};

// Get assignment by ID
export const getAssignmentById = async (assignmentId) => {
  try {
    const response = await axios.get(`${apiUrl}/assignments/${assignmentId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching assignment details:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch assignment details.'
    };
  }
};

// Programs API calls

export async function getPrograms() {
  try {
    const res = await axios.get(`${apiUrl}/programs`);
    console.log('Programs API Response:', res);
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


// CohortProgram API calls

// Fetch all Cohort Programs
export const getCohortPrograms = async () => {
  try {
    const response = await axios.get(`${apiUrl}/cohortprogram`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cohort programs:', error);
    return null;
  }
};

// Fetch a Cohort Program by ID
export const getCohortProgram = async (cohortProgramId) => {
  try {
    const response = await axios.get(`${apiUrl}/cohortprogram/${cohortProgramId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching cohort program with ID ${cohortProgramId}:`, error);
    return null;
  }
};

// Create a new Cohort Program
export const createCohortProgram = async (data) => {
  try {
    const response = await axios.post(`${apiUrl}/cohortprogram/create`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating cohort program:', error);
    return null;
  }
};

// Delete a Cohort Program by ID
export const deleteCohortProgram = async (cohortProgramId) => {
  try {
    const response = await axios.delete(`${apiUrl}/cohortprogram/${cohortProgramId}`);
    return response.status === 204; // Return true if deletion is successful
  } catch (error) {
    console.error(`Error deleting cohort program with ID ${cohortProgramId}:`, error);
    return false;
  }
};



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


