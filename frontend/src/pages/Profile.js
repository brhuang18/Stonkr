// material
import { Box, Grid, Container, Typography } from '@mui/material';
import ProfileNavBar from 'src/components/_dashboard/profile/ProfileNavBar';
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
  ProfileTitle
} from '../components/_dashboard/profile'

import {
  Private
} from '../components/_dashboard/profile'

import React from 'react'
import axios from 'axios'
import ProfileAbout from './ProfileAbout';
import { Outlet, useParams, useLocation } from 'react-router';

import { is_current_user } from 'src/utils/check_auth';

// ----------------------------------------------------------------------

export default function Profile() {
  const params = useParams()
  const location = useLocation()
  const [user, setUser] = React.useState({
    email: "",
    first_name: "",
    followers: "",
    following: "",
    last_name: "",
    response: "",
    username: "",
  })

  React.useEffect(() => {
    let str = params.user_id
    if (params.user_id == 'me') {
      str = localStorage.getItem('user_id')
    }

    if (params.user_id != "me") {
      axios.get(`http://127.0.0.1:8000/search/user/?user=${str}`, {
        headers: {
          Authorization: 'Token ' + localStorage.getItem('user_token')
        }
      }, null).then(function (res) {
        setUser(res.data)
      }).catch(function (err) {
        console.log(err.response)
      })
    } else {
      axios.get(`http://127.0.0.1:8000/user/view?user_id=${str}`, {
        headers: {
          Authorization: 'Token ' + localStorage.getItem('user_token')
        }
      }, null).then(function (res) {
        console.log(res.data)
        setUser(res.data)
      }).catch(function (err) {
        console.log(err.response)
      })
    }
  }, [location])

  return (
    <Page title="Profile | Stonkr">
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ProfileTitle user={user} setUser={setUser} />
          </Grid>
          <Grid item xs={12} sm={12} lg={3}>
            <ProfileAbout user={user} setUser={setUser} />
          </Grid>
          <Grid item xs={12} sm={12} lg={9}>
            { user.response == "Success" || params.user_id == "me" ? 
              <>
                <ProfileNavBar /> 
                <Outlet />
              </>
              : 
              <Private />
            }
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
