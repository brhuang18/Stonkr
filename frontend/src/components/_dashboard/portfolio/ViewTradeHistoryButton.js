import React from 'react'
import axios from 'axios'
import { Icon } from '@iconify/react';
import link from '@iconify/icons-eva/external-link-outline';
import { useParams, useNavigate } from 'react-router-dom'

import {
  IconButton,
  Tooltip,
} from '@mui/material';

export default function ViewTradeHistoryButton (props) {
  const { cur_graph, ticker } = props
  const params = useParams()
  const navigate = useNavigate()
  const [user_id, setuser_id] = React.useState(-1)

  React.useEffect(() => {
    axios.get(`http://127.0.0.1:8000/portfolio/?portfolio_id=${params.portfolio_id}`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      setuser_id(res.data.user_id)
    }).catch(function (err) {
      console.log(err)
    })
  }, [])

  return (
    <>
      {user_id == localStorage.getItem("user_id") ? (
        <Tooltip title="View Details">
          <IconButton onClick={() => {
            navigate(`/dashboard/portfolio/${params.portfolio_id}/${cur_graph}/${ticker}`)
          }}>
            <Icon icon={link} width={20} height={20} />
          </IconButton>
        </Tooltip>
      ) : (
        <div/>
      )}
    </>
  )
}