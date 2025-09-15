import type { Tour, BlogPost, TeamMember, Destination } from './types';

export const tours: Tour[] = [
  {
    id: '1',
    slug: 'everest-base-camp-trek',
    name: 'Everest Base Camp Trek',
    description: 'The Everest Base Camp trek is the quintessential Himalayan adventure, leading you through Sherpa villages and breathtaking landscapes to the foot of the world\'s highest peak.',
    region: 'Everest',
    type: 'Trek',
    difficulty: 'Strenuous',
    duration: 14,
    price: 1350,
    mainImage: 'https://picsum.photos/seed/tour-ebc/600/400',
    images: [
      'https://picsum.photos/seed/tour-detail-1/1200/800',
      'https://picsum.photos/seed/tour-detail-2/1200/800',
      'https://picsum.photos/seed/tour-detail-3/1200/800',
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Kathmandu', description: 'Transfer to hotel and trip briefing.' },
      { day: 2, title: 'Fly to Lukla, Trek to Phakding', description: 'An exciting flight to Lukla and a short trek to Phakding.' },
      { day: 3, title: 'Trek to Namche Bazaar', description: 'Enter the Sagarmatha National Park and ascend to the Sherpa capital.' },
      { day: 4, title: 'Acclimatization Day in Namche', description: 'Hike to Everest View Hotel for stunning panoramas.' },
      { day: 5, title: 'Trek to Tengboche', description: 'Visit the famous Tengboche Monastery with Ama Dablam in the background.' },
      { day: 6, title: 'Trek to Dingboche', description: 'Cross the tree line and enter the alpine zone.' },
      { day: 7, title: 'Acclimatization Day in Dingboche', description: 'Hike up Nangkartshang Peak for incredible views of Makalu and Lhotse.' },
      { day: 8, title: 'Trek to Lobuche', description: 'Walk past the Everest memorial stupas.' },
      { day: 9, title: 'Trek to Gorak Shep & EBC', description: 'Reach Everest Base Camp and return to Gorak Shep.' },
      { day: 10, title: 'Hike Kala Patthar, Trek to Pheriche', description: 'Witness the best sunrise view of Everest from Kala Patthar.' },
      { day: 11, title: 'Trek back to Namche Bazaar', description: 'Descend through familiar trails.' },
      { day: 12, title: 'Trek to Lukla', description: 'Your final day of trekking.' },
      { day: 13, title: 'Fly back to Kathmandu', description: 'Enjoy a scenic flight back to the city.' },
      { day: 14, title: 'Departure', description: 'Transfer to the airport for your flight home.' },
    ],
    inclusions: ['Airport transfers', 'Accommodation in Kathmandu', 'Internal flights', 'Licensed guide', 'Porter service', 'All permits'],
    exclusions: ['International airfare', 'Nepal visa fee', 'Travel insurance', 'Lunches and dinners in Kathmandu', 'Personal expenses'],
    departureDates: [
      { date: '2024-10-05', price: 1350, guaranteed: true },
      { date: '2024-10-12', price: 1350, guaranteed: false },
      { date: '2024-11-02', price: 1400, guaranteed: true },
    ],
    mapImage: 'https://picsum.photos/seed/map-placeholder/800/600',
    reviews: [
        { id: 'r1', rating: 5, author: 'Jane Doe', comment: 'An unforgettable experience! The views were surreal and our guide was fantastic.', date: '2023-11-20' },
        { id: 'r2', rating: 4, author: 'John Smith', comment: 'Tough but rewarding. Make sure you are well-prepared for the altitude.', date: '2023-10-15' },
    ],
  },
  {
    id: '2',
    slug: 'annapurna-circuit-trek',
    name: 'Annapurna Circuit Trek',
    description: 'A classic trek that circles the Annapurna massif, offering diverse landscapes from lush forests to arid high-altitude deserts and crossing the dramatic Thorong La Pass.',
    region: 'Annapurna',
    type: 'Trek',
    difficulty: 'Challenging',
    duration: 18,
    price: 1500,
    mainImage: 'https://picsum.photos/seed/tour-annapurna/600/400',
    images: [
        'https://picsum.photos/seed/tour-detail-1/1200/800',
        'https://picsum.photos/seed/tour-detail-2/1200/800',
      ],
    itinerary: [
      { day: 1, title: 'Arrival in Kathmandu', description: 'Trip briefing and welcome dinner.' },
      { day: 2, title: 'Drive to Jagat', description: 'A scenic long drive to the trek starting point.' },
      { day: 3, title: 'Trek to Dharapani', description: 'The trail follows the Marsyangdi River.' },
    ],
    inclusions: ['All ground transport', 'Guide and porters', 'Accommodation during trek'],
    exclusions: ['Drinks', 'Tips', 'Personal gear'],
    departureDates: [
        { date: '2024-10-10', price: 1500, guaranteed: true },
        { date: '2024-11-05', price: 1550, guaranteed: false },
    ],
    mapImage: 'https://picsum.photos/seed/map-placeholder/800/600',
    reviews: [
        { id: 'r3', rating: 5, author: 'Emily White', comment: 'The diversity of landscapes is mind-blowing. Thorong La pass was the highlight!', date: '2023-11-25' },
    ],
  },
  {
    id: '3',
    slug: 'poon-hill-trek',
    name: 'Poon Hill Trek',
    description: 'A short and relatively easy trek in the Annapurna region, famous for its spectacular sunrise views over the Himalayas from Poon Hill.',
    region: 'Annapurna',
    type: 'Trek',
    difficulty: 'Easy',
    duration: 5,
    price: 450,
    mainImage: 'https://picsum.photos/seed/tour-poonhill/600/400',
    images: [
        'https://picsum.photos/seed/tour-detail-1/1200/800',
        'https://picsum.photos/seed/tour-detail-2/1200/800',
      ],
    itinerary: [
      { day: 1, title: 'Drive to Nayapul, Trek to Ulleri', description: 'Start the trek with a climb up the stone stairs to Ulleri.' },
      { day: 2, title: 'Trek to Ghorepani', description: 'Walk through beautiful rhododendron forests.' },
    ],
    inclusions: ['Pokhara hotel pickup/dropoff', 'Guide', 'Permits'],
    exclusions: ['Accommodation in Pokhara', 'Meals', 'Flights to Pokhara'],
    departureDates: [
        { date: '2024-09-20', price: 450, guaranteed: false },
        { date: '2024-09-25', price: 450, guaranteed: true },
    ],
    mapImage: 'https://picsum.photos/seed/map-placeholder/800/600',
    reviews: [
        { id: 'r4', rating: 5, author: 'Michael Brown', comment: 'Perfect for a short getaway. The sunrise was absolutely worth the early morning hike.', date: '2024-03-10' },
    ],
  },
    {
    id: '4',
    slug: 'langtang-valley-trek',
    name: 'Langtang Valley Trek',
    description: 'Often called the valley of glaciers, this trek is a perfect blend of natural beauty and cultural exploration, located just a short drive from Kathmandu.',
    region: 'Langtang',
    type: 'Trek',
    difficulty: 'Moderate',
    duration: 8,
    price: 750,
    mainImage: 'https://picsum.photos/seed/tour-langtang/600/400',
    images: [
        'https://picsum.photos/seed/tour-detail-1/1200/800',
        'https://picsum.photos/seed/tour-detail-2/1200/800',
      ],
    itinerary: [
      { day: 1, title: 'Drive to Syabrubesi', description: 'A scenic drive north of Kathmandu.' },
      { day: 2, title: 'Trek to Lama Hotel', description: 'Follow the Langtang Khola river.' },
    ],
    inclusions: ['Guide and porters', 'All meals on trek', 'Accommodation'],
    exclusions: ['Hotel in Kathmandu', 'Personal expenses', 'Insurance'],
    departureDates: [
        { date: '2024-10-15', price: 750, guaranteed: true },
        { date: '2024-11-10', price: 750, guaranteed: false },
    ],
    mapImage: 'https://picsum.photos/seed/map-placeholder/800/600',
    reviews: [
        { id: 'r5', rating: 4, author: 'Sarah Green', comment: 'A beautiful and less crowded trek. The people of Langtang are so resilient and welcoming.', date: '2023-12-01' },
    ],
  },
];

