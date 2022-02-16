import { merge } from 'lodash';
import ReactApexChart from 'react-apexcharts';
import { useState, useEffect } from 'react';
//
import BaseOptionChart from './BaseOptionChart';
import axios from 'axios'
// ----------------------------------------------------------------------

export default function PieChartAll() {
  const [seriesLabels, setSeriesLabels] = useState([]);
  const [seriesData, setSeriesData] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/portfolios/overview', {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      let tmpData = {"portfolio": [], "value": []};
      for (let i = 0; i < res.data.portfolios.length; i++) {
        tmpData["portfolio"].push(res.data.portfolios[i].portfolio_name);
        tmpData["value"].push(res.data.portfolios[i].market_value);
      }
      setSeriesData(tmpData["value"]);
      setSeriesLabels(tmpData["portfolio"]);
    }).catch(function (err) {
      console.log(err.response)
    })
  }, [])
  const chartOptions = merge(BaseOptionChart(), {
    labels: seriesLabels,
    legend: {
      position: 'right',
      offsetX: -20,
      offsetY: 64,
      itemMargin: { vertical: 8 }
    },
    stroke: { show: false },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    plotOptions: { pie: {
      donut: {
        labels: {
          show: false,
          value: {
            formatter: function (val) {
                return Number(val).toFixed(2);
            }
          }
        } 
      } 
    } 
  }
  });

  return <ReactApexChart type="pie" series={seriesData} options={chartOptions} width={400} />;
}
