import { merge } from 'lodash';
import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
//
import BaseOptionChart from './BaseOptionChart';
import { Card, CardHeader, Box, TextField } from '@mui/material';
import axios from 'axios';
import { fShortenNumber } from '../../../utils/formatNumber';
import LoadingScreen from '../../../components/LoadingScreen';


// ----------------------------------------------------------------------

export default function LineChartAllProfit() {
  const [seriesYear, setSeriesYear] = useState(null);
  const [seriesData, setSeriesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoading = () => {
  setIsLoading(false);
  }

  useEffect(()=>{
  window.addEventListener("load",handleLoading);
  return () => window.removeEventListener("load",handleLoading);
  },[])

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/combined_portfolio/time_series`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      let tmpData = [];
      if (res.data.length > 0) {
        for (let i = 0; i < res.data.length; i++) {
          let tmpDict = {};
          tmpDict["year"] = res.data[i].year;
          let tmpList = [];
          let tmpDictData = {};
          tmpDictData["name"] = 'Combined Profit';
          tmpDictData["data"] = res.data[i].data.profit;
          tmpList.push(tmpDictData);
          tmpDict["data"] = tmpList;
          tmpData.push(tmpDict);
        }
        setSeriesData(tmpData);
        setSeriesYear(tmpData[0].year);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }).catch(function (err) {
      console.log(err);
      setIsLoading(false);
    })
  }, [])

  const chartOptions = merge(BaseOptionChart(), {
    xaxis: {
      type: "datetime",
    },
    tooltip: { x: { show: true, format: "dd MMM yyyy" }, marker: { show: false } }
  });
  
  const handleChangeSeriesData = (event) => {
    setSeriesYear(Number(event.target.value));
  };
  return !isLoading ? (
    <Card sx = {{height:"500px"}}>
      <CardHeader
        title="Combined Portfolio Profit"
        action={
          <TextField
            select
            fullWidth
            value={seriesYear}
            SelectProps={{ native: true }}
            onChange={handleChangeSeriesData}
            sx={{
              '& fieldset': { border: '0 !important' },
              '& select': { pl: 1, py: 0.5, pr: '24px !important', typography: 'subtitle2' },
              '& .MuiOutlinedInput-root': { borderRadius: 0.75, bgcolor: 'background.neutral' },
              '& .MuiNativeSelect-icon': { top: 4, right: 0, width: 20, height: 20 }
            }}
          >
            {seriesData.map((option) => (
              <option key={option.year} value={option.year}>
                {option.year}
              </option>
            ))}
          </TextField>
        }
      />

      {seriesData.map((item) => (
        <Box key={item.year} sx={{ mt: 3, mx: 3 }} dir="ltr">
          {item.year === seriesYear && (
            <ReactApexChart type="line" series={item.data} options={chartOptions} height={364} />
          )}
        </Box>
      ))}
    </Card>
  ) : (<LoadingScreen></LoadingScreen>);
}
