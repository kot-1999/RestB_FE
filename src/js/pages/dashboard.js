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
        const showOnly = $('input[name="showOnly"]:checked').map((i, el) => el.value).get();
        const allRestaurantsChecked = $('input[name="restaurant"][value="all"]').is(':checked');
        const selectedRestaurants = allRestaurantsChecked 
            ? [] 
            : $('input[name="restaurant"]:checked:not([value="all"])').map((i, el) => el.value).get();
        
        // Filter restaurants
        const filteredData = allRestaurantsChecked 
            ? dashboardData.data 
            : selectedRestaurants.length === 0 
                ? [] 
                : dashboardData.data.filter(r => selectedRestaurants.includes(r.restaurant.name));
        
        // Map data by date and restaurant
        const dateRange = generateDateRange(dashboardData.range.timeFrom, dashboardData.range.timeTo);
        const dataMap = new Map();
        filteredData.forEach(restaurant => {
            restaurant.summaries.forEach(day => {
                const dateKey = day.date.split('T')[0];
                if (!dataMap.has(dateKey)) dataMap.set(dateKey, {});
                dataMap.get(dateKey)[restaurant.restaurant.name] = day;
            });
        });
        
        // Generate labels and datasets
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4', '#a855f7', '#0ea5e9', '#22c55e', '#eab308', '#dc2626', '#7c3aed', '#db2777', '#0891b2', '#16a34a', '#ca8a04', '#b91c1c', '#6d28d9', '#be185d', '#0e7490'];
        
        dateRange.forEach(date => {
            const dateKey = date.toISOString().split('T')[0];
            labels.push(currentPeriod === '7days' 
                ? date.toLocaleDateString('en-US', { weekday: 'short' })
                : date.getDate().toString());
        });
        
        filteredData.forEach((restaurant, index) => {
            const color = colors[index % colors.length];
            const filteredData = dateRange.map(date => {
                const dateKey = date.toISOString().split('T')[0];
                const dayData = dataMap.get(dateKey)?.[restaurant.restaurant.name];
                return dayData ? (showOnly.includes('approved') ? dayData.totalApprovedBookings : 0) + 
                              (showOnly.includes('pending') ? dayData.totalPendingBookings : 0) : 0;
            });
            
            datasets.push({
                label: restaurant.restaurant.name,
                data: filteredData,
                borderColor: color,
                backgroundColor: color + '20',
                tension: 0.4,
                fill: false,
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5
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
        
        const allRestaurantsChecked = $('input[name="restaurant"][value="all"]').is(':checked');
        const selectedRestaurants = allRestaurantsChecked 
            ? [] 
            : $('input[name="restaurant"]:checked:not([value="all"])').map((i, el) => el.value).get();
        
        const filteredData = allRestaurantsChecked 
            ? dashboardData.data 
            : selectedRestaurants.length === 0 
                ? [] 
                : dashboardData.data.filter(r => selectedRestaurants.includes(r.restaurant.name));
        
        const totals = filteredData.reduce((acc, restaurant) => {
            restaurant.summaries.forEach(day => {
                acc.bookings += day.totalApprovedBookings;
                acc.pending += day.totalPendingBookings;
                acc.guests += day.totalGuests;
            });
            return acc;
        }, { bookings: 0, pending: 0, guests: 0 });
        
        $('.kpi-value').eq(0).text(totals.bookings);
        $('.kpi-value').eq(1).text(totals.pending);
        $('.kpi-value').eq(2).text('6');
        $('.kpi-value').eq(3).text(totals.guests);
    }
    
    // Populate restaurant checkboxes
    function populateRestaurantFilter() {
        const restaurantFilter = $('#restaurantFilter');
        restaurantFilter.empty();
        
        // Add "All Restaurants" option
        restaurantFilter.append(`
            <label class="check">
                <input type="checkbox" name="restaurant" value="all" checked>
                <span>All Restaurants</span>
            </label>
        `);
        
        // Add individual restaurant options
        dashboardData.data.forEach(restaurant => {
            restaurantFilter.append(`
                <label class="check">
                    <input type="checkbox" name="restaurant" value="${restaurant.restaurant.name}">
                    <span>${restaurant.restaurant.name}</span>
                </label>
            `);
        });
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
    populateRestaurantFilter();
    updateKPIs();
    updateChart();
    updateDynamicText();
    
    // Handle filter changes
    $(document).on('change', 'input[name="showOnly"], input[name="restaurant"]', function() {
        const isAll = $(this).val() === 'all';
        if (isAll && $(this).is(':checked')) {
            $('input[name="restaurant"][value!="all"]').prop('checked', false);
        } else if (!isAll && $(this).is(':checked')) {
            $('input[name="restaurant"][value="all"]').prop('checked', false);
        }
        updateKPIs();
        updateChart();
    });
    
    // Handle time period buttons
    $('.dash-chip').on('click', function() {
        $('.dash-chip').removeClass('is-active');
        $(this).addClass('is-active');
        
        currentPeriod = $(this).text().toLowerCase().trim().includes('7') ? '7days' : '30days';
        loadDashboardData(currentPeriod);
        updateKPIs();
        updateChart();
        updateDynamicText();
    });
    
    // Update dynamic text based on period
    function updateDynamicText() {
        const isWeekly = currentPeriod === '7days';
        $('#dashboardSub').text(`Your ${isWeekly ? 'weekly' : 'monthly'} activity at a glance.`);
        $('#chartTitle').text(`${isWeekly ? 'Weekly' : 'Monthly'} bookings`);
        $('#totalBookingsMeta, #cancelledMeta').text(isWeekly ? 'Past 7 days' : 'Past 30 days');
    }
}