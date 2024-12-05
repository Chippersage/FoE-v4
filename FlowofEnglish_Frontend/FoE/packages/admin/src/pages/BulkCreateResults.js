import React from 'react';
import { Alert as MuiAlert, Accordion, AccordionDetails, AccordionSummary, Box, Card, CardContent, CardHeader, Typography } from '@mui/material';
import { CheckCircle, Error, Warning } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const BulkCreateResults = ({ results }) => {
  const {
    createdUserCount,
    createdUserCohortMappingCount,
    errorCount,
    warningCount,
    errors = [],
    warnings = []
  } = results;

  // Group errors by type
  const groupedErrors = {
    userType: errors.filter(err => err.includes('Invalid userType')),
    cohortMapping: errors.filter(err => err.includes('Error mapping')),
    other: errors.filter(err => !err.includes('Invalid userType') && !err.includes('Error mapping'))
  };

  // Group warnings by type
  const groupedWarnings = {
    phoneNumber: warnings.filter(warn => warn.includes('Invalid phone number')),
    other: warnings.filter(warn => !warn.includes('Invalid phone number'))
  };

  return (
    <Box className="space-y-6 w-full max-w-3xl">
      {/* Summary Card */}
      <Card>
        <CardHeader title="Bulk Creation Results" />
        <CardContent>
          <MuiAlert severity="success" icon={<CheckCircle fontSize="inherit" />}>
            <Typography variant="h6">Success Statistics</Typography>
            <ul>
              <li>{createdUserCount} users created successfully</li>
              <li>{createdUserCohortMappingCount} cohort mappings created</li>
            </ul>
          </MuiAlert>

          {(errorCount > 0 || warningCount > 0) && (
            <MuiAlert severity="warning" icon={<Warning fontSize="inherit" />}>
              <Typography variant="h6">Issues Found</Typography>
              <ul>
                {errorCount > 0 && <li>{errorCount} errors occurred</li>}
                {warningCount > 0 && <li>{warningCount} warnings generated</li>}
              </ul>
            </MuiAlert>
          )}
        </CardContent>
      </Card>

      {/* Errors Accordion */}
      {errorCount > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<Error />} id="error-summary">
            <Typography color="error">Errors ({errorCount})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {Object.entries(groupedErrors).map(([type, typeErrors]) => (
                typeErrors.length > 0 && (
                  <Box key={type} mb={2}>
                    <Typography variant="body1" color="error">{`${type}:`}</Typography>
                    <ul>
                      {typeErrors.map((error, index) => (
                        <li key={index} style={{ color: 'red' }}>{error}</li>
                      ))}
                    </ul>
                  </Box>
                )
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Warnings Accordion */}
      {warningCount > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<Warning />} id="warning-summary">
            <Typography color="warning">Warnings ({warningCount})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {Object.entries(groupedWarnings).map(([type, typeWarnings]) => (
                typeWarnings.length > 0 && (
                  <Box key={type} mb={2}>
                    <Typography variant="body1" color="warning">{`${type}:`}</Typography>
                    <ul>
                      {typeWarnings.map((warning, index) => (
                        <li key={index} style={{ color: 'orange' }}>{warning}</li>
                      ))}
                    </ul>
                  </Box>
                )
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};

export default BulkCreateResults;