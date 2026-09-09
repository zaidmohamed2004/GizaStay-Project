const GIZASTAY_HOTELS = [
  {
    id: "azure-horizon",
    name: "Azure Horizon Hotel",
    location: "Nice, France",
    type: "Hotels",
    category: "luxury",
    price: 165,
    rating: 5,
    reviews: 350,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=85",
    ],
    tags: "Luxury Hotel Sea View Room King Bed",
    description:
      "A bright seafront hotel with comfortable rooms, a rooftop pool and easy access to the old town.",
    amenities: [
      "Free WiFi",
      "Pool",
      "Breakfast",
      "Air conditioning",
      "Parking",
      "Sea view",
    ],
  },
  {
    id: "palm-grove",
    name: "Palm Grove House",
    location: "Algarve, Portugal",
    type: "Villas",
    category: "seaside",
    price: 175,
    rating: 5,
    reviews: 200,
    image:
      "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=900&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=900&q=85",
    ],
    tags: "Villa Private Pool Garden",
    description:
      "A peaceful villa surrounded by palm trees with a private pool and beautiful outdoor space.",
    amenities: [
      "Private pool",
      "Free WiFi",
      "Kitchen",
      "Garden",
      "Parking",
      "Pet friendly",
    ],
  },
  {
    id: "casa-tranquila",
    name: "Casa Tranquila Guesthouse",
    location: "Tulum, Mexico",
    type: "Guesthouses",
    category: "beach",
    price: 145,
    rating: 4.8,
    reviews: 160,
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85",
    ],
    tags: "Beach Guesthouse Breakfast",
    description:
      "A cozy guesthouse close to the beach with a relaxed atmosphere and open-air courtyard.",
    amenities: [
      "Free WiFi",
      "Breakfast",
      "Air conditioning",
      "Bicycle rental",
      "Hammocks",
    ],
  },
  {
    id: "villa-san-martino",
    name: "Villa San Martino",
    location: "Amalfi Coast, Italy",
    type: "Villas",
    category: "historic",
    price: 190,
    rating: 5,
    reviews: 160,
    image:
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=900&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=900&q=85",
    ],
    tags: "Cliffside Villa Sea View",
    description:
      "A beautiful cliffside villa overlooking the sea with spacious terraces and a peaceful setting.",
    amenities: [
      "Sea view",
      "Free WiFi",
      "Air conditioning",
      "Terrace",
      "Parking",
    ],
  },
  {
    id: "cairo-nile-loft",
    name: "Nile View Loft",
    location: "Cairo, Egypt",
    type: "Apartments",
    category: "harborfront",
    price: 95,
    rating: 4.7,
    reviews: 210,
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85",
    ],
    tags: "Apartment Nile View Kitchen",
    description:
      "A modern apartment with large windows, Nile views and easy access to downtown Cairo.",
    amenities: [
      "Nile view",
      "Free WiFi",
      "Kitchen",
      "Air conditioning",
      "Elevator",
      "Gym",
    ],
  },
  {
    id: "coral-reef",
    name: "Coral Reef Retreat",
    location: "Sharm El Sheikh, Egypt",
    type: "Hotels",
    category: "beach",
    price: 130,
    rating: 4.9,
    reviews: 480,
    image:
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=900&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=85",
    ],
    tags: "Beach Hotel Diving Pool",
    description:
      "A beachfront hotel close to Red Sea coral reefs with a pool, beach access and relaxing views.",
    amenities: [
      "Private beach",
      "Diving",
      "Pool",
      "Free WiFi",
      "Breakfast",
      "Spa",
    ],
  },
  {
    id: "melia-sky",
    name: "Melia Barcelona Sky",
    location: "Barcelona, Spain",
    type: "Hotels",
    category: "spa",
    price: 180,
    rating: 4.6,
    reviews: 1030,
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=85",
    ],
    tags: "Spa Hotel Premium Room",
    description:
      "A modern city hotel with premium rooms, spa facilities and excellent city views.",
    amenities: [
      "Spa",
      "Free WiFi",
      "Pool",
      "Breakfast",
      "Gym",
      "Air conditioning",
    ],
  },
  {
    id: "grand-marina",
    name: "Eurostars Grand Marina",
    location: "Barcelona, Spain",
    type: "Hotels",
    category: "harborfront",
    price: 160,
    rating: 4.4,
    reviews: 760,
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=85",
    ],
    tags: "Harborfront Hotel Deluxe Room",
    description:
      "A stylish harborfront hotel with comfortable rooms and easy access to Barcelona attractions.",
    amenities: [
      "Harbor view",
      "Free WiFi",
      "Pool",
      "Breakfast",
      "Gym",
      "Parking",
    ],
  },
  {
    id: "pyramids-view",
    name: "Pyramids View Hotel",
    location: "Giza, Egypt",
    type: "Hotels",
    category: "landmark",
    price: 140,
    rating: 4.8,
    reviews: 610,
    image:
      "https://images.unsplash.com/photo-1539768942893-daf53e448371?auto=format&fit=crop&w=900&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1539768942893-daf53e448371?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=900&q=85",
    ],
    tags: "Landmark Hotel Pyramid View Rooftop",
    description:
      "A rooftop-pool hotel with direct views of the Giza Pyramids and easy access to the plateau.",
    amenities: [
      "Pyramid view",
      "Free WiFi",
      "Rooftop pool",
      "Breakfast",
      "Air conditioning",
      "Airport shuttle",
    ],
  },
];
if (typeof window !== "undefined") window.GIZASTAY_HOTELS = GIZASTAY_HOTELS;
function gizastayGetHotel(id) {
  return GIZASTAY_HOTELS.find((h) => h.id === id) || null;
}
if (typeof window !== "undefined") window.gizastayGetHotel = gizastayGetHotel;
