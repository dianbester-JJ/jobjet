// South African cities and towns with coordinates
export interface Town {
  name: string;
  province: string;
  lat: number;
  lng: number;
}

export const southAfricanTowns: Town[] = [
  // Gauteng
  { name: "Johannesburg", province: "Gauteng", lat: -26.2041, lng: 28.0473 },
  { name: "Pretoria", province: "Gauteng", lat: -25.7479, lng: 28.2293 },
  { name: "Soweto", province: "Gauteng", lat: -26.2485, lng: 27.8540 },
  { name: "Sandton", province: "Gauteng", lat: -26.1076, lng: 28.0567 },
  { name: "Midrand", province: "Gauteng", lat: -25.9891, lng: 28.1271 },
  { name: "Centurion", province: "Gauteng", lat: -25.8603, lng: 28.1894 },
  { name: "Roodepoort", province: "Gauteng", lat: -26.1625, lng: 27.8725 },
  { name: "Benoni", province: "Gauteng", lat: -26.1888, lng: 28.3208 },
  { name: "Boksburg", province: "Gauteng", lat: -26.2125, lng: 28.2625 },
  { name: "Germiston", province: "Gauteng", lat: -26.2233, lng: 28.1672 },
  { name: "Randburg", province: "Gauteng", lat: -26.0936, lng: 28.0067 },
  { name: "Springs", province: "Gauteng", lat: -26.2525, lng: 28.4428 },
  { name: "Alberton", province: "Gauteng", lat: -26.2667, lng: 28.1167 },
  { name: "Krugersdorp", province: "Gauteng", lat: -26.0847, lng: 27.7694 },
  { name: "Vereeniging", province: "Gauteng", lat: -26.6736, lng: 27.9261 },
  { name: "Vanderbijlpark", province: "Gauteng", lat: -26.7111, lng: 27.8378 },
  
  // Western Cape
  { name: "Cape Town", province: "Western Cape", lat: -33.9249, lng: 18.4241 },
  { name: "Stellenbosch", province: "Western Cape", lat: -33.9346, lng: 18.8667 },
  { name: "Paarl", province: "Western Cape", lat: -33.7342, lng: 18.9625 },
  { name: "George", province: "Western Cape", lat: -33.9631, lng: 22.4617 },
  { name: "Knysna", province: "Western Cape", lat: -34.0356, lng: 23.0486 },
  { name: "Mossel Bay", province: "Western Cape", lat: -34.1833, lng: 22.1333 },
  { name: "Worcester", province: "Western Cape", lat: -33.6464, lng: 19.4478 },
  { name: "Somerset West", province: "Western Cape", lat: -34.0833, lng: 18.8500 },
  { name: "Strand", province: "Western Cape", lat: -34.1167, lng: 18.8333 },
  { name: "Bellville", province: "Western Cape", lat: -33.9000, lng: 18.6333 },
  { name: "Milnerton", province: "Western Cape", lat: -33.8667, lng: 18.5000 },
  { name: "Hermanus", province: "Western Cape", lat: -34.4125, lng: 19.2514 },
  { name: "Plettenberg Bay", province: "Western Cape", lat: -34.0525, lng: 23.3714 },
  { name: "Oudtshoorn", province: "Western Cape", lat: -33.5890, lng: 22.2006 },
  
  // KwaZulu-Natal
  { name: "Durban", province: "KwaZulu-Natal", lat: -29.8587, lng: 31.0218 },
  { name: "Pietermaritzburg", province: "KwaZulu-Natal", lat: -29.6006, lng: 30.3794 },
  { name: "Newcastle", province: "KwaZulu-Natal", lat: -27.7584, lng: 29.9318 },
  { name: "Richards Bay", province: "KwaZulu-Natal", lat: -28.7807, lng: 32.0377 },
  { name: "Ladysmith", province: "KwaZulu-Natal", lat: -28.5500, lng: 29.7833 },
  { name: "Pinetown", province: "KwaZulu-Natal", lat: -29.8167, lng: 30.8500 },
  { name: "Umhlanga", province: "KwaZulu-Natal", lat: -29.7228, lng: 31.0850 },
  { name: "Ballito", province: "KwaZulu-Natal", lat: -29.5422, lng: 31.2136 },
  { name: "Amanzimtoti", province: "KwaZulu-Natal", lat: -30.0514, lng: 30.8806 },
  { name: "Port Shepstone", province: "KwaZulu-Natal", lat: -30.7417, lng: 30.4542 },
  
  // Eastern Cape
  { name: "Port Elizabeth", province: "Eastern Cape", lat: -33.9608, lng: 25.6022 },
  { name: "East London", province: "Eastern Cape", lat: -33.0292, lng: 27.8546 },
  { name: "Mthatha", province: "Eastern Cape", lat: -31.5889, lng: 28.7844 },
  { name: "Uitenhage", province: "Eastern Cape", lat: -33.7667, lng: 25.4000 },
  { name: "Grahamstown", province: "Eastern Cape", lat: -33.3042, lng: 26.5328 },
  { name: "Queenstown", province: "Eastern Cape", lat: -31.8972, lng: 26.8756 },
  { name: "King William's Town", province: "Eastern Cape", lat: -32.8811, lng: 27.3947 },
  { name: "Jeffreys Bay", province: "Eastern Cape", lat: -34.0506, lng: 24.9333 },
  
  // Free State
  { name: "Bloemfontein", province: "Free State", lat: -29.0852, lng: 26.1596 },
  { name: "Welkom", province: "Free State", lat: -27.9775, lng: 26.7358 },
  { name: "Kroonstad", province: "Free State", lat: -27.6500, lng: 27.2333 },
  { name: "Bethlehem", province: "Free State", lat: -28.2292, lng: 28.3069 },
  { name: "Sasolburg", province: "Free State", lat: -26.8167, lng: 27.8333 },
  { name: "Parys", province: "Free State", lat: -26.8986, lng: 27.4583 },
  
  // Mpumalanga
  { name: "Nelspruit", province: "Mpumalanga", lat: -25.4753, lng: 30.9694 },
  { name: "Witbank", province: "Mpumalanga", lat: -25.8653, lng: 29.2336 },
  { name: "Middelburg", province: "Mpumalanga", lat: -25.7744, lng: 29.4644 },
  { name: "Secunda", province: "Mpumalanga", lat: -26.5167, lng: 29.1667 },
  { name: "White River", province: "Mpumalanga", lat: -25.3311, lng: 31.0083 },
  { name: "Barberton", province: "Mpumalanga", lat: -25.7833, lng: 31.0500 },
  { name: "Ermelo", province: "Mpumalanga", lat: -26.5333, lng: 29.9833 },
  
  // Limpopo
  { name: "Polokwane", province: "Limpopo", lat: -23.9042, lng: 29.4686 },
  { name: "Tzaneen", province: "Limpopo", lat: -23.8331, lng: 30.1628 },
  { name: "Musina", province: "Limpopo", lat: -22.3389, lng: 30.0411 },
  { name: "Mokopane", province: "Limpopo", lat: -24.1944, lng: 29.0111 },
  { name: "Louis Trichardt", province: "Limpopo", lat: -23.0500, lng: 29.9000 },
  { name: "Thohoyandou", province: "Limpopo", lat: -22.9500, lng: 30.4833 },
  { name: "Phalaborwa", province: "Limpopo", lat: -23.9431, lng: 31.1411 },
  
  // North West
  { name: "Rustenburg", province: "North West", lat: -25.6667, lng: 27.2500 },
  { name: "Potchefstroom", province: "North West", lat: -26.7145, lng: 27.0970 },
  { name: "Klerksdorp", province: "North West", lat: -26.8667, lng: 26.6667 },
  { name: "Mahikeng", province: "North West", lat: -25.8653, lng: 25.6436 },
  { name: "Brits", province: "North West", lat: -25.6333, lng: 27.7833 },
  { name: "Sun City", province: "North West", lat: -25.3375, lng: 27.0992 },
  
  // Northern Cape
  { name: "Kimberley", province: "Northern Cape", lat: -28.7386, lng: 24.7631 },
  { name: "Upington", province: "Northern Cape", lat: -28.4572, lng: 21.2556 },
  { name: "Springbok", province: "Northern Cape", lat: -29.6639, lng: 17.8831 },
  { name: "De Aar", province: "Northern Cape", lat: -30.6500, lng: 24.0167 },
  { name: "Kuruman", province: "Northern Cape", lat: -27.4500, lng: 23.4333 },
];

export const provinces = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Mpumalanga",
  "Limpopo",
  "North West",
  "Northern Cape",
];
