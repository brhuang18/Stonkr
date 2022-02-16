import { useParams } from 'react-router-dom';
import { AppNewsUpdate } from '../app';
import StockChart from './StockChart';
import { StockNavBar } from '.';

export default function StockOverview () {
  const params = useParams();

  return (
    <div>
      <StockChart ticker={params.ticker} />
      <AppNewsUpdate search={params.ticker} />    
    </div>
  );
}
