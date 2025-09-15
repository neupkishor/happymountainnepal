import type { Tour, BlogPost, TeamMember, Destination, Partner } from './types';
import { slugify } from './utils';

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
        slug: slugify('Resham Rijal (Ray)'),
        name: 'Resham Rijal (Ray)',
        role: 'Founder, Leader, Planner & Host',
        bio: "Resham's (Ray) journey through the rugged trails and majestic peaks of the Nepali mountains is a testament to his enduring passion for adventure.",
        image: 'https://picsum.photos/seed/team-1/400/400',
    },
    {
        id: '2',
        slug: slugify('Sanjaya Nepal'),
        name: 'Sanjaya Nepal',
        role: 'Co-founder',
        bio: 'Sanjaya Nepal, co-founder of Happy Mountain Nepal, brings a wealth of experience from diverse fields including trekking, tourism, and photography.',
        image: 'https://picsum.photos/seed/team-2/400/400',
    },
    {
        id: '3',
        slug: slugify('Laxmi Nepal'),
        name: 'Laxmi Nepal',
        role: 'General Manager',
        bio: 'General Manager of Happy Mountain Nepal Pvt Ltd, epitomizes hard work, dedication, and a wealth of experience in managing tourism institutions.',
        image: 'https://picsum.photos/seed/team-3/400/400',
    },
    {
        id: '4',
        slug: slugify('Sarala Pokharel'),
        name: 'Sarala Pokharel',
        role: 'Accountant',
        bio: 'Sarala Pokharel, hailing from the lap of Gaurishankar Mountain near Mt. Everest, brings a unique perspective to her role as an Accountant.',
        image: 'https://picsum.photos/seed/team-4/400/400',
    },
    {
        id: '5',
        slug: slugify('Pravin Baniya (Prav)'),
        name: 'Pravin Baniya (Prav)',
        role: 'Tour Leader',
        bio: 'Pravin is an exceptionally experienced tour (City) guide renowned for his profound understanding of Nepali culture, history, art, and architecture.',
        image: 'https://picsum.photos/seed/team-5/400/400',
    },
    {
        id: '6',
        slug: slugify('Santosh Rijal'),
        name: 'Santosh Rijal',
        role: 'Chinese/English Guide',
        bio: 'Santosh Rijal distinguishes himself as a seasoned trekking guide fluent in both English and Chinese, boasting over eight years of mountain experience.',
        image: 'https://picsum.photos/seed/team-6/400/400',
    },
    {
        id: '7',
        slug: slugify('Ashok Ghale'),
        name: 'Ashok Ghale',
        role: 'Trekking Leader',
        bio: "Ashok, a native of Dhading, embodies youthful energy and enthusiasm deeply rooted in his upbringing amidst Nepal's mountains.",
        image: 'https://picsum.photos/seed/team-7/400/400',
    },
    {
        id: '8',
        slug: slugify('Hari Adhikari'),
        name: 'Hari Adhikari',
        role: 'Trekking Leader',
        bio: 'Mr. Hari is a seasoned trekking guide with over two decades of experience navigating the mighty Himalayas, earning accolades for his exceptional service.',
        image: 'https://picsum.photos/seed/team-8/400/400',
    },
    {
        id: '9',
        slug: slugify('Muktinath Nepal'),
        name: 'Muktinath Nepal',
        role: 'Trekking Leader',
        bio: 'Muktinath Nepal brings a wealth of knowledge about the mountains, culture and people of Nepal to his role as a Trekking Guide.',
        image: 'https://picsum.photos/seed/team-9/400/400',
    },
    {
        id: '10',
        slug: slugify('Gokarna Thapa'),
        name: 'Gokarna Thapa',
        role: 'Trekking Leader',
        bio: 'Since 2012, Mr. Gokarna Thapa has built a trusted reputation as a government-licensed trekking guide, fluent in English and Nepali.',
        image: 'https://picsum.photos/seed/team-10/400/400',
    },
    {
        id: '11',
        slug: slugify('Danielle Cameron & Tony Gerasimou'),
        name: 'Danielle Cameron & Tony Gerasimou',
        role: 'Australia Representative',
        bio: 'Yogi, Yoga Instructor, and our official representatives for Australia, bringing a holistic approach to travel and wellness.',
        image: 'https://picsum.photos/seed/team-11/400/400',
    },
    {
        id: '12',
        slug: slugify('David John Keegan'),
        name: 'David John Keegan',
        role: 'UK Representative',
        bio: 'Our valued representative in the United Kingdom, helping adventurers from the UK plan their perfect Himalayan journey.',
        image: 'https://picsum.photos/seed/team-12/400/400',
    },
    {
        id: '13',
        slug: slugify('Puja Rijal'),
        name: 'Puja Rijal',
        role: 'USA Representative',
        bio: 'Puja is a passionate travel enthusiast known for her extensive journeys through the majestic Himalayas of Nepal.',
        image: 'https://picsum.photos/seed/team-13/400/400',
    },
    {
        id: '14',
        slug: slugify('Tika Ram Rijal'),
        name: 'Tika Ram Rijal',
        role: 'Canada Representative',
        bio: 'Tika Ram is a passionate travel enthusiast who has explored various parts of the world. He currently serves as the Canada Representative.',
        image: 'https://picsum.photos/seed/team-14/400/400',
    }
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
];

export const partners: Partner[] = [
  {
    id: '1',
    name: 'Nepal Tourism Board',
    logo: 'https://picsum.photos/seed/partner-ntb/200/100',
    description: 'Recognized by the official tourism body of Nepal.'
  },
  {
    id: '2',
    name: 'Trek Magazine',
    logo: 'https://picsum.photos/seed/partner-2/200/100',
    description: 'Recognized for our commitment to sustainable tourism.'
  },
  {
    id: '3',
    name: 'Himalayan Trust',
    logo: 'https://picsum.photos/seed/partner-3/200/100',
    description: 'In partnership to support local communities and conservation.'
  },
  {
    id: '4',
    name: 'TAAN',
    logo: 'https://picsum.photos/seed/partner-taan/200/100',
    description: "Member of Trekking Agencies' Association of Nepal."
  }
];