export const blogPosts: BlogPost[] = [
    {
        id: '1',
        slug: 'essential-packing-list-for-nepal-treks',
        title: 'Essential Packing List for Nepal Treks',
        excerpt: 'Are you prepared for your Himalayan adventure? Our comprehensive packing list covers everything you need to stay safe, comfortable, and happy on the trail.',
        content: '<p>Packing for a trek in Nepal can be daunting. You need to be prepared for a wide range of temperatures and conditions. Here are the essentials:</p><h3>Clothing</h3><ul><li>Waterproof/windproof jacket</li><li>Down jacket</li><li>Multiple layers of fleece</li><li>Trekking shirts (quick-dry)</li><li>Trekking trousers and shorts</li><li>Thermal underwear</li></ul><h3>Footwear</h3><ul><li>Broken-in trekking boots</li><li>Comfortable camp shoes/sandals</li><li>Several pairs of woolen and synthetic socks</li></ul><h3>Gear</h3><ul><li>Backpack (40-50L)</li><li>Sleeping bag (four-season)</li><li>Trekking poles</li><li>Headlamp</li></ul>',
        author: 'Johnathan Trekker',
        date: '2024-05-15',
        image: 'https://picsum.photos/seed/blog-packing/800/500',
    },
    {
        id: '2',
        slug: 'experiencing-nepali-culture-festivals-and-food',
        title: 'Experiencing Nepali Culture: Festivals and Food',
        excerpt: 'Nepal is not just about mountains. Dive into its rich cultural tapestry, from vibrant festivals like Dashain and Tihar to the delicious and diverse local cuisine.',
        content: '<p>The culture of Nepal is a rich tapestry woven from the traditions of dozens of ethnic groups. The best way to experience it is through its festivals and food.</p><h3>Major Festivals</h3><ul><li><strong>Dashain:</strong> A 15-day national festival, usually in October, celebrating the victory of good over evil. It\'s a time for family reunions, feasts, and flying kites.</li><li><strong>Tihar:</strong> The festival of lights, celebrated over 5 days in November. Houses are decorated with oil lamps, and animals like crows, dogs, and cows are worshipped.</li></ul><h3>Must-Try Foods</h3><ul><li><strong>Dal Bhat:</strong> The national dish. A lentil soup (dal) served with steamed rice (bhat) and a vegetable curry (tarkari). It\'s an all-you-can-eat powerhouse of energy for trekkers.</li><li><strong>Momos:</strong> Delicious Tibetan-style dumplings filled with meat or vegetables, served steamed or fried with a tangy dipping sauce. A national favorite.</li></ul>',
        author: 'Aarav Sharma',
        date: '2024-04-22',
        image: 'https://picsum.photos/seed/blog-culture/800/500',
    },
];

