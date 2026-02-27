
// Mock data for restaurants
const mockData = {
    restaurants: [
        {
            id: "1",
            name: "The Garden Bistro",
            description: "A cozy restaurant serving fresh, locally-sourced cuisine in a beautiful garden setting. Perfect for romantic dinners and special occasions.",
            bannerURL: "https://picsum.photos/seed/garden-bistro/800/400.jpg",
            photosURL: [
                "https://picsum.photos/seed/garden1/400/300.jpg",
                "https://picsum.photos/seed/garden2/400/300.jpg"
            ],
            brand: {
                id: "brand1",
                name: "Garden Restaurants",
                logoURL: "https://picsum.photos/seed/garden-logo/100/100.jpg"
            },
            address: {
                building: "123",
                street: "Rose Street",
                city: "London",
                postcode: "SW1A 1AA",
                country: "United Kingdom",
                latitude: 51.5074,
                longitude: -0.1278
            },
            availability: {
                date: "2024-02-20",
                autoConfirmGuestsLimit: 20
            }
        },
        {
            id: "2",
            name: "Urban Kitchen",
            description: "Modern urban dining experience with innovative fusion cuisine. Located in the heart of the city with a vibrant atmosphere.",
            bannerURL: "https://picsum.photos/seed/urban-kitchen/800/400.jpg",
            photosURL: [
                "https://picsum.photos/seed/urban1/400/300.jpg",
                "https://picsum.photos/seed/urban2/400/300.jpg"
            ],
            brand: {
                id: "brand2",
                name: "Urban Dining Group",
                logoURL: "https://picsum.photos/seed/urban-logo/100/100.jpg"
            },
            address: {
                building: "456",
                street: "High Street",
                city: "Manchester",
                postcode: "M1 1AA",
                country: "United Kingdom",
                latitude: 53.4808,
                longitude: -2.2426
            },
            availability: {
                date: "2024-02-20",
                autoConfirmGuestsLimit: 15
            }
        },
        {
            id: "3",
            name: "Seaside Delights",
            description: "Fresh seafood restaurant with stunning ocean views. Specializing in locally-caught seafood and traditional coastal dishes.",
            bannerURL: "https://picsum.photos/seed/seaside-delights/800/400.jpg",
            photosURL: [
                "https://picsum.photos/seed/seaside1/400/300.jpg",
                "https://picsum.photos/seed/seaside2/400/300.jpg"
            ],
            brand: {
                id: "brand3",
                name: "Coastal Eateries",
                logoURL: "https://picsum.photos/seed/coastal-logo/100/100.jpg"
            },
            address: {
                building: "789",
                street: "Harbor Road",
                city: "Brighton",
                postcode: "BN1 1AA",
                country: "United Kingdom",
                latitude: 50.8225,
                longitude: -0.1372
            },
            availability: {
                date: "2024-02-20",
                autoConfirmGuestsLimit: 25
            }
        },
        {
            id: "4",
            name: "The Rustic Table",
            description: "Farm-to-table dining experience with a warm, rustic atmosphere. Enjoy seasonal dishes made with ingredients from local farms.",
            bannerURL: "https://picsum.photos/seed/rustic-table/800/400.jpg",
            photosURL: [
                "https://picsum.photos/seed/rustic1/400/300.jpg",
                "https://picsum.photos/seed/rustic2/400/300.jpg"
            ],
            brand: {
                id: "brand4",
                name: "Rustic Hospitality",
                logoURL: "https://picsum.photos/seed/rustic-logo/100/100.jpg"
            },
            address: {
                building: "321",
                street: "Village Lane",
                city: "Oxford",
                postcode: "OX1 1AA",
                country: "United Kingdom",
                latitude: 51.7520,
                longitude: -1.2577
            },
            availability: {
                date: "2024-02-20",
                autoConfirmGuestsLimit: 18
            }
        },
        {
            id: "5",
            name: "Spice Route",
            description: "Authentic Indian and Asian fusion cuisine with a modern twist. Experience exotic flavors in a contemporary setting.",
            bannerURL: "https://picsum.photos/seed/spice-route/800/400.jpg",
            photosURL: [
                "https://picsum.photos/seed/spice1/400/300.jpg",
                "https://picsum.photos/seed/spice2/400/300.jpg"
            ],
            brand: {
                id: "brand5",
                name: "Asian Fusion Group",
                logoURL: "https://picsum.photos/seed/asian-logo/100/100.jpg"
            },
            address: {
                building: "654",
                street: "Curry Street",
                city: "Birmingham",
                postcode: "B1 1AA",
                country: "United Kingdom",
                latitude: 52.4862,
                longitude: -1.8904
            },
            availability: {
                date: "2024-02-20",
                autoConfirmGuestsLimit: 30
            }
        }
    ],
    
    // Mock booking data
    bookings: [
        {
            id: "550e8400-e29b-41d4-a716-446655440000",
            guestsNumber: 4,
            bookingTime: "2024-02-20T19:00:00Z",
            status: "CONFIRMED",
            discussion: [
                {
                    authorID: "789e0123-e45b-67d8-a456-426614174000",
                    authorType: "USER",
                    message: "Please prepare a table near the window",
                    createdAt: "2024-02-15T10:30:00Z"
                }
            ],
            restaurant: {
                id: "123e4567-e89b-12d3-a456-426614174000",
                name: "The Golden Dragon",
                description: "Authentic Chinese cuisine with a modern twist in an elegant setting",
                bannerURL: "https://picsum.photos/seed/golden-dragon/800/400.jpg",
                brand: {
                    id: "brand1",
                    name: "Dragon Restaurants",
                    logoURL: "https://picsum.photos/seed/dragon-logo/100/100.jpg"
                }
            },
            createdAt: "2024-02-15T10:30:00Z",
            updatedAt: "2024-02-15T10:30:00Z"
        },
        {
            id: "550e8400-e29b-41d4-a716-446655440001",
            guestsNumber: 2,
            bookingTime: "2024-02-22T20:30:00Z",
            status: "PENDING",
            discussion: [
                {
                    authorID: "789e0123-e45b-67d8-a456-426614174000",
                    authorType: "USER",
                    message: "Celebrating anniversary",
                    createdAt: "2024-02-16T14:20:00Z"
                }
            ],
            restaurant: {
                id: "123e4567-e89b-12d3-a456-426614174001",
                name: "Bella Italia",
                description: "Traditional Italian restaurant serving authentic pasta and pizza dishes",
                bannerURL: "https://picsum.photos/seed/bella-italia/800/400.jpg",
                brand: {
                    id: "brand2",
                    name: "Italian Dining Group",
                    logoURL: "https://picsum.photos/seed/italian-logo/100/100.jpg"
                }
            },
            createdAt: "2024-02-16T14:20:00Z",
            updatedAt: null
        },
        {
            id: "550e8400-e29b-41d4-a716-446655440002",
            guestsNumber: 6,
            bookingTime: "2024-02-25T18:00:00Z",
            status: "CANCELLED",
            discussion: [
                {
                    authorID: "789e0123-e45b-67d8-a456-426614174000",
                    authorType: "USER",
                    message: "Large group booking",
                    createdAt: "2024-02-10T09:15:00Z"
                },
                {
                    authorID: "123e4567-e89b-12d3-a456-426614174002",
                    authorType: "RESTAURANT",
                    message: "We can accommodate your group in our private dining area",
                    createdAt: "2024-02-10T10:30:00Z"
                }
            ],
            restaurant: {
                id: "123e4567-e89b-12d3-a456-426614174002",
                name: "Spice Garden",
                description: "Award-winning Indian restaurant featuring traditional and contemporary dishes",
                bannerURL: "https://picsum.photos/seed/spice-garden/800/400.jpg",
                brand: {
                    id: "brand3",
                    name: "Spice Hospitality",
                    logoURL: "https://picsum.photos/seed/spice-logo/100/100.jpg"
                }
            },
            createdAt: "2024-02-10T09:15:00Z",
            updatedAt: "2024-02-12T15:45:00Z"
        }
    ]
};
// Simple mock responses for API endpoints
export const mockResponses = {
    // GET /api/b2c/restaurants/
    getRestaurants: () => {
        return mockData;
    },
    
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
        const restaurants = [
            { id: "123e4567-e89b-12d3-a456-426614174001", name: "Pizza/Pasta", baseBookings: 50, variance: 15 },
            { id: "123e4567-e89b-12d3-a456-426614174002", name: "Pizza World", baseBookings: 35, variance: 12 },
            { id: "123e4567-e89b-12d3-a456-426614174003", name: "Sushi / Ramen", baseBookings: 20, variance: 8 }
        ];
        
        const data = restaurants.map(restaurant => {
            const summaries = [];
            
            for (let i = 0; i < daysDiff; i++) {
                const currentDate = new Date(timeFrom);
                currentDate.setDate(timeFrom.getDate() + i);
                
                // Generate realistic booking numbers with ups and downs
                const dayOfWeek = currentDate.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                
                // Weekend effect: higher bookings
                const weekendMultiplier = isWeekend ? 1.3 : 1.0;
                
                // Random variation for realistic ups and downs
                const randomVariation = 0.7 + Math.random() * 0.6; // 70% to 130%
                
                // Calculate bookings
                const approvedBookings = Math.round(restaurant.baseBookings * weekendMultiplier * randomVariation);
                const pendingBookings = Math.round(approvedBookings * 0.1 + Math.random() * 5); // ~10% of approved + random
                const totalGuests = Math.round(approvedBookings * (2.5 + Math.random() * 1.5)); // 2.5-4 guests per booking
                
                summaries.push({
                    date: currentDate.toISOString(),
                    totalApprovedBookings: approvedBookings,
                    totalPendingBookings: pendingBookings,
                    totalGuests: totalGuests,
                    autoConfirmGuestsLimit: restaurant.baseBookings < 30 ? 15 : 25
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
