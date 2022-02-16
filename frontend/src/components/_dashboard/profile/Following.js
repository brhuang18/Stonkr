import React from 'react'
import axios from 'axios'
import { useParams } from 'react-router'
import { FollowingPortfolio } from '.'
import FollowingWatchlist from './FollowingWatchlist'
import LoadingScreen from '../../../components/LoadingScreen';

export default function Following () {
  const params = useParams()
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState({

  })

  const handleLoading = () => {
    setLoading(true);
  }
  
  React.useEffect(()=>{
    window.addEventListener("load",handleLoading);
    return () => window.removeEventListener("load",handleLoading);
  },[])

  React.useEffect(() => {
    let str = params.user_id
    if (str == 'me') {
      str = localStorage.getItem('user_id')
    }

    axios.get(`http://127.0.0.1:8000/user/getFollowed?user=${str}`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      console.log(res.data)
      setData(res.data)
      setLoading(false)
    }).catch(function (err) {
      console.log(err)
    })
  }, [])


  return (
    <div>
      { loading ? (
        (<LoadingScreen></LoadingScreen>)
      ) : (
        <div>
          <FollowingPortfolio portfolio={data.portfolios} />
          <FollowingWatchlist watchlist={data.watchlists} />
        </div>
      )}
    </div>
  )
}