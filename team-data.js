// Published team information and optional public Google Sheets feeds.
const LOCAL_UPDATES = [
  {
    "published": "TRUE",
    "date": "2026-11-22",
    "title": "Weekly Update #3",
    "category": "Coach update",
    "pinned": "TRUE",
    "body": "Coach Eberth’s Nov. 22 update has the latest practice and meet schedule below. Sign up for the Dec. 1 meet by Friday, November 27.\n\nDiving practice is listed Monday–Friday, 3:30–5:00 PM at Bellevue Aquatic Center, except Tuesday, Dec. 1, when there is no practice because of the meet. The update labels the second practice week “Nov. 31–Dec. 4”; the calendar below uses Nov. 30–Dec. 4 to match the Monday–Friday sequence.",
    "link": "",
    "link_label": ""
  },
  {
    "published": "TRUE",
    "date": "2026-11-07",
    "title": "Meet Coach Eberth",
    "category": "Coach introduction",
    "pinned": "FALSE",
    "body": "Coach Eberth Rivera worked alongside the previous head coach for multiple seasons, supporting Interlake swimmers as they competed at the state championships. This season, he serves as head coach. He brings more than 30 years of coaching and competitive-sports experience, including coaching and competing in Colombia.\n\nOriginally from Bogotá, Coach Eberth enjoys swimming, soccer, camping, and spending time outdoors with his family. His coaching philosophy centers on each swimmer’s individual growth, open communication, mutual respect, confidence, and a supportive team where every swimmer matters."
  }
];

const LOCAL_EVENTS = [
  {
    "published": "TRUE",
    "date": "2026-11-23",
    "time": "17:30",
    "end_time": "19:00",
    "type": "Practice",
    "title": "Swim practice",
    "location": "Edgebook Pool Club",
    "notes": "Monday · 5:30–7:00 PM",
    "link": ""
  },
  {
    "published": "TRUE",
    "date": "2026-11-23",
    "time": "15:30",
    "end_time": "17:00",
    "type": "Practice",
    "title": "Diving practice",
    "location": "Bellevue Aquatic Center",
    "notes": "Monday · 3:30–5:00 PM",
    "link": ""
  },
  {
    "published": "TRUE",
    "date": "2026-11-24",
    "time": "17:30",
    "end_time": "19:00",
    "type": "Practice",
    "title": "Swim practice",
    "location": "Edgebook Pool Club",
    "notes": "Tuesday · 5:30–7:00 PM",
    "link": ""
  },
  {
    "published": "TRUE",
    "date": "2026-11-24",
    "time": "15:30",
    "end_time": "17:00",
    "type": "Practice",
    "title": "Diving practice",
    "location": "Bellevue Aquatic Center",
    "notes": "Tuesday · 3:30–5:00 PM",
    "link": ""
  },
  {
    "published": "TRUE",
    "date": "2026-11-25",
    "time": "17:30",
    "end_time": "19:00",
    "type": "Practice",
    "title": "Swim practice",
    "location": "Edgebook Pool Club",
    "notes": "Wednesday · 5:30–7:00 PM",
    "link": ""
  },
  {
    "published": "TRUE",
    "date": "2026-11-25",
    "time": "15:30",
    "end_time": "17:00",
    "type": "Practice",
    "title": "Diving practice",
    "location": "Bellevue Aquatic Center",
    "notes": "Wednesday · 3:30–5:00 PM",
    "link": ""
  },
  {
    "published": "TRUE",
    "date": "2026-11-30",
    "time": "19:30",
    "end_time": "21:00",
    "type": "Practice",
    "title": "Swim practice",
    "location": "Edgebook Pool Club",
    "notes": "Monday · 7:30–9:00 PM. Date interpreted from the update’s weekday sequence.",
    "link": ""
  },
  {
    "published": "TRUE",
    "date": "2026-11-30",
    "time": "15:30",
    "end_time": "17:00",
    "type": "Practice",
    "title": "Diving practice",
    "location": "Bellevue Aquatic Center",
    "notes": "Monday · 3:30–5:00 PM.",
    "link": ""
  },
  {
    "published": "TRUE",
    "date": "2026-12-01",
    "time": "20:30",
    "end_time": "22:30",
    "type": "Dual meet",
    "title": "Interlake vs. Bellevue",
    "location": "Mary Wayte Pool",
    "signup_deadline": "2026-11-27",
    "notes": "No school bus transportation; swimmers need their own ride.\nNo practice on Tuesday, Dec. 1.\nSwimmers should arrive by 7:30 PM for warm-up. The meet starts at 8:30 PM.\nMeet sign-up deadline: Friday, Nov. 27.",
    "link": "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=OUFKmQZ8HkmAmHkAbVdd4NW0wze9h95Ivctw9NN0cZVURENKNTJBQTZNTEcyUUlMTldWSDJRN1hPSi4u"
  },
  {
    "published": "TRUE",
    "date": "2026-12-02",
    "time": "19:30",
    "end_time": "21:00",
    "type": "Practice",
    "title": "Swim practice",
    "location": "Edgebook Pool Club",
    "notes": "Wednesday · 7:30–9:00 PM",
    "link": ""
  },
  {
    "published": "TRUE",
    "date": "2026-12-02",
    "time": "15:30",
    "end_time": "17:00",
    "type": "Practice",
    "title": "Diving practice",
    "location": "Bellevue Aquatic Center",
    "notes": "Wednesday · 3:30–5:00 PM.",
    "link": ""
  },
  {
    "published": "TRUE",
    "date": "2026-12-03",
    "time": "17:30",
    "end_time": "19:00",
    "type": "Practice",
    "title": "Swim practice",
    "location": "Edgebook Pool Club",
    "notes": "Thursday · 5:30–7:00 PM",
    "link": ""
  },
  {
    "published": "TRUE",
    "date": "2026-12-03",
    "time": "15:30",
    "end_time": "17:00",
    "type": "Practice",
    "title": "Diving practice",
    "location": "Bellevue Aquatic Center",
    "notes": "Thursday · 3:30–5:00 PM.",
    "link": ""
  },
  {
    "published": "TRUE",
    "date": "2026-12-04",
    "time": "19:30",
    "end_time": "21:00",
    "type": "Practice",
    "title": "Swim practice",
    "location": "Edgebook Pool Club",
    "notes": "Friday · 7:30–9:00 PM",
    "link": ""
  },
  {
    "published": "TRUE",
    "date": "2026-12-04",
    "time": "15:30",
    "end_time": "17:00",
    "type": "Practice",
    "title": "Diving practice",
    "location": "Bellevue Aquatic Center",
    "notes": "Friday · 3:30–5:00 PM.",
    "link": ""
  },
  {
    "published": "TRUE",
    "date": "2026-12-10",
    "time": "15:00",
    "end_time": "",
    "type": "Dual meet",
    "title": "Interlake vs. Renton",
    "location": "Hazen Pool",
    "notes": "Thursday · 3:00 PM.",
    "link": ""
  },
  {
    "published": "TRUE",
    "date": "2026-12-16",
    "time": "15:00",
    "end_time": "",
    "type": "Dual meet",
    "title": "Interlake vs. Inglemoor",
    "location": "Juan Pool",
    "notes": "Wednesday · 3:00 PM.",
    "link": ""
  },
  {
    "published": "TRUE",
    "date": "2027-01-07",
    "time": "16:00",
    "end_time": "",
    "type": "Dual meet",
    "title": "Interlake vs. Liberty",
    "location": "Boehm Pool",
    "notes": "Thursday · 4:00 PM.",
    "link": ""
  },
  {
    "published": "TRUE",
    "date": "2027-01-14",
    "time": "15:30",
    "end_time": "",
    "type": "Dual meet",
    "title": "Interlake vs. Lindbergh",
    "location": "Lind Pool",
    "notes": "Thursday · 3:30 PM.",
    "link": ""
  },
  {
    "published": "TRUE",
    "date": "2027-01-21",
    "time": "15:00",
    "end_time": "",
    "type": "Dual meet",
    "title": "Interlake vs. Hazen",
    "location": "Hazen Pool",
    "notes": "Thursday · 3:00 PM.",
    "link": ""
  },
  {
    "published": "TRUE",
    "date": "2027-01-28",
    "time": "20:30",
    "end_time": "",
    "type": "Home meet",
    "title": "Senior Night · Interlake vs. THE",
    "location": "Mary Wayte Pool",
    "notes": "Home meet & Senior Night · Join us for a small party celebrating our seniors and their contributions to the team. Opponent is listed as “THE” in Coach Eberth’s update.",
    "link": "",
    "senior_night": "TRUE"
  },
  {
    "published": "TRUE",
    "date": "2027-02-19",
    "time": "09:00",
    "end_time": "",
    "type": "WA State",
    "title": "State prelims · 3A boys swim & dive",
    "location": "King County Aquatic Center",
    "notes": "Friday · 3A session. Facility opens 7:30 AM; warm-up begins 8:00 AM. 650 SW Campus Dr, Federal Way, WA 98023. Confirm team arrival with Coach Eberth.",
    "link": "https://www.wiaa.com/tournament-bsw/?sportid=5"
  },
  {
    "published": "TRUE",
    "date": "2027-02-20",
    "time": "08:30",
    "end_time": "",
    "type": "WA State",
    "title": "State finals · 3A boys swim & dive",
    "location": "King County Aquatic Center",
    "notes": "Saturday · 3A session. Facility opens 7:00 AM; warm-up begins 7:30 AM. 650 SW Campus Dr, Federal Way, WA 98023. Confirm team arrival with Coach Eberth.",
    "link": "https://www.wiaa.com/tournament-bsw/?sportid=5"
  }
];

