import React from 'react';
import Highcharts, { format } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const AnalyticsChart = ({analytics}) => {
  const options = {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Analytics'
    },
    xAxis: {
      categories: analytics.categories,
      title: {
        text: null
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Amount ($)',
        align: 'high'
      },
      labels: {
        overflow: 'justify'
      }
    },
    tooltip: {
        valuePrefix: '$',
        
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: true
        }
      }
    },
    series: [{
      name: 'Dates',
      data: analytics.totalAmounts,
      color: '#2952FF'
    }]
  };

  return (
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
};

export default AnalyticsChart;
