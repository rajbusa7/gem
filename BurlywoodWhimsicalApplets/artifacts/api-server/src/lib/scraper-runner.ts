import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { logger } from "./logger.js";

export interface ScrapedProductResult {
  url: string;
  status_code: number;
  title?: string | null;
  price?: number | null;
  original_price_text?: string | null;
  currency?: string;
  availability?: string | null;
  rating?: number | null;
  description?: string | null;
  image_url?: string | null;
  marketplace?: string | null;
  error?: string | null;
}

export async function runFastScraper(url: string): Promise<ScrapedProductResult> {
  return new Promise((resolve) => {
    // Detect the project root where utils/fast_scraper.py is located
    const candidateDirs = [
      path.resolve(process.cwd(), "../.."),
      path.resolve(process.cwd(), ".."),
      process.cwd(),
      "c:/Users/Raj/Desktop/gem",
    ];

    let rootDir = process.cwd();
    for (const dir of candidateDirs) {
      if (fs.existsSync(path.join(dir, "utils", "fast_scraper.py"))) {
        rootDir = dir;
        break;
      }
    }

    const scriptPath = path.join(rootDir, "utils", "fast_scraper.py");
    logger.info({ url, scriptPath }, "Invoking Python FastScraper TLS-impersonation engine");

    const proc = spawn("python", [scriptPath, url, "--json"], {
      cwd: rootDir,
      shell: true,
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        logger.warn({ code, stderr }, "FastScraper finished with non-zero exit code");
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (err) {
        logger.error({ err, stdout, stderr }, "Failed to parse FastScraper JSON output");
        resolve({
          url,
          status_code: code === 0 ? 200 : 500,
          error: stderr || stdout || "Failed to execute Python fast scraper",
        });
      }
    });

    proc.on("error", (err) => {
      logger.error({ err }, "Failed to spawn Python process");
      resolve({
        url,
        status_code: 500,
        error: err.message,
      });
    });
  });
}
