export const siteConfig = {
  name: "DuctDuctClean",
  description:
    "Professional Air Duct Cleaning in Idaho Falls, ID | DuctDuctClean",
  url: "https://ductductclean.com",
  established: 2023,
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  },
  location: {
    city: "Idaho Falls",
    state: "Idaho",
    stateAbbr: "ID",
    zip: "83401",
    serviceAreas: [
      "Idaho Falls",
      "Ammon",
      "Rexburg",
      "Pocatello",
      "Blackfoot",
      "Shelley",
      "Rigby",
      "Driggs",
      "St. Anthony",
    ],
  },
  contact: {
    phone: "(208) 701-5502",
    phoneTel: "+12087015502",
    email: "info@ductductclean.com",
    address: "Idaho Falls, ID 83401",
  },
  hours: {
    display: "Mon–Sat: 7:00 AM – 7:00 PM",
    structured: "Mo-Sa 07:00-19:00",
  },
  social: {
    facebook: "",
    instagram: "",
    google: "",
  },
};
