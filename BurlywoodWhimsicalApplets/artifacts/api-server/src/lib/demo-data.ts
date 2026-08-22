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
  prices: Record<string, number>;
  confidence: number;
  history: HistoryPoint[];
};

const seeds = [
  ["HP LaserJet Pro M404dn", "HP", "M404dn", "Printers", 18500, 16999, 17499, 17200, 94],
  ["HP LaserJet Pro M428fdw", "HP", "M428fdw", "Printers", 32900, 30990, 31750, 31200, 92],
  ["HP LaserJet Enterprise M507dn", "HP", "M507dn", "Printers", 48900, 46200, 47199, 46800, 91],
  ["Dell 24-inch Professional Monitor", "Dell", "P2422H", "Monitors", 14200, 12990, 13499, 13100, 93],
  ["Dell 27-inch USB-C Monitor", "Dell", "P2723QE", "Monitors", 32900, 30750, 31899, 31200, 90],
  ["Lenovo ThinkPad E14 Gen 5", "Lenovo", "E14-G5", "Laptops", 68400, 65200, 66999, 65800, 95],
  ["HP ProBook 440 G10", "HP", "440-G10", "Laptops", 71900, 68990, 70250, 69500, 93],
  ["Dell Latitude 5440", "Dell", "L5440", "Laptops", 76400, 73100, 74999, 73900, 94],
  ["Logitech MK850 Wireless Keyboard Mouse", "Logitech", "MK850", "Keyboards", 6200, 5599, 5899, 5750, 89],
  ["Dell KB216 Wired Keyboard", "Dell", "KB216", "Keyboards", 850, 699, 749, 720, 97],
  ["Logitech M331 Silent Wireless Mouse", "Logitech", "M331", "Mice", 1650, 1299, 1399, 1350, 96],
  ["HP 150 Wireless Mouse", "HP", "150", "Mice", 980, 799, 849, 810, 92],
  ["Godrej Motion High Back Office Chair", "Godrej", "Motion", "Office Chairs", 12800, 11499, 11999, 11600, 88],
  ["Featherlite Astro Office Chair", "Featherlite", "Astro", "Office Chairs", 16400, 14990, 15750, 15200, 90],
  ["Daikin 1.5 Ton Split AC", "Daikin", "FTKF50", "Office Equipment", 41900, 39999, 40750, 40200, 87],
  ["Epson EB-E01 Projector", "Epson", "EB-E01", "Projectors", 36500, 33990, 35200, 34500, 92],
  ["BenQ MW560 Projector", "BenQ", "MW560", "Projectors", 49800, 46999, 48499, 47500, 90],
  ["TP-Link 24-Port Gigabit Switch", "TP-Link", "TL-SG1024", "Networking Equipment", 8200, 7499, 7899, 7650, 94],
  ["Cisco 24-Port Managed Switch", "Cisco", "CBS250", "Networking Equipment", 26800, 24990, 25899, 25200, 89],
  ["WD 1TB External Hard Drive", "Western Digital", "WDBYVG", "Storage Devices", 6200, 5499, 5899, 5650, 95],
  ["Samsung 980 1TB NVMe SSD", "Samsung", "MZ-V8V1T0", "Storage Devices", 7800, 6999, 7499, 7150, 93],
  ["Canon EOS 200D II Camera", "Canon", "200D-II", "Cameras", 61500, 57990, 59999, 58800, 91],
  ["Logitech C920 HD Webcam", "Logitech", "C920", "Cameras", 7200, 6499, 6999, 6650, 96],
  ["APC 1100VA UPS", "APC", "BX1100C", "Office Equipment", 8900, 7999, 8499, 8150, 94],
  ["Eureka Forbes Water Purifier", "Eureka Forbes", "Aquaguard", "Office Equipment", 15400, 13990, 14999, 14300, 86],
] as const;

const history = (gem: number, amazon: number, flipkart: number, indiamart: number): HistoryPoint[] => [
  { label: "May", gem: Math.round(gem * 0.96), amazon: Math.round(amazon * 0.98), flipkart: Math.round(flipkart * 0.97), indiamart: Math.round(indiamart * 0.98) },
  { label: "June", gem: Math.round(gem * 0.98), amazon: Math.round(amazon * 0.99), flipkart: Math.round(flipkart * 0.98), indiamart: Math.round(indiamart * 0.99) },
  { label: "July", gem: Math.round(gem * 0.99), amazon, flipkart, indiamart },
  { label: "August", gem, amazon: Math.round(amazon * 1.01), flipkart: Math.round(flipkart * 1.01), indiamart: Math.round(indiamart * 1.01) },
];

export const products: Product[] = seeds.map(([name, brand, model, category, gemPrice, amazon, flipkart, indiamart, confidence], index) => ({
  id: `gem-${String(index + 1).padStart(3, "0")}`,
  name, brand, model, category, gemPrice,
  prices: { "Amazon Business": amazon, Flipkart: flipkart, IndiaMART: indiamart },
  confidence,
  history: history(gemPrice, amazon, flipkart, indiamart),
}));

export const findProduct = (id: string) => products.find((product) => product.id === id);