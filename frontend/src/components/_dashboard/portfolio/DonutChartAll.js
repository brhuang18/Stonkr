import { merge } from 'lodash';
import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
// material
import { Card, CardHeader, Box, TextField } from '@mui/material';
//
import BaseOptionChart from './BaseOptionChart';
import axios from 'axios'

// ----------------------------------------------------------------------


export default function DonutChartAll() {
  const [seriesCurrent, setSeriesCurrent] = useState(null);
  const [seriesCategories, setSeriesCategories] = useState([]);
  const [seriesData, setSeriesData] = useState([]);

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/combined_portfolio/groupings`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      let tmpData = [];
      for (let i = 0; i < res.data.length; i++) {
        let tmpDict = {};
        tmpDict["grouping"] = res.data[i].grouping;
        tmpDict["data"] = res.data[i].data;
        tmpDict["data_categories"] = res.data[i].data_categories;
        tmpData.push(tmpDict);
      }
      setSeriesData(tmpData);
      setSeriesCurrent(tmpData[0].grouping);
      setSeriesCategories(tmpData[0].data_categories);
    }).catch(function (err) {
      console.log(err)
    })
  }, [])

  const handleChangeSeriesData = (event) => {
    setSeriesCurrent(event.target.value);
    for (let i = 0; i < seriesData.length; i++) {
      if (seriesData[i].grouping == event.target.value) {
        setSeriesCategories(seriesData[i].data_categories);
      }
    }    
  };

  const chartOptions = merge(BaseOptionChart(), {
    labels: seriesCategories,
    stroke: { show: false },
    legend: { horizontalAlign: 'center' },
    plotOptions: { pie: {
      donut: {
        size: '90%', labels: {
          value: {
            formatter: function (val) {
                return Number(val).toFixed(2);
            }
          },
          total: {
            formatter: function (w) {
              return w.globals.seriesTotals.reduce((a, b) => {
                return Math.round((a+b) * 100) / 100;
              }, 0)
            }
          }
        } 
      } 
    } 
    }
  });

  return (
    <Card sx = {{height:"564px"}}>
      <CardHeader
        title="Combined Portfolio Value By Category"
        action={
          <TextField
            select
            fullWidth
            value={seriesCurrent}
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
              <option key={option.grouping} value={option.grouping}>
                {option.grouping}
              </option>
            ))}
          </TextField>
        }
      />

      {seriesData.map((item) => (
        <Box key={item.grouping} sx={{ mt: 3, mx: 3 }} dir="ltr">
          {item.grouping === seriesCurrent && (
            <ReactApexChart type="donut" series={item.data} options={chartOptions} height={364} />
          )}
        </Box>
      ))}
    </Card>
  );
}
