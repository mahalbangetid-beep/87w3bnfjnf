import { Component } from 'react';
import Chart from 'react-apexcharts';

/**
 * SafeChart - A wrapper around react-apexcharts that handles errors gracefully
 * Prevents chart initialization errors from crashing the entire page
 */
class SafeChart extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('SafeChart Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: this.props.height || 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                }}>
                    <p style={{ color: '#6b7280', fontSize: '13px' }}>
                        Unable to load chart
                    </p>
                </div>
            );
        }

        const { options, series, type, height, width, ...rest } = this.props;

        // Defensive: Ensure labels is always an array if present
        const safeOptions = {
            ...options,
            labels: Array.isArray(options?.labels) ? options.labels : [],
            xaxis: {
                ...options?.xaxis,
                categories: Array.isArray(options?.xaxis?.categories)
                    ? options.xaxis.categories
                    : []
            }
        };

        // Ensure series is always an array
        const safeSeries = Array.isArray(series) ? series : [];

        return (
            <Chart
                options={safeOptions}
                series={safeSeries}
                type={type}
                height={height}
                width={width}
                {...rest}
            />
        );
    }
}

export default SafeChart;
