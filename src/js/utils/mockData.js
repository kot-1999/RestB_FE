
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
    ]
};
// Simple mock responses for API endpoints
export const mockResponses = {
    // GET /api/b2c/restaurants/
    getRestaurants: () => {
        return mockData;
    },
    
};
