export default function () {
    console.log('Dashboard script loaded');
    
    // Simple chart data
    const data = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            { label: 'Pizza/Pasta', data: [45, 52, 38, 61, 55, 48, 42], borderColor: '#3b82f6', backgroundColor: '#3b82f620', tension: 0.4, fill: true },
            { label: 'Pizza World', data: [32, 41, 28, 47, 35, 39, 33], borderColor: '#10b981', backgroundColor: '#10b98120', tension: 0.4, fill: true },
            { label: 'Sushi / Ramen', data: [18, 22, 15, 28, 20, 24, 19], borderColor: '#f59e0b', backgroundColor: '#f59e0b20', tension: 0.4, fill: true }
        ]
    };
    
    // Update KPIs
    $('.kpi-value').eq(0).text(393);
    $('.kpi-value').eq(1).text(51);
    $('.kpi-value').eq(2).text(6);
    $('.kpi-value').eq(3).text(811);
    
    // Initialize chart
    let chart = null;
    
    function updateChart() {
        const ctx = document.getElementById('bookingsChart');
        if (!ctx) return;
        
        if (chart) {
            chart.update();
        } else if (typeof Chart !== 'undefined') {
            chart = new Chart(ctx, {
                type: 'line',
                data: data,
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
    updateChart();
    
    // Handle time period buttons
    $('.dash-chip').on('click', function() {
        $('.dash-chip').removeClass('is-active');
        $(this).addClass('is-active');
        updateChart();
    });
}