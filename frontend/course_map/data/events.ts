import type { CampusEvent } from "@/types";

export const CAMPUS_EVENTS: CampusEvent[] = [
  {
    id: "1",
    title: "Spring 2026 Career Expo",
    description:
      "The PNW Spring Career Expo connects students and alumni with employers for full-time jobs and internships across industries and majors.",
    date: "Mar 5, 2026",
    time: "03:00 PM",
    location: "Fitness and Recreation Center Gymnasium, Hammond Campus",
    category: "orange",
    imageUrl:
      "https://www.pnw.edu/student-life/wp-content/uploads/sites/89/2024/07/2024-PNW-Spring-Career-Expo-039.jpg",
    coordinates: [-87.4729, 41.5831],
    capacity: 700,
    registered: 488,
    tags: ["academic", "workshops", "social"],
    parking: [
      {
        id: "p1",
        name: "PNW Parking Garage",
        distance: "0.2 miles away",
        spotsLeft: 112,
        price: "Free",
      },
      {
        id: "p2",
        name: "CLO Surface Lot",
        distance: "0.1 miles away",
        spotsLeft: 47,
        price: "Free",
      },
    ],
  },
  {
    id: "2",
    title: "Roar Rally Pop Up (Hammond)",
    description:
      "Students are invited to stop by, learn about upcoming campus initiatives, and pick up exclusive PNW giveaways.",
    date: "Mar 9, 2026",
    time: "12:00 PM",
    location: "Classroom Office Building (CLO) 153, Hammond Campus",
    category: "green",
    imageUrl:
      "https://www.pnw.edu/student-life/wp-content/uploads/sites/89/2026/03/26_RoarRallies_MyPNWLifeGraphic-03-1.jpg",
    coordinates: [-87.4735, 41.5839],
    capacity: 250,
    registered: 201,
    tags: ["social"],
    parking: [
      {
        id: "p3",
        name: "CLO Surface Lot",
        distance: "0.1 miles away",
        spotsLeft: 41,
        price: "Free",
      },
    ],
  },
  {
    id: "3",
    title: "The Struggle Bus Stops Here (Hammond)",
    description:
      "Connect with PNW resources for academic and personal support, get help on the spot, and grab a snack.",
    date: "Mar 10, 2026",
    time: "11:00 AM",
    location: "Mane Zone (Classroom Office Building, First Floor), Hammond Campus",
    category: "blue",
    imageUrl:
      "https://www.pnw.edu/student-life/wp-content/uploads/sites/89/2026/03/26_RoarRallies_MyPNWLifeGraphic-03-1.jpg",
    coordinates: [-87.473, 41.5836],
    capacity: 180,
    registered: 132,
    tags: ["social", "workshops"],
    parking: [
      {
        id: "p4",
        name: "Mane Zone Lot",
        distance: "0.1 miles away",
        spotsLeft: 52,
        price: "Free",
      },
    ],
  },
  {
    id: "4",
    title: "Search for Leo: Treasure Hunt",
    description:
      "Leos are hidden around campus and students can hunt for prizes including electronics and other giveaways as part of PNW's 10th anniversary events.",
    date: "Mar 23, 2026",
    time: "All Day",
    location: "Across Hammond Campus",
    category: "blue",
    imageUrl:
      "https://www.pnw.edu/student-life/wp-content/uploads/sites/89/2026/03/26_RoarRallies_MyPNWLifeGraphic-03-1.jpg",
    coordinates: [-87.4724, 41.5829],
    capacity: 600,
    registered: 425,
    tags: ["social"],
    parking: [
      {
        id: "p5",
        name: "Main Visitor Lot",
        distance: "0.2 miles away",
        spotsLeft: 133,
        price: "Free",
      },
    ],
  },
  {
    id: "5",
    title: "Holi Celebration 2026",
    description:
      "Celebrate the festival of colors, unity and joy with music, dance and community at PNW's annual Holi event.",
    date: "Mar 27, 2026",
    time: "12:00 PM",
    location: "SULB Field (near the PNW Bell Tower), Hammond Campus",
    category: "orange",
    imageUrl:
      "https://www.pnw.edu/student-life/wp-content/uploads/sites/89/2026/03/26_RoarRallies_MyPNWLifeGraphic-03-1.jpg",
    coordinates: [-87.4741, 41.5842],
    capacity: 450,
    registered: 316,
    tags: ["social"],
    parking: [
      {
        id: "p6",
        name: "SULB Lot",
        distance: "0.1 miles away",
        spotsLeft: 30,
        price: "Free",
      },
    ],
  },
  {
    id: "6",
    title: "Spring 2026 Commencement",
    description:
      "Spring commencement ceremonies are held outdoors on the Hammond campus for students completing graduation requirements in eligible terms.",
    date: "May 9, 2026",
    time: "All Day",
    location: "Hammond Campus",
    category: "blue",
    imageUrl:
      "https://www.pnw.edu/student-life/wp-content/uploads/sites/89/2024/07/2024-PNW-Spring-Career-Expo-039.jpg",
    coordinates: [-87.4726, 41.583],
    capacity: 2500,
    registered: 1730,
    tags: ["academic", "social"],
    parking: [
      {
        id: "p7",
        name: "Commencement Overflow Lot",
        distance: "0.3 miles away",
        spotsLeft: 220,
        price: "Free",
      },
    ],
  },
];

export const SELECTABLE_EVENTS = CAMPUS_EVENTS.map((e) => ({
  value: e.id,
  label: e.title,
}));
