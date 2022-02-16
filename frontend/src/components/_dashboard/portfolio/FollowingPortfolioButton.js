import {
  Tooltip,
  Button,
} from '@mui/material';

import follow from '@iconify/icons-eva/person-add-fill';
import unfollow from '@iconify/icons-eva/person-delete-fill';
import { Icon } from '@iconify/react';
import axios from 'axios'
import { useParams } from 'react-router';
import React from 'react'

export default function FollowingPortfolioButton () {
  const params = useParams()
  const [following, setFollowing] = React.useState()
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    axios.get(`http://127.0.0.1:8000/portfolio/overview?portfolio_id=${params.portfolio_id}`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      if (res.data.user_id != localStorage.getItem("user_id")) {
        axios.get(`http://127.0.0.1:8000/user/isFollowingPortfolio?portfolio_id=${params.portfolio_id}`, {
          headers: {
            Authorization: 'Token ' + localStorage.getItem("user_token")
          }
        }, null).then(function (res) {
          setFollowing(res.data.is_following)
          setLoading(false)
        }).catch(function (err) {
          console.log(err)
        })
      }
    }).catch(function (err) {
      console.log(err)
    })
  }, [])
  
  function handleFollow () {
    axios.post('http://127.0.0.1:8000/user/followPortfolio/', {
      user: localStorage.getItem("user_id"),
      portfolio: params.portfolio_id,
    }, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }).then(function (res) {
      setFollowing(true)
    }).catch(function (err) {
      console.log(err.response)
    })
  } 

  function handleUnfollow () {
    const data = {
      user: localStorage.getItem("user_id"),
      portfolio: params.portfolio_id,
    }

    axios.delete('http://127.0.0.1:8000/user/unfollowPortfolio/', {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }, data
    }).then(function (res) {
      setFollowing(false)
    }).catch(function (err) {
      console.log(err)
    })
  } 

  return (
    <div>
      {loading ? (
        <div />
      ) : (
        <div>
          {following ? (
            <Tooltip title="Unfollow Portfolio">
              <Button variant="outlined" startIcon={<Icon icon={unfollow} />} onClick={handleUnfollow}>
                Unfollow
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Follow Portfolio">
              <Button variant="outlined" startIcon={<Icon icon={follow} />} onClick={handleFollow}>
                Follow
              </Button>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  )
}
