const fs = require("fs");
const paths = ["/", "/stock/:symbol", "/career/:username", "/rankings"];

const domain = "https://val-stocks.vercel.app";

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${paths
    .map((path) => {
      const url = domain + path.replace(/:\w+/g, "example");
      return `
    <url>
      <loc>${url}</loc>
    </url>`;
    })
    .join("\n")}
</urlset>`;

fs.writeFileSync("public/sitemap.xml", sitemap);
console.log("Sitemap generated successfully!");
