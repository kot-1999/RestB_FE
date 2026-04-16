import ApiRequest from '../utils/ApiRequest.js';
import { renderHeaderWithBrand, showError } from "../utils/helpers.js";

export default function () {
    let dashboardData = null;
    let chart = null;
    let datePicker = null;

    let currentRange = {
        from: null,
        to: null
    };

    function toLocalDateStr(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    function getDefaultRange() {
        const now = new Date();

        const from = new Date(now);
        from.setDate(from.getDate() - 1);

        const to = new Date(now);
        to.setDate(to.getDate() + 7);

        return { from, to };
    }

    function formatDisplayDate(date) {
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short'
        });
    }

    function formatRangeDisplay(from, to) {
        if (!from || !to) return '';

        const sameYear = from.getFullYear() === to.getFullYear();
        const sameMonth = sameYear && from.getMonth() === to.getMonth();

        if (sameMonth) {
            const monthYear = to.toLocaleDateString('en-GB', {
                month: 'short',
                year: 'numeric'
            });
            return `${from.getDate()}–${to.getDate()} ${monthYear}`;
        }

        if (sameYear) {
            return `${formatDisplayDate(from)} – ${formatDisplayDate(to)}`;
        }

        const fromFull = from.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        const toFull = to.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        return `${fromFull} – ${toFull}`;
    }

    async function loadDashboardData(fromDate, toDate) {
        try {
            dashboardData = await ApiRequest.getDashboard({
                timeFrom: toLocalDateStr(fromDate) + 'T00:00:00.000Z',
                timeTo: toLocalDateStr(toDate) + 'T23:59:59.999Z'
            });

            if (!dashboardData || !dashboardData.data || dashboardData.data.length === 0) {
                Swal.fire({
                    icon: 'info',
                    title: 'No Data Available',
                    text: 'No booking data found for the selected date range.',
                    confirmButtonColor: '#3b82f6'
                });
            }
        } catch (error) {
            showError(error);
        }
    }

    function generateDateRange(timeFrom, timeTo) {
        const start = new Date(timeFrom);
        const end = new Date(timeTo);
        const dates = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
        }

        return dates;
    }

    function processChartData() {
        if (!dashboardData || !dashboardData.data || dashboardData.data.length === 0) {
            return { labels: [], datasets: [] };
        }

        const labels = [];
        const datasets = [];

        const showOnly = $('input[name="showOnly"]:checked').map((i, el) => el.value).get();
        const allRestaurantsChecked = $('input[name="restaurant"][value="all"]').is(':checked');
        const selectedRestaurants = allRestaurantsChecked
            ? []
            : $('input[name="restaurant"]:checked:not([value="all"])').map((i, el) => el.value).get();

        const filteredData = allRestaurantsChecked
            ? dashboardData.data
            : selectedRestaurants.length === 0
                ? []
                : dashboardData.data.filter(r => selectedRestaurants.includes(r.name));

        const dateRange = generateDateRange(dashboardData.range.timeFrom, dashboardData.range.timeTo);
        const dataMap = new Map();

        filteredData.forEach(restaurant => {
            restaurant.summaries.forEach(day => {
                const dateKey = day.date.split('T')[0];
                if (!dataMap.has(dateKey)) dataMap.set(dateKey, {});
                dataMap.get(dateKey)[restaurant.name] = day;
            });
        });

        dateRange.forEach(date => {
            labels.push(date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
        });

        const colors = [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
        ];

        filteredData.forEach((restaurant, index) => {
            const color = colors[index % colors.length];
            const chartData = dateRange.map(date => {
                const dateKey = date.toISOString().split('T')[0];
                const dayData = dataMap.get(dateKey)?.[restaurant.name];
                return dayData
                    ? (showOnly.includes('approved') ? dayData.totalApprovedAndConfirmedBookings : 0) +
                    (showOnly.includes('pending') ? dayData.totalPendingBookings : 0)
                    : 0;
            });

            datasets.push({
                label: restaurant.name,
                data: chartData,
                borderColor: color,
                backgroundColor: color + '20',
                tension: 0.4,
                fill: false,
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5
            });
        });

        return { labels, datasets };
    }

    function updateKPIs() {
        if (!dashboardData || !dashboardData.data || dashboardData.data.length === 0) {
            $('.kpi-value').eq(0).text('0');
            $('.kpi-value').eq(1).text('0');
            $('.kpi-value').eq(2).text('0');
            $('.kpi-value').eq(3).text('0');
            return;
        }

        const allRestaurantsChecked = $('input[name="restaurant"][value="all"]').is(':checked');
        const selectedRestaurants = allRestaurantsChecked
            ? []
            : $('input[name="restaurant"]:checked:not([value="all"])').map((i, el) => el.value).get();

        const filteredData = allRestaurantsChecked
            ? dashboardData.data
            : selectedRestaurants.length === 0
                ? []
                : dashboardData.data.filter(r => selectedRestaurants.includes(r.name));

        const totals = filteredData.reduce((acc, restaurant) => {
            restaurant.summaries.forEach(day => {
                acc.bookings += day.totalApprovedAndConfirmedBookings || 0;
                acc.pending += day.totalPendingBookings || 0;
                acc.cancelled += day.totalCanceledBookings || 0;
                acc.guests += day.totalApprovedAndConfirmedGuests || 0;
            });
            return acc;
        }, { bookings: 0, pending: 0, cancelled: 0, guests: 0 });

        $('.kpi-value').eq(0).text(totals.bookings);
        $('.kpi-value').eq(1).text(totals.pending);
        $('.kpi-value').eq(2).text(totals.cancelled);
        $('.kpi-value').eq(3).text(totals.guests);
    }

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
                    plugins: {
                        legend: { display: true, position: 'bottom' }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { display: true, color: '#e5e7eb' }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });
        }
    }

    function updateDynamicText() {
        $('#dashboardSub').text(`Showing activity for ${formatRangeDisplay(currentRange.from, currentRange.to)}`);
        $('#chartTitle').text(`Bookings · ${formatRangeDisplay(currentRange.from, currentRange.to)}`);
        $('#totalBookingsMeta, #cancelledMeta').text(formatRangeDisplay(currentRange.from, currentRange.to));
    }

    function initDatePicker() {
        const $input = $('#dateRange');
        if (!$input.length || typeof flatpickr === 'undefined') return;

        if (datePicker) {
            datePicker.destroy();
        }

        datePicker = flatpickr($input[0], {
            mode: 'range',
            dateFormat: 'Y-m-d',
            defaultDate: [currentRange.from, currentRange.to],
            allowInput: false,
            clickOpens: true,
            onReady: function (_, __, instance) {
                instance.input.value = formatRangeDisplay(currentRange.from, currentRange.to);
            },
            onChange: function (selectedDates, _, instance) {
                if (selectedDates.length === 2) {
                    currentRange.from = selectedDates[0];
                    currentRange.to = selectedDates[1];
                    instance.input.value = formatRangeDisplay(currentRange.from, currentRange.to);
                }
            }
        });

        $('#applyDateFilter')
            .off('click')
            .on('click', async function () {
                if (!currentRange.from || !currentRange.to) return;
                await loadDashboardData(currentRange.from, currentRange.to);
                updateKPIs();
                updateChart();
                updateDynamicText();
            });
    }

    async function initializeDashboard() {
        const defaults = getDefaultRange();
        currentRange.from = defaults.from;
        currentRange.to = defaults.to;

        await loadDashboardData(currentRange.from, currentRange.to);

        renderHeaderWithBrand(
            dashboardData.brand,
            'Dashboard',
            'Your booking activity at a glance.'
        );

        populateRestaurantFilter();
        updateKPIs();
        updateChart();
        updateDynamicText();

        setTimeout(() => {
            initDatePicker();
        }, 0);
    }

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

    initializeDashboard();
}