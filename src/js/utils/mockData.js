export const mockResponses = {
    // GET /b2c/v1/booking/
    getBookings: (queryParams = {}) => {
        let filteredBookings = mockData.bookings;
        
        // Filter by date range if provided
        if (queryParams.dateFrom) {
            filteredBookings = filteredBookings.filter(booking => 
                new Date(booking.bookingTime) >= new Date(queryParams.dateFrom)
            );
        }
        
        if (queryParams.dateTo) {
            filteredBookings = filteredBookings.filter(booking => 
                new Date(booking.bookingTime) <= new Date(queryParams.dateTo)
            );
        }
        
        // Filter by statuses if provided
        if (queryParams.statuses && Array.isArray(queryParams.statuses)) {
            filteredBookings = filteredBookings.filter(booking => 
                queryParams.statuses.includes(booking.status)
            );
        }
        
        // Pagination
        const page = parseInt(queryParams.page) || 1;
        const limit = parseInt(queryParams.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        // Return array directly (matching backend response structure)
        return filteredBookings.slice(startIndex, endIndex);
    },
    
    // GET /b2b/v1/dashboard
    getDashboard: (queryParams = {}) => {
        // Default to last 7 days if no dates provided
        const timeTo = queryParams.timeTo ? new Date(queryParams.timeTo) : new Date();
        const timeFrom = queryParams.timeFrom ? new Date(queryParams.timeFrom) : new Date(timeTo.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // Calculate number of days
        const daysDiff = Math.ceil((timeTo - timeFrom) / (1000 * 60 * 60 * 24)) + 1;
        
        // Generate data for each restaurant
        const restaurantNames = [
            'Rest 1', 'Rest 2', 'Rest 3', 'Rest 4', 'Rest 5', 
            'Rest 6', 'Rest 7', 'Rest 8', 'Rest 9', 'Rest 10'
        ];
        
        const restaurantCount = Math.floor(Math.random() * 10) + 1; // 1-10 restaurants
        
        const restaurants = [];
        for (let i = 0; i < restaurantCount; i++) {
            restaurants.push({
                id: `123e4567-e89b-12d3-a456-426614174${String(i + 1).padStart(3, '0')}`,
                name: restaurantNames[i],
                baseBookings: Math.floor(Math.random() * 120) + 60, // 60-180 base bookings
                variance: Math.floor(Math.random() * 30) + 20 // 20-50 variance
            });
        }
        
        const data = restaurants.map(restaurant => {
            const summaries = [];
            
            for (let i = 0; i < daysDiff; i++) {
                const currentDate = new Date(timeFrom);
                currentDate.setDate(timeFrom.getDate() + i);
                
                // Generate realistic booking numbers with ups and downs
                const dayOfWeek = currentDate.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                
                // Weekend effect: higher bookings
                const weekendMultiplier = isWeekend ? 1.4 : 1.0;
                
                // Random variation for realistic ups and downs
                const randomVariation = 0.6 + Math.random() * 0.8; // 60% to 140%
                
                // Add occasional zero booking days (5% chance)
                const isZeroDay = Math.random() < 0.07;
                
                // Calculate bookings
                let approvedBookings = 0;
                if (!isZeroDay) {
                    approvedBookings = Math.round(restaurant.baseBookings * weekendMultiplier * randomVariation);
                    // Cap at 300 max
                    approvedBookings = Math.min(approvedBookings, 300);
                }
                
                const pendingBookings = isZeroDay ? 0 : Math.round(approvedBookings * 0.1 + Math.random() * 8); // ~10% of approved + random
                const totalGuests = isZeroDay ? 0 : Math.round(approvedBookings * (2.5 + Math.random() * 1.5)); // 2.5-4 guests per booking
                
                summaries.push({
                    date: currentDate.toISOString(),
                    totalApprovedBookings: approvedBookings,
                    totalPendingBookings: pendingBookings,
                    totalGuests: totalGuests,
                    autoConfirmGuestsLimit: restaurant.baseBookings < 100 ? 15 : 25
                });
            }
            
            return {
                restaurant: {
                    id: restaurant.id,
                    name: restaurant.name
                },
                summaries: summaries
            };
        });
        
        return {
            brand: {
                id: "550e8400-e29b-41d4-a716-446655440001",
                name: "La Benetti",
                logoURL: "https://picsum.photos/seed/la-benetti-logo/100/100.jpg"
            },
            data: data,
            range: {
                timeFrom: timeFrom.toISOString(),
                timeTo: timeTo.toISOString()
            }
        };
    },
};
