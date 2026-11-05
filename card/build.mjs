// Збирає картку в один файл, який інтеграція віддає фронтенду: custom_components/notchalert/frontend/.
// Версія — з manifest.json, щоб у консолі браузера було видно, яка картка завантажилась.
import { build } from "esbuild";
import { readFileSync } from "node:fs";

const { version } = JSON.parse(readFileSync(new URL("../custom_components/notchalert/manifest.json", import.meta.url)));
await build({
  entryPoints: ["src/notchalert-card.js"],
  bundle: true,
  format: "esm",
  minify: true,
  target: "es2021",
  legalComments: "none",
  define: { __CARD_VERSION__: JSON.stringify(version) },
  outfile: "../custom_components/notchalert/frontend/notchalert-card.js",
});
console.log(`notchalert-card ${version}`);
