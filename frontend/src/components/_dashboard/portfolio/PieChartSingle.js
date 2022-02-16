import { merge } from 'lodash';
import ReactApexChart from 'react-apexcharts';
import { useState, useEffect } from 'react';
//
import BaseOptionChart from './BaseOptionChart';
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
// ----------------------------------------------------------------------

export default function PieChartSingle() {
  const params = useParams(); 
  const [seriesLabels, setSeriesLabels] = useState([]);
  const [seriesData, setSeriesData] = useState([]);

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/portfolio/holdings?portfolio_id=${params.portfolio_id}`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      let tmpData = {"portfolio": [], "value": []};
      for (let i = 0; i < res.data.length; i++) {
        tmpData["portfolio"].push(res.data[i].ticker);
        tmpData["value"].push(res.data[i].holding_value);
      }
      setSeriesData(tmpData["value"]);
      setSeriesLabels(tmpData["portfolio"]);
    }).catch(function (err) {
      console.log("portfolio list error")
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
