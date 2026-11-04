/**
 * Preview data for /start?state=… (development only). The person and companies are invented (FIGMA_BUILD.md):
 * no real names, no photo, so the card shows the silver initials disc.
 */
import type { Profile } from "@/lib/linkedin";

export const mockPerson = { name: "Aryan Mehta", company: "Halcyon Labs", title: "Member of Technical Staff" };

export const mockProfile: Profile = {
  fullname: "Aryan Mehta",
  headline: "Member of Technical Staff at Halcyon Labs",
  photo: "",
  location: "San Francisco Bay Area",
  url: "https://www.linkedin.com/in/aryan-mehta-example",
  slug: "aryan-mehta-example",
  currentCompany: "Halcyon Labs",
  companyLogo: "",
  experience: [
    { title: "Member of Technical Staff", company: "Halcyon Labs", duration: "2023 – now", location: "San Francisco", current: true, logo: "" },
    { title: "Senior Software Engineer", company: "Kestrel Systems", duration: "2020 – 2023", location: "Seattle", current: false, logo: "" },
    { title: "Software Engineer", company: "Ardent Robotics", duration: "2018 – 2020", location: "Pittsburgh", current: false, logo: "" },
  ],
  score: 1,
};

export const mockEmail = "aryan@hey.com";
