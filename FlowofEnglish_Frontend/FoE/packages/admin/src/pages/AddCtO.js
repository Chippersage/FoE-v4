/*eslint-disable*/
import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardActionArea, CardContent } from '@mui/material';
import { Link } from 'react-router-dom'; // Assuming you are using react-router for navigation
import { getOrgs } from '../api'; // Ensure the API functions are correctly imported

const OrganizationList = () => {
  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    // Fetch organization details on component mount
    getOrgs().then((res) => {
      // console.log(res);
      setOrgs(res);
    });
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mb: 10 }}>
        Click on the Organisation To modify their courses
      </Typography>
      {orgs.map((org) => (
        <Card key={org.id} sx={{ marginBottom: 2 }}>
          <CardActionArea component={Link} to={`/dashboard/addctoc/${org.id}`}>
            <CardContent>
              <Typography variant="h6">{org.organisation_name}</Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Container>
  );
};

export default OrganizationList;

/* eslint-enable */
