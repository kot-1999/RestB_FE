import { mockResponses } from '../utils/mockData.js';

export default function () {
    console.log('Dashboard script loaded');
    
    let dashboardData = null;
    let currentPeriod = '7days'; // '7days' or '30days'
    
    // Load dashboard data with date range
    function loadDashboardData(period) {
        const now = new Date();
        let timeFrom, timeTo;
        
        if (period === '7days') {
            // Past 7 days including today
            timeFrom = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
            timeTo = now;
        } else {
            // Past 30 days including today
            timeFrom = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
            timeTo = now;
        }
        
        // Call API with date range
        dashboardData = mockResponses.getDashboard({
            timeFrom: timeFrom.toISOString(),
            timeTo: timeTo.toISOString()
        });
        
        console.log(`Loaded ${period} data:`, dashboardData.range);
    }
    
    // Process data for chart
    function processChartData() {
        if (!dashboardData) return { labels: [], datasets: [] };
        
        const labels = [];
        const datasets = [];
        
        // Get filter selections
        const showOnly = [];
        $('input[name="showOnly"]:checked').each(function() {
            showOnly.push($(this).val());
        });
        
        // Create complete date range and fill missing dates with zeros
        const dateRange = generateDateRange(dashboardData.range.timeFrom, dashboardData.range.timeTo);
        const dataMap = new Map();
        
        // Map existing data by date
        dashboardData.data.forEach(restaurant => {
            restaurant.summaries.forEach(day => {
                const dateKey = day.date.split('T')[0];
                if (!dataMap.has(dateKey)) {
                    dataMap.set(dateKey, {});
                }
                dataMap.get(dateKey)[restaurant.restaurant.name] = day;
            });
        });
        
        // Generate labels based on period
        dateRange.forEach(date => {
            const dateKey = date.toISOString().split('T')[0];
            if (currentPeriod === '7days') {
                labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            } else {
                labels.push(date.getDate().toString());
            }
        });
        
        // Generate datasets for each restaurant
        const colors = ['#3b82f6', '#10b981', '#f59e0b'];
        dashboardData.data.forEach((restaurant, index) => {
            const filteredData = [];
            
            dateRange.forEach(date => {
                const dateKey = date.toISOString().split('T')[0];
                const dayData = dataMap.get(dateKey)?.[restaurant.restaurant.name];
                
                let value = 0;
                if (dayData) {
                    if (showOnly.includes('approved')) value += dayData.totalApprovedBookings;
                    if (showOnly.includes('pending')) value += dayData.totalPendingBookings;
                }
                // If no data for this date, value stays 0
                
                filteredData.push(value);
            });
            
            datasets.push({
                label: restaurant.restaurant.name,
                data: filteredData,
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length] + '20',
                tension: 0.4,
                fill: true
            });
        });
        
        console.log(`${currentPeriod} labels:`, labels);
        return { labels, datasets };
    }
    
    // Generate complete date range
    function generateDateRange(timeFrom, timeTo) {
        const start = new Date(timeFrom);
        const end = new Date(timeTo);
        const dates = [];
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
        }
        
        return dates;
    }
    
    // Update KPIs from API data
    function updateKPIs() {
        if (!dashboardData) return;
        
        let totalBookings = 0;
        let pendingBookings = 0;
        let totalGuests = 0;
        
        dashboardData.data.forEach(restaurant => {
            restaurant.summaries.forEach(day => {
                totalBookings += day.totalApprovedBookings;
                pendingBookings += day.totalPendingBookings;
                totalGuests += day.totalGuests;
            });
        });
        
        $('.kpi-value').eq(0).text(totalBookings);
        $('.kpi-value').eq(1).text(pendingBookings);
        $('.kpi-value').eq(2).text('6'); // Mock cancelled is not in the api schema so just hardcoded for now
        $('.kpi-value').eq(3).text(totalGuests);
    }
    
    // Initialize chart
    let chart = null;
    
    function updateChart() {
        const ctx = document.getElementById('bookingsChart');
        if (!ctx) return;
        
        const chartData = processChartData();
        
        if (chart) {
            chart.data = chartData;
            chart.update();
        } else if (typeof Chart !== 'undefined') {
            chart = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: true, position: 'bottom' } },
                    scales: {
                        y: { beginAtZero: true, grid: { display: true, color: '#e5e7eb' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
    }
    
    // Initialize
    loadDashboardData(currentPeriod);
    updateKPIs();
    updateChart();
    
    // Handle filter changes
    $(document).on('change', 'input[name="showOnly"]', function() {
        updateChart();
    });
    
    // Handle time period buttons
    $('.dash-chip').on('click', function() {
        console.log('Button clicked:', $(this).text());
        $('.dash-chip').removeClass('is-active');
        $(this).addClass('is-active');
        
        // Update period based on button text
        const buttonText = $(this).text().toLowerCase().trim();
        console.log('Button text:', buttonText);
        
        if (buttonText === 'past 7 days') {
            currentPeriod = '7days';
            console.log('Switched to 7 days view');
        } else if (buttonText === 'past 30 days') {
            currentPeriod = '30days';
            console.log('Switched to 30 days view');
        } else {
            console.log('Unknown button text:', buttonText);
        }
        
        // Reload data for new period
        loadDashboardData(currentPeriod);
        updateKPIs();
        updateChart();
    });
}