import ApiRequest from '../utils/ApiRequest.js';
import {showError} from "../utils/helpers.js";

export default function () {
    let dashboardData = null;
    let currentPeriod = '7days'; // '7days' or '30days'

    // Helper: build YYYY-MM-DD from local calendar date
    function toLocalDateStr(d) {
        const y   = d.getFullYear();
        const m   = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    // Load dashboard data with date range
    async function loadDashboardData(period) {
        const now  = new Date();
        const days = period === '7days' ? 6 : 29;

        const todayStr = toLocalDateStr(now);
        const fromDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        const fromStr  = toLocalDateStr(fromDate);

        try {
            // Z suffix keeps the local calendar date without UTC shift
            dashboardData = await ApiRequest.getDashboard({
                timeFrom: fromStr  + 'T00:00:00.000Z',
                timeTo:   todayStr + 'T23:59:59.999Z'
            });


            // Check if there's no data
            if (!dashboardData || !dashboardData.data || dashboardData.data.length === 0) {
                Swal.fire({
                    icon: 'info',
                    title: 'No Data Available',
                    text: 'No booking data found for the selected period. Try a different time range or check back later.',
                    confirmButtonColor: '#3b82f6'
                });
            }
        } catch (error) {
            showError(error)
        }
    }

    // Process data for chart
    function processChartData() {
        if (!dashboardData || !dashboardData.data || dashboardData.data.length === 0) {
            return { labels: [], datasets: [] };
        }

        const labels   = [];
        const datasets = [];

        // Get filter selections
        const showOnly = $('input[name="showOnly"]:checked').map((i, el) => el.value).get();
        const allRestaurantsChecked = $('input[name="restaurant"][value="all"]').is(':checked');
        const selectedRestaurants   = allRestaurantsChecked
            ? []
            : $('input[name="restaurant"]:checked:not([value="all"])').map((i, el) => el.value).get();

        // Filter restaurants
        const filteredData = allRestaurantsChecked
            ? dashboardData.data
            : selectedRestaurants.length === 0
                ? []
                : dashboardData.data.filter(r => selectedRestaurants.includes(r.name));

        // Map data by date and restaurant
        const dateRange = generateDateRange(dashboardData.range.timeFrom, dashboardData.range.timeTo);
        const dataMap   = new Map();
        filteredData.forEach(restaurant => {
            restaurant.summaries.forEach(day => {
                const dateKey = day.date.split('T')[0];
                if (!dataMap.has(dateKey)) dataMap.set(dateKey, {});
                dataMap.get(dateKey)[restaurant.name] = day;
            });
        });

        // Generate labels
        dateRange.forEach(date => {
            labels.push(currentPeriod === '7days'
                ? date.toLocaleDateString('en-US', { weekday: 'short' })
                : date.getDate().toString());
        });

        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4', '#a855f7', '#0ea5e9', '#22c55e', '#eab308', '#dc2626', '#7c3aed', '#db2777', '#0891b2', '#16a34a', '#ca8a04', '#b91c1c', '#6d28d9', '#be185d', '#0e7490'];

        filteredData.forEach((restaurant, index) => {
            const color      = colors[index % colors.length];
            const chartData  = dateRange.map(date => {
                const dateKey = date.toISOString().split('T')[0];
                const dayData = dataMap.get(dateKey)?.[restaurant.name];
                return dayData
                    ? (showOnly.includes('approved') ? dayData.totalApprovedAndConfirmedBookings : 0) +
                    (showOnly.includes('pending')  ? dayData.totalPendingBookings : 0)
                    : 0;
            });

            datasets.push({
                label:           restaurant.name,
                data:            chartData,
                borderColor:     color,
                backgroundColor: color + '20',
                tension:         0.4,
                fill:            false,
                borderWidth:     2,
                pointRadius:     3,
                pointHoverRadius: 5
            });
        });

        return { labels, datasets };
    }

    // Generate complete date range
    function generateDateRange(timeFrom, timeTo) {
        const start = new Date(timeFrom);
        const end   = new Date(timeTo);
        const dates = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
        }

        return dates;
    }

    // Update KPIs from API data
    function updateKPIs() {
        if (!dashboardData || !dashboardData.data || dashboardData.data.length === 0) {
            $('.kpi-value').eq(0).text('0');
            $('.kpi-value').eq(1).text('0');
            $('.kpi-value').eq(2).text('0');
            $('.kpi-value').eq(3).text('0');
            return;
        }

        const allRestaurantsChecked = $('input[name="restaurant"][value="all"]').is(':checked');
        const selectedRestaurants   = allRestaurantsChecked
            ? []
            : $('input[name="restaurant"]:checked:not([value="all"])').map((i, el) => el.value).get();

        const filteredData = allRestaurantsChecked
            ? dashboardData.data
            : selectedRestaurants.length === 0
                ? []
                : dashboardData.data.filter(r => selectedRestaurants.includes(r.name));

        const totals = filteredData.reduce((acc, restaurant) => {
            restaurant.summaries.forEach(day => {
                acc.bookings  += day.totalApprovedAndConfirmedBookings || 0;
                acc.pending   += day.totalPendingBookings || 0;
                acc.cancelled += day.totalCanceledBookings || 0;
                acc.guests    += day.totalApprovedAndConfirmedGuests || 0;
            });
            return acc;
        }, { bookings: 0, pending: 0, cancelled: 0, guests: 0 });

        $('.kpi-value').eq(0).text(totals.bookings);
        $('.kpi-value').eq(1).text(totals.pending);
        $('.kpi-value').eq(2).text(totals.cancelled);
        $('.kpi-value').eq(3).text(totals.guests);
    }

    // Populate restaurant checkboxes
    function populateRestaurantFilter() {
        const restaurantFilter = $('#restaurantFilter');
        restaurantFilter.empty();

        restaurantFilter.append(`
            <label class="check">
                <input type="checkbox" name="restaurant" value="all" checked>
                <span>All Restaurants</span>
            </label>
        `);

        if (dashboardData && dashboardData.data && dashboardData.data.length > 0) {
            dashboardData.data.forEach(restaurant => {
                restaurantFilter.append(`
                    <label class="check">
                        <input type="checkbox" name="restaurant" value="${restaurant.name}">
                        <span>${restaurant.name}</span>
                    </label>
                `);
            });
        } else {
            restaurantFilter.append(`
                <div class="text-muted text-sm mt-2">No restaurants found</div>
            `);
        }
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
                    responsive:          true,
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
    initializeDashboard();

    // Populate the dash-brand-minimal component from API brand data
    function populateBrand() {
        if (!dashboardData || !dashboardData.brand) return;
        const brand = dashboardData.brand;
        const $container = $('#brand-container');
        $container.find('.dash-brand-name').text(brand.name || 'Unknown Brand');
        if (brand.logoURL) {
            $container.find('.js-brand-img').attr('src', brand.logoURL).attr('alt', brand.name);
        }
    }

    async function initializeDashboard() {
        await loadDashboardData(currentPeriod);
        populateBrand();
        populateRestaurantFilter();
        updateKPIs();
        updateChart();
        updateDynamicText();
    }

    // Handle filter changes
    $(document).on('change', 'input[name="showOnly"], input[name="restaurant"]', function () {
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
    $('.dash-chip').on('click', async function () {
        $('.dash-chip').removeClass('is-active');
        $(this).addClass('is-active');

        currentPeriod = $(this).text().toLowerCase().trim().includes('7') ? '7days' : '30days';
        await loadDashboardData(currentPeriod);
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