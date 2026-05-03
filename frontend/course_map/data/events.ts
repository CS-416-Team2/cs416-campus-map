import type { CampusEvent } from "@/types";

export const CAMPUS_EVENTS: CampusEvent[] = [
  {
    id: "1",
    title: "Annual Tech Innovation Summit",
    description:
      "Connect with industry leaders and innovators at our flagship technology summit. Featuring keynote speakers from top tech companies and interactive workshops.",
    date: "Oct 24, 2023",
    time: "10:00 AM",
    location: "Main Auditorium, Building 4",
    category: "orange",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBEhT26-S8vHGXuMqev0KrLRT3QzpEQQIbj_Nptvq8-U8_JWmtuW42ZDx49_JUODSE5RrZN4Y7tVNdiZGPm5PZkcjVhHkncXzvgtWKCWxk_oPhFU1eagcseFPuhjZaPKHAeBB4vDKk8hignXlOFbWOWWxHj-Eo36p93QD8IttA-MgAYp-khEySWH-_k0YTEFls2wf0WWLH618Q6metxb035ZtW_15S-k6sHVdTRIjrwdX0nBBWCkiQh015JbzjUt7_UAY6ckspp35Jr",
    coordinates: [-122.1697, 37.4275],
    capacity: 500,
    registered: 342,
    tags: ["academic", "workshops"],
    parking: [
      {
        id: "p1",
        name: "North Gate Garage",
        distance: "0.2 miles away",
        spotsLeft: 45,
        price: "Free",
      },
      {
        id: "p2",
        name: "Visitor Lot B",
        distance: "0.5 miles away",
        spotsLeft: 8,
        price: "$5.00",
      },
    ],
  },
  {
    id: "2",
    title: "Career Networking Night",
    description:
      "An evening of professional networking with representatives from 30+ companies across various industries. Dress professionally and bring your resume.",
    date: "Oct 26, 2023",
    time: "06:00 PM",
    location: "Science Plaza Atrium",
    category: "green",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAumFnPF2NiB664gANTa4uDcgk5ahgFFOsfIkVub8wWcRFjfDUsSW_8dGfYBNyDNY0MuS5cGpGmVt-rNTd205QtHEh_2SavUb-pcR7umf7L8BwkFF4gAOH4ql3LQci8f9regODR1Vznk_vNc8gheJjkIIFvPkDFYJiZJUzEPFoLjb_d7vBMuj9SBZTc0qMtaRVo3IR5Q6XPQAPY-xxUDNXmuG7wRJH9HyLhM8I1EdZnNIGPNS5ML2srG0821dvsZcp0qFFjOdHz16fq",
    coordinates: [-122.168, 37.426],
    capacity: 300,
    registered: 198,
    tags: ["social"],
    parking: [
      {
        id: "p3",
        name: "East Campus Lot",
        distance: "0.3 miles away",
        spotsLeft: 120,
        price: "$3.00",
      },
    ],
  },
  {
    id: "3",
    title: "Fall Campus Festival",
    description:
      "Celebrate the fall semester with food, music, games, and activities for the whole campus community. Free entry for all students.",
    date: "Oct 28, 2023",
    time: "12:00 PM",
    location: "Central Quad Area",
    category: "blue",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB2G-gjz9CisbLYRutL29zbVD1lcJylVJEcwPcOAhWhP69Ib5qeJU4HHQeb2pmrc1n2WE0FsBwpzsJFEGjGu1kkf0ukkvdGClSFvkRLN3kWwGqrMewsHs3jXJdlzBBEUrBewXzFUh-6ZgFbeE1cd3joo7aDFDnofxbhkJmjFOG814UFOutlPwAIGhDPHzK81-1TciRs11Z-1Xif5ei1coByxoKUrPdujcOuzBsVt4MNhlWHImD7JOyWOZvdTgrgYWUDg2jUY97Pw0Pu",
    coordinates: [-122.171, 37.429],
    capacity: 1000,
    registered: 567,
    tags: ["social", "athletics"],
    parking: [
      {
        id: "p4",
        name: "South Parking Structure",
        distance: "0.1 miles away",
        spotsLeft: 200,
        price: "Free",
      },
    ],
  },
  {
    id: "4",
    title: "Physics: Beyond the Stars Lecture",
    description:
      "A public lecture series on modern astrophysics, dark matter, and the latest discoveries from the James Webb Space Telescope.",
    date: "Nov 2, 2023",
    time: "07:00 PM",
    location: "Lecture Hall B, Science Complex",
    category: "blue",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuARjGhPNxhavWzMgMv8r7RJ-dQZDY7uKtFSlZPre_wXzHBcYrusC15mqgFctXAI1Y1M3fjysng_Jzz6OqvaxR7ZwGXvZM2yUsfiTUdJlxh5SIjetp4-o_NLeFtYTiVQI_hX0BvsuR8pmdDUJS9mpAlNFroP9iOWI1Zv80FHg70La7OIEwj75eTQ28yHPMVwvw7C34_M9vNVj6fZbwwTjngFrZoNLlq8XAIH-S-vWnLLvMQSlPxJ0ATapCYdmVYG7QsqPxbJwbD9uLBF",
    coordinates: [-122.1725, 37.4265],
    capacity: 250,
    registered: 89,
    tags: ["academic"],
    parking: [
      {
        id: "p5",
        name: "Visitor Lot A",
        distance: "0.2 miles away",
        spotsLeft: 60,
        price: "$2.00",
      },
    ],
  },
  {
    id: "5",
    title: "Campus Innovators Hackathon",
    description:
      "A 24-hour hackathon open to all students. Build innovative solutions to real campus challenges. Prizes worth $5,000 up for grabs.",
    date: "Nov 10, 2023",
    time: "09:00 AM",
    location: "Engineering Building, Room 301",
    category: "orange",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBEhT26-S8vHGXuMqev0KrLRT3QzpEQQIbj_Nptvq8-U8_JWmtuW42ZDx49_JUODSE5RrZN4Y7tVNdiZGPm5PZkcjVhHkncXzvgtWKCWxk_oPhFU1eagcseFPuhjZaPKHAeBB4vDKk8hignXlOFbWOWWxHj-Eo36p93QD8IttA-MgAYp-khEySWH-_k0YTEFls2wf0WWLH618Q6metxb035ZtW_15S-k6sHVdTRIjrwdX0nBBWCkiQh015JbzjUt7_UAY6ckspp35Jr",
    coordinates: [-122.1685, 37.4280],
    capacity: 150,
    registered: 143,
    tags: ["academic", "workshops"],
    parking: [
      {
        id: "p6",
        name: "Engineering Lot",
        distance: "0.05 miles away",
        spotsLeft: 30,
        price: "Free",
      },
    ],
  },
];

export const SELECTABLE_EVENTS = CAMPUS_EVENTS.map((e) => ({
  value: e.id,
  label: e.title,
}));