const POOL_DIRECTORY = {
  "King County Aquatic Center": {
    "name": "King County Aquatic Center",
    "address": "650 SW Campus Dr, Federal Way, WA 98023"
  },
  "Mary Wayte Pool": {
    "name": "Mary Wayte Pool",
    "address": "8815 SE 40th St, Mercer Island, WA 98040"
  },
  "Hazen Pool": {
    "name": "Hazen Pool",
    "address": "1101 Hoquiam Ave NE, Renton, WA 98059"
  },
  "Juan Pool": {
    "name": "Juanita Aquatics Center",
    "address": "10601 NE 132nd St, Kirkland, WA 98034"
  },
  "Boehm Pool": {
    "name": "Julius Boehm Pool",
    "address": "50 SE Clark St, Issaquah, WA 98027"
  },
  "Lind Pool": {
    "name": "Lindbergh Pool",
    "address": "16740 128th Ave SE, Renton, WA 98058"
  }
};

const TEAM_CONFIG = {
  "updatesCsvUrl": "",
  "scheduleCsvUrl": "",
  "coachSheetUrl": ""
};

const SCHOOL_BREAKS = [
  {
    "start": "2026-11-11",
    "end": "2026-11-11",
    "title": "Veterans Day"
  },
  {
    "start": "2026-11-26",
    "end": "2026-11-27",
    "title": "Thanksgiving break"
  },
  {
    "start": "2026-12-21",
    "end": "2027-01-01",
    "title": "Winter break"
  },
  {
    "start": "2027-01-18",
    "end": "2027-01-18",
    "title": "Martin Luther King Jr. Day"
  },
  {
    "start": "2027-01-29",
    "end": "2027-01-29",
    "title": "Staff workday"
  },
  {
    "start": "2027-02-15",
    "end": "2027-02-19",
    "title": "Midwinter break"
  }
];
