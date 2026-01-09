import paintingImg from "@/assets/services/painting.jpg";
import plumbingImg from "@/assets/services/plumbing.jpg";
import cleaningImg from "@/assets/services/cleaning.jpg";
import carpentryImg from "@/assets/services/carpentry.jpg";
import electricalImg from "@/assets/services/electrical.jpg";
import landscapingImg from "@/assets/services/landscaping.jpg";

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  image: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  categoryId: string;
  coverPhoto: string;
  rating: number;
  reviewCount: number;
  location: string;
  yearsExperience: number;
  description: string;
  hourlyRate: number;
  verified: boolean;
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: "painting",
    name: "Painting",
    icon: "🎨",
    description: "Interior & exterior painting services",
    image: paintingImg,
  },
  {
    id: "plumbing",
    name: "Plumbing",
    icon: "🔧",
    description: "Plumbing repairs and installations",
    image: plumbingImg,
  },
  {
    id: "cleaning",
    name: "Cleaning",
    icon: "✨",
    description: "Professional home and office cleaning",
    image: cleaningImg,
  },
  {
    id: "carpentry",
    name: "Carpentry",
    icon: "🪚",
    description: "Custom woodwork and furniture",
    image: carpentryImg,
  },
  {
    id: "electrical",
    name: "Electrical",
    icon: "⚡",
    description: "Electrical repairs and installations",
    image: electricalImg,
  },
  {
    id: "landscaping",
    name: "Landscaping",
    icon: "🌿",
    description: "Garden design and maintenance",
    image: landscapingImg,
  },
];

export const serviceProviders: ServiceProvider[] = [
  {
    id: "1",
    name: "John's Pro Painting",
    categoryId: "painting",
    coverPhoto: paintingImg,
    rating: 4.9,
    reviewCount: 127,
    location: "Downtown",
    yearsExperience: 12,
    description: "Professional painting services with attention to detail. Specializing in residential and commercial projects.",
    hourlyRate: 45,
    verified: true,
  },
  {
    id: "2",
    name: "Elite Plumbing Solutions",
    categoryId: "plumbing",
    coverPhoto: plumbingImg,
    rating: 4.8,
    reviewCount: 89,
    location: "Westside",
    yearsExperience: 8,
    description: "24/7 emergency plumbing services. Licensed and insured professionals.",
    hourlyRate: 65,
    verified: true,
  },
  {
    id: "3",
    name: "Sparkle Clean Co",
    categoryId: "cleaning",
    coverPhoto: cleaningImg,
    rating: 4.7,
    reviewCount: 203,
    location: "Midtown",
    yearsExperience: 5,
    description: "Eco-friendly cleaning services for homes and businesses. Satisfaction guaranteed.",
    hourlyRate: 35,
    verified: true,
  },
  {
    id: "4",
    name: "Master Woodworks",
    categoryId: "carpentry",
    coverPhoto: carpentryImg,
    rating: 5.0,
    reviewCount: 64,
    location: "Northside",
    yearsExperience: 20,
    description: "Custom furniture and cabinetry. Heirloom quality craftsmanship.",
    hourlyRate: 75,
    verified: true,
  },
  {
    id: "5",
    name: "Bright Spark Electric",
    categoryId: "electrical",
    coverPhoto: electricalImg,
    rating: 4.6,
    reviewCount: 156,
    location: "Eastside",
    yearsExperience: 15,
    description: "Residential and commercial electrical services. Safety first approach.",
    hourlyRate: 70,
    verified: true,
  },
  {
    id: "6",
    name: "Green Thumb Gardens",
    categoryId: "landscaping",
    coverPhoto: landscapingImg,
    rating: 4.8,
    reviewCount: 98,
    location: "Suburbs",
    yearsExperience: 10,
    description: "Complete landscaping solutions from design to maintenance.",
    hourlyRate: 55,
    verified: true,
  },
  {
    id: "7",
    name: "Color Perfect Painters",
    categoryId: "painting",
    coverPhoto: paintingImg,
    rating: 4.5,
    reviewCount: 78,
    location: "Southside",
    yearsExperience: 6,
    description: "Affordable painting with premium results. Free color consultation.",
    hourlyRate: 40,
    verified: false,
  },
  {
    id: "8",
    name: "Quick Fix Plumbers",
    categoryId: "plumbing",
    coverPhoto: plumbingImg,
    rating: 4.4,
    reviewCount: 112,
    location: "Central",
    yearsExperience: 7,
    description: "Fast, reliable plumbing repairs at competitive prices.",
    hourlyRate: 55,
    verified: true,
  },
];