export const teamMembers: TeamMember[] = [
    {
        id: '1',
        name: 'Pasang Sherpa',
        role: 'Lead Guide & Founder',
        bio: 'With over 20 years of experience climbing and guiding in the Himalayas, Pasang founded Happy Mountain Nepal to share his passion for the mountains with the world. He has summited Everest 5 times.',
        image: 'https://picsum.photos/seed/team-1/400/400',
    },
    {
        id: '2',
        name: 'Bimala Tamang',
        role: 'Operations Manager',
        bio: 'Bimala is the heart of our operations, ensuring every trip runs smoothly from start to finish. Her attention to detail and warm personality make her a favorite among our clients.',
        image: 'https://picsum.photos/seed/team-2/400/400',
    },
    {
        id: '3',
        name: 'Rajesh Kumar',
        role: 'Trekking Guide',
        bio: 'Rajesh has been guiding treks for over a decade. His knowledge of the local culture, flora, and fauna is encyclopedic, and his cheerful demeanor is infectious.',
        image: 'https://picsum.photos/seed/team-3/400/400',
    },
];

export const destinations: Destination[] = [
  {
    name: 'Everest',
    image: 'https://picsum.photos/seed/dest-everest/600/800',
    tourCount: 1,
  },
  {
    name: 'Annapurna',
    image: 'https://picsum.photos/seed/dest-annapurna/600/800',
    tourCount: 2,
  },
  {
    name: 'Manaslu',
    image: 'https://picsum.photos/seed/dest-manaslu/600/800',
    tourCount: 0,
  },
  {
    name: 'Langtang',
    image: 'https://picsum.photos/seed/dest-langtang/600/800',
    tourCount: 1,
  },
  {
    name: 'Mustang',
    image: 'https://picsum.photos/seed/dest-mustang/600/800',
    tourCount: 0,
  },
]
