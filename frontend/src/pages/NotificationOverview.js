// material
import { Box, Grid, Container, Typography } from '@mui/material';
// components
import Page from '../components/Page';
import {
  AppTasks,
  AppNewUsers,
  AppBugReports,
  AppItemOrders,
  AppNewsUpdate,
  AppWeeklySales,
  AppOrderTimeline,
  AppCurrentVisits,
  AppTrafficBySite,
  AppCurrentSubject,
  AppConversionRates
} from '../components/_dashboard/app';

import {
  CreateNotification,
  NotificationManageList,
  NotificationHistory,
} from 'src/components/_dashboard/notifications';

import {
  ProfileTitle
} from '../components/_dashboard/profile'

import React from 'react'

// ----------------------------------------------------------------------

export default function NotificationOverview() {
  const [data, setData] = React.useState([])

  return (
    <Page title="Notifications | Stonkr">
      <Container maxWidth="xl">
        <Box sx={{ pb: 5 }}>
          <Typography variant="h4">Notification Manager</Typography>
          <Typography variant="body">
            Use Stonkr to create custom stock notifications!
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12} md={12} lg={6}>
            <CreateNotification data={data} setData={setData} />
            <NotificationManageList data={data} setData={setData} />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={6}>
            <NotificationHistory />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
