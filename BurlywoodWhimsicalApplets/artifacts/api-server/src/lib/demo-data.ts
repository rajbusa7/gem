export type HistoryPoint = {
  label: string;
  gem: number;
  amazon: number;
  flipkart: number;
  indiamart: number;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  gemPrice: number;
  imageUrl?: string;
  prices: Record<string, number>;
  confidence: number;
  history: HistoryPoint[];
};

const categoryImageMap: Record<string, string> = {
  "Printers": "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80",
  "Monitors": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
  "Laptops": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
  "Keyboards": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
  "Mice": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80",
  "Office Chairs": "https://images.unsplash.com/photo-1580481077197-9878280678fa?auto=format&fit=crop&w=600&q=80",
  "Office Equipment": "https://images.unsplash.com/photo-1614633833026-6a56c0e86a0a?auto=format&fit=crop&w=600&q=80",
  "Projectors": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80",
  "Networking Equipment": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
  "Storage Devices": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80",
  "Cameras": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
};

const seeds = [
  ["HP LaserJet Pro M404dn", "HP", "M404dn", "Printers", 18500, 16999, 17499, 17200, 94, "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80"],
  ["HP LaserJet Pro M428fdw", "HP", "M428fdw", "Printers", 32900, 30990, 31750, 31200, 92, "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80"],
  ["HP LaserJet Enterprise M507dn", "HP", "M507dn", "Printers", 48900, 46200, 47199, 46800, 91, "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80"],
  ["Dell 24-inch Professional Monitor", "Dell", "P2422H", "Monitors", 14200, 12990, 13499, 13100, 93, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80"],
  ["Dell 27-inch USB-C Monitor", "Dell", "P2723QE", "Monitors", 32900, 30750, 31899, 31200, 90, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80"],
  ["Lenovo ThinkPad E14 Gen 5", "Lenovo", "E14-G5", "Laptops", 68400, 65200, 66999, 65800, 95, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80"],
  ["HP ProBook 440 G10", "HP", "440-G10", "Laptops", 71900, 68990, 70250, 69500, 93, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80"],
  ["Dell Latitude 5440", "Dell", "L5440", "Laptops", 76400, 73100, 74999, 73900, 94, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80"],
  ["Logitech MK850 Wireless Keyboard Mouse", "Logitech", "MK850", "Keyboards", 6200, 5599, 5899, 5750, 89, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80"],
  ["Dell KB216 Wired Keyboard", "Dell", "KB216", "Keyboards", 850, 699, 749, 720, 97, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80"],
  ["Logitech M331 Silent Wireless Mouse", "Logitech", "M331", "Mice", 1650, 1299, 1399, 1350, 96, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80"],
  ["HP 150 Wireless Mouse", "HP", "150", "Mice", 980, 799, 849, 810, 92, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80"],
  ["Godrej Motion High Back Office Chair", "Godrej", "Motion", "Office Chairs", 12800, 11499, 11999, 11600, 88, "https://images.unsplash.com/photo-1580481077197-9878280678fa?auto=format&fit=crop&w=600&q=80"],
  ["Featherlite Astro Office Chair", "Featherlite", "Astro", "Office Chairs", 16400, 14990, 15750, 15200, 90, "https://images.unsplash.com/photo-1580481077197-9878280678fa?auto=format&fit=crop&w=600&q=80"],
  ["Daikin 1.5 Ton Split AC", "Daikin", "FTKF50", "Office Equipment", 41900, 39999, 40750, 40200, 87, "https://images.unsplash.com/photo-1614633833026-6a56c0e86a0a?auto=format&fit=crop&w=600&q=80"],
  ["Epson EB-E01 Projector", "Epson", "EB-E01", "Projectors", 36500, 33990, 35200, 34500, 92, "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80"],
  ["BenQ MW560 Projector", "BenQ", "MW560", "Projectors", 49800, 46999, 48499, 47500, 90, "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80"],
  ["TP-Link 24-Port Gigabit Switch", "TP-Link", "TL-SG1024", "Networking Equipment", 8200, 7499, 7899, 7650, 94, "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80"],
  ["Cisco 24-Port Managed Switch", "Cisco", "CBS250", "Networking Equipment", 26800, 24990, 25899, 25200, 89, "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80"],
  ["WD 1TB External Hard Drive", "Western Digital", "WDBYVG", "Storage Devices", 6200, 5499, 5899, 5650, 95, "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80"],
  ["Samsung 980 1TB NVMe SSD", "Samsung", "MZ-V8V1T0", "Storage Devices", 7800, 6999, 7499, 7150, 93, "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80"],
  ["Canon EOS 200D II Camera", "Canon", "200D-II", "Cameras", 61500, 57990, 59999, 58800, 91, "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80"],
  ["Logitech C920 HD Webcam", "Logitech", "C920", "Cameras", 7200, 6499, 6999, 6650, 96, "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80"],
  ["APC 1100VA UPS", "APC", "BX1100C", "Office Equipment", 8900, 7999, 8499, 8150, 94, "https://images.unsplash.com/photo-1614633833026-6a56c0e86a0a?auto=format&fit=crop&w=600&q=80"],
  ["Eureka Forbes Water Purifier", "Eureka Forbes", "Aquaguard", "Office Equipment", 15400, 13990, 14999, 14300, 86, "https://images.unsplash.com/photo-1614633833026-6a56c0e86a0a?auto=format&fit=crop&w=600&q=80"],
] as const;

const history = (gem: number, amazon: number, flipkart: number, indiamart: number): HistoryPoint[] => [
  { label: "May", gem: Math.round(gem * 0.96), amazon: Math.round(amazon * 0.98), flipkart: Math.round(flipkart * 0.97), indiamart: Math.round(indiamart * 0.98) },
  { label: "June", gem: Math.round(gem * 0.98), amazon: Math.round(amazon * 0.99), flipkart: Math.round(flipkart * 0.98), indiamart: Math.round(indiamart * 0.99) },
  { label: "July", gem: Math.round(gem * 0.99), amazon, flipkart, indiamart },
  { label: "August", gem, amazon: Math.round(amazon * 1.01), flipkart: Math.round(flipkart * 1.01), indiamart: Math.round(indiamart * 1.01) },
];

export const products: Product[] = seeds.map(([name, brand, model, category, gemPrice, amazon, flipkart, indiamart, confidence, imageUrl], index) => ({
  id: `gem-${String(index + 1).padStart(3, "0")}`,
  name, brand, model, category, gemPrice,
  imageUrl: imageUrl || categoryImageMap[category],
  prices: { "Amazon Business": amazon, Flipkart: flipkart, IndiaMART: indiamart },
  confidence,
  history: history(gemPrice, amazon, flipkart, indiamart),
}));

export const findProduct = (id: string) => products.find((product) => product.id === id);