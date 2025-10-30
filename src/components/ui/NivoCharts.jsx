// frontend/src/components/ui/NivoCharts.jsx
import React, { useId } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import '../../styles/NivoStyles.css';

/**
 * NivoCharts - Reusable Bar Chart Component
 * @param {Object[]} data - Chart data array
 * @param {string[]} keys - Keys to display as bars
 * @param {string} indexBy - Field to use as x-axis
 * @param {string} axisBottomLegend - X-axis legend
 * @param {string} axisLeftLegend - Y-axis legend
 * @param {function|array} colors - Color function or array
 * @param {number} height - Height of the chart container (default 320)
 * @param {boolean} [enableLabel=false] - Show value labels on bars
 * @param {string} [unit] - Optional unit to show in tooltip
 */
const NivoCharts = ({
  data,
  keys,
  indexBy,
  axisBottomLegend,
  axisLeftLegend,
  colors,
  height = 320,
  enableLabel = false,
  unit
}) => {
  const gradientId = useId();

  // Get all unique index values from data
  const indexValues = data.map(d => d[indexBy]);

  // Prepare gradients for each index value
  const gradients = indexValues.map((indexValue, i) => {
    let color;
    if (typeof colors === 'function') {
      color = colors({ data: { source: indexValue } });
    } else if (Array.isArray(colors)) {
      color = colors[i % colors.length];
    } else {
      color = colors || '#ccc';
    }
    return (
      <linearGradient id={`${gradientId}-bar-${indexValue}`} key={indexValue} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} />
        <stop offset="100%" stopColor="var(--bg-60)" />
      </linearGradient>
    );
  });

  // Custom color function for Nivo to use the gradients
  const gradientColor = (bar) => {
    // Use indexValue to match the gradient
    return `url(#${gradientId}-bar-${bar.indexValue})`;
  };

  // Custom layer to inject gradients into the chart's SVG
  const GradientDefs = () => <defs>{gradients}</defs>;

  return (
    <div className="nivo-bar-chart-container" style={{ height }}>
      <ResponsiveBar
        data={data}
        keys={keys}
        indexBy={indexBy}
        margin={{ top: 30, right: 20, bottom: 40, left: 60 }}
        padding={0.4}
        colors={gradientColor}
        axisBottom={{
          legend: axisBottomLegend,
          legendPosition: 'middle',
          legendOffset: 32,
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
        }}
        axisLeft={{
          legend: axisLeftLegend,
          legendPosition: 'middle',
          legendOffset: -50,
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
        }}
        theme={{
          axis: { ticks: { text: { fill: '#9CA3AF' } } },
          grid: { line: { stroke: 'var(--nivo-grid-color)', strokeWidth: 1 } },
          tooltip: {
            container: {
              background: 'var(--nivo-tooltip-bg)',
              color: 'var(--nivo-tooltip-color)',
              fontSize: 10,
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              padding: '2px 6px'
            }
          }
        }}
        tooltip={({ id, value, indexValue }) => (
          <div className="p-1" style={{ background: 'var(--nivo-tooltip-bg)', color: 'var(--nivo-tooltip-color)', borderRadius: 8, fontSize: 10, padding: '2px 6px' }}>
            <strong>{indexValue}</strong>: {value}{unit ? ` ${unit}` : ''}
          </div>
        )}
        enableLabel={enableLabel}
        layers={['defs', GradientDefs, 'grid', 'axes', 'bars', 'markers', 'legends']}
        borderRadius={8}
      />
    </div>
  );
};

export default NivoCharts; 