import { Router, type IRouter } from "express";
import {
  CompareProductResponse,
  GetDashboardResponse,
  GetPriceHistoryResponse,
  GetProductResponse,
  ListProductsQueryParams,
  ListProductsResponse,
  RefreshPricesResponse,
} from "@workspace/api-zod";
import { findProduct, products } from "../lib/demo-data";

const router: IRouter = Router();
const money = (value: number) => Math.round(value);

router.get("/products", (req, res) => {
  const query = ListProductsQueryParams.parse(req.query);
  const term = query.q?.trim().toLowerCase();
  const result = products.filter((product) => {
    const matchesQuery = !term || [product.name, product.brand, product.model, product.category].join(" ").toLowerCase().includes(term);
    return matchesQuery && (!query.category || product.category === query.category);
  });
  res.json(ListProductsResponse.parse(result));
});

router.get("/products/:id", (req, res) => {
  const product = findProduct(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  return res.json(GetProductResponse.parse(product));
});

router.get("/compare/:id", (req, res) => {
  const product = findProduct(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const marketPrices = Object.entries(product.prices);
  const average = marketPrices.reduce((sum, [, price]) => sum + price, 0) / marketPrices.length;
  const difference = product.gemPrice - average;
  const rows = [
    { marketplace: "GeM", product: product.name, price: product.gemPrice, difference: 0, confidence: 100, status: "Reference" },
    ...marketPrices.map(([marketplace, price]) => ({
      marketplace, product: `${product.brand} ${product.model} equivalent`, price,
      difference: money(price - product.gemPrice), confidence: product.confidence,
      status: price < product.gemPrice ? "Lower price" : "Higher price",
    })),
  ];
  const payload = {
    product, rows, marketAverage: money(average),
    lowestMarketPrice: Math.min(...marketPrices.map(([, price]) => price)),
    highestMarketPrice: Math.max(...marketPrices.map(([, price]) => price)),
    difference: money(difference),
    percentageDifference: Number(((difference / average) * 100).toFixed(2)),
    potentialSavings: money(Math.max(0, difference)),
    recommendation: difference > average * 0.03 ? "GeM price is above the current market average." : difference < -average * 0.03 ? "GeM price is below the current market average." : "GeM price is competitive with the market.",
  };
  return res.json(CompareProductResponse.parse(payload));
});

router.get("/history/:id", (req, res) => {
  const product = findProduct(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const latest = product.history[product.history.length - 1];
  const previous = product.history[product.history.length - 2];
  const marketAverage = (latest.amazon + latest.flipkart + latest.indiamart) / 3;
  const payload = {
    product, points: product.history, currentGemPrice: product.gemPrice,
    marketAverage: money(marketAverage),
    change30d: Number((((product.gemPrice - previous.gem) / previous.gem) * 100).toFixed(2)),
    change90d: Number((((product.gemPrice - product.history[0].gem) / product.history[0].gem) * 100).toFixed(2)),
  };
  return res.json(GetPriceHistoryResponse.parse(payload));
});

router.get("/dashboard", (_req, res) => {
  const comparisons = products.map((product) => {
    const average = Object.values(product.prices).reduce((sum, price) => sum + price, 0) / 3;
    return { product, difference: product.gemPrice - average };
  });
  const payload = {
    productsAnalyzed: 1248, aboveMarket: 183, belowMarket: 412,
    potentialSavings: 48200000,
    reviewItems: comparisons.sort((a, b) => b.difference - a.difference).slice(0, 5).map(({ product, difference }) => ({ name: product.name, difference: Number(((difference / (product.gemPrice - difference)) * 100).toFixed(1)) })),
    categoryBreakdown: [...new Set(products.map((product) => product.category))].map((category) => ({ category, count: products.filter((product) => product.category === category).length })),
  };
  return res.json(GetDashboardResponse.parse(payload));
});

router.post("/refresh", (_req, res) => {
  return res.json(RefreshPricesResponse.parse({ message: "Cached marketplace prices refreshed successfully.", lastUpdated: new Date().toISOString() }));
});

export default router;