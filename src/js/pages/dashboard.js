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
        const selectedRestaurants = [];
        
        $('input[name="showOnly"]:checked').each(function() {
            showOnly.push($(this).val());
        });
        
        // Handle restaurant selection logic
        const allRestaurantsChecked = $('input[name="restaurant"][value="all"]').is(':checked');
        if (allRestaurantsChecked) {
            // If "All Restaurants" is checked, show all restaurants
            // No need to filter, use all data
        } else {
            // If "All Restaurants" is unchecked, get selected individual restaurants
            $('input[name="restaurant"]:checked').each(function() {
                if ($(this).val() !== 'all') {
                    selectedRestaurants.push($(this).val());
                }
            });
        }
        
        // Filter restaurants
        const filteredData = allRestaurantsChecked 
            ? dashboardData.data 
            : selectedRestaurants.length === 0 
                ? [] // Show nothing if no restaurants selected
                : dashboardData.data.filter(r => selectedRestaurants.includes(r.restaurant.name));
        
        // Create complete date range and fill missing dates with zeros
        const dateRange = generateDateRange(dashboardData.range.timeFrom, dashboardData.range.timeTo);
        const dataMap = new Map();
        
        // Map existing data by date
        filteredData.forEach(restaurant => {
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
        const colors = [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
            '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
            '#06b6d4', '#a855f7', '#0ea5e9', '#22c55e', '#eab308',
            '#dc2626', '#7c3aed', '#db2777', '#0891b2', '#16a34a',
            '#ca8a04', '#b91c1c', '#6d28d9', '#be185d', '#0e7490'
        ];
        
        filteredData.forEach((restaurant, index) => {
            const color = colors[index % colors.length];
            const filteredData = [];
            
            dateRange.forEach(date => {
                const dateKey = date.toISOString().split('T')[0];
                const dayData = dataMap.get(dateKey)?.[restaurant.restaurant.name];
                
                let value = 0;
                if (dayData) {
                    if (showOnly.includes('approved')) value += dayData.totalApprovedBookings;
                    if (showOnly.includes('pending')) value += dayData.totalPendingBookings;
                }
                
                filteredData.push(value);
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
        
        // Get selected restaurants
        const selectedRestaurants = [];
        
        // Handle restaurant selection logic
        const allRestaurantsChecked = $('input[name="restaurant"][value="all"]').is(':checked');
        if (allRestaurantsChecked) {
            // If "All Restaurants" is checked, use all data
        } else {
            // If "All Restaurants" is unchecked, get selected individual restaurants
            $('input[name="restaurant"]:checked').each(function() {
                if ($(this).val() !== 'all') {
                    selectedRestaurants.push($(this).val());
                }
            });
        }
        
        // Filter data for KPIs
        const filteredData = allRestaurantsChecked 
            ? dashboardData.data 
            : selectedRestaurants.length === 0 
                ? [] // Show nothing if no restaurants selected
                : dashboardData.data.filter(r => selectedRestaurants.includes(r.restaurant.name));
        
        let totalBookings = 0;
        let pendingBookings = 0;
        let totalGuests = 0;
        
        filteredData.forEach(restaurant => {
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
        // Handle "All Restaurants" checkbox logic
        if ($(this).attr('name') === 'restaurant' && $(this).val() === 'all') {
            if ($(this).is(':checked')) {
                // If "All Restaurants" is checked, uncheck all individual restaurants
                $('input[name="restaurant"][value!="all"]').prop('checked', false);
            }
        } else if ($(this).attr('name') === 'restaurant' && $(this).val() !== 'all') {
            // If individual restaurant is checked, uncheck "All Restaurants"
            $('input[name="restaurant"][value="all"]').prop('checked', false);
        }
        
        updateKPIs();
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
        updateDynamicText();
    });
    
    // Update dynamic text based on period
    function updateDynamicText() {
        if (currentPeriod === '7days') {
            $('#dashboardTitle').text('Dashboard');
            $('#dashboardSub').text('Your weekly activity at a glance.');
            $('#chartTitle').text('Weekly bookings');
            $('#totalBookingsMeta').text('Past 7 days');
            $('#cancelledMeta').text('Past 7 days');
            $('#guestsMeta').text('Covers (guests)');
        } else {
            $('#dashboardTitle').text('Dashboard');
            $('#dashboardSub').text('Your monthly activity at a glance.');
            $('#chartTitle').text('Monthly bookings');
            $('#totalBookingsMeta').text('Past 30 days');
            $('#cancelledMeta').text('Past 30 days');
            $('#guestsMeta').text('Covers (guests)');
        }
    }
}