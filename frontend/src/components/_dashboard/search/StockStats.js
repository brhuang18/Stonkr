import { Icon } from '@iconify/react';
import androidFilled from '@iconify/icons-ant-design/android-filled';
// material
import { alpha, styled } from '@mui/material/styles';
import { Card, CardHeader, Box, Typography } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
// utils
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

import axios from 'axios'
import React from 'react'
import { useParams } from 'react-router';
import LoadingScreen from '../../../components/LoadingScreen';


// ----------------------------------------------------------------------

const init = {
  Response: "Successful retrieval of stock statistics",
  EvaluationMeasures: {
      MarketCapitalization: "",
      TrailingPE: "",
      ForwardPE: "",
      PEGRatio: "",
      PriceToSalesRatioTTM: "",
      PriceToBookRatio: "",
  },
  FinancialHighlights: {
      FiscalYear: {
          FiscalYearEnd: "",
          LatestQuarter: "",
      },
      Profitability: {
          ProfitMargin: "",
          OperatingMarginTTM: "",
      },
      ManagementEffectiveness: {
          ReturnOnAssetsTTM: "",
          ReturnOnEquityTTM: "",
      },
      IncomeStatement: {
          TotalRevenue: "",
          RevenuePerShareTTM: "",
          QuarterlyRevenueGrowthYOY: "",
          GrossProfitTTM: "",
          EBITDA: "",
          DilutedEPSTTM: "",
          QuarterlyEarningsGrowthYOY: "",
      },
      BalanceSheet: {
          TotalAssets: "",
          TotalCurrentAssets: "",
          CashAndCashEquivalentsAtCarryingValue: "",
          CashAndShortTermInvestments: "",
          Inventory: "",
          TotalLiabilities: "",
          TotalCurrentLiabilities: "",
          TotalShareholderEquity: "",
          RetainedEarnings: "",
          CommonStock: "",
      },
      CashflowStatement: {
          OperatingCashflow: "",
          CashflowFromInvestment: "",
      }
  },
  TradingInformation: {
      StockPriceHistory: {
          Beta: "",
          "52WeekChange": "",
          "52WeekHigh": "",
          "52WeekLow": "",
          "50DayMovingAverage": "",
          "200DayMovingAverage": "",
      },
      ShareStatistics: {
          SharesOutstanding: "",
          SharesFloat: "",
          PercentInsiders: "",
          PercentInstitutions: "",
          SharesShort: "",
          ShortRatio: "",
          ShortPercentFloat: "",
          ShortPercentOutstanding: "",
      },
      DividendsAndSplits: {
          ForwardAnnualDividendRate: "",
          ForwardAnnualDividendYield: "",
          PayoutRatio: "",
          DividendDate: "",
          ExDividendDate: "",
          LastSplitFactor: "",
          LastSplitDate: "",
      }
  }
}

export default function StockStats() {
  const params = useParams()
  const [data, setData] = React.useState({})
  const [isLoading, setIsLoading] = React.useState(true);

  const handleLoading = () => {
  setIsLoading(false);
  }

  React.useEffect(()=>{
  window.addEventListener("load",handleLoading);
  return () => window.removeEventListener("load",handleLoading);
  },[])

  React.useEffect(() => {
    axios.get(`http://127.0.0.1:8000/search/statistics/?stock_ticker=${params.ticker}`, null, null)
    .then(function (res) {
      setData(res.data)
      setIsLoading(false);
    }).catch(function (err) {
      console.log(err.response)
    })
  }, [params])

  function createData(name, data) {
    return { name, data };
  }

  function SummaryTable (props) {
    const { title, table } = props;

    let row = []
    for (let i in table) {
      let tmp = {}
      if (table[i] == null) continue
      tmp['row_name'] = i;
      tmp['row_data'] = table[i];
      row.push(tmp)
    }

    return (
      <div>
        <Typography variant="h6">{title}</Typography>
        <Table style={{ width: '100%' }} aria-label="simple table">
          <TableBody>
            {row.map((data, index) => {
              if (typeof data.row_data == "object") {
                return (
                  <SummaryTable title={data.row_name} table={data.row_data} />
                )
              } else {
                return (
                  <TableRow
                  key={index}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {data.row_name}
                    </TableCell>
                    <TableCell align="right">{data.row_data == null ? 'N/A' : data.row_data}</TableCell>
                  </TableRow>
                )
              }
            })}
          </TableBody>
        </Table>
      </div>
    );
  }

  return !isLoading ? (
    <Card>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} dir="ltr">
        <div style={{ width: '100%' }}>
          <Typography variant="h6">Statistics</Typography>
          <div style={{padding: "6px"}}/>
          <SummaryTable title="Evalutaion Measures" table={data.EvaluationMeasures} />
          <div style={{padding: "6px"}}/>
          <SummaryTable title="Financial Highlights" table={data.FinancialHighlights} />
          <div style={{padding: "6px"}}/>
          <SummaryTable title="Trading Information" table={data.TradingInformation} />
        </div>
      </Box>
    </Card>
  ) : (<LoadingScreen></LoadingScreen>);
}
