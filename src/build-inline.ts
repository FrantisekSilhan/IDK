import { readFileSync, writeFileSync } from "fs";
import { minify as minifyHTML } from "html-minifier-terser";
import CleanCSS from "clean-css";
import { minify } from "terser";

async function build() {
  const html = readFileSync("src/views/index.html", "utf8");
  const cssMain = readFileSync("src/styles/main.css", "utf8");
  const cssReset = readFileSync("src/styles/reset.css", "utf8");
  const js = readFileSync("src/scripts/client.js", "utf8");
  const appTs = readFileSync("src/app.ts", "utf8");

  const minifiedCSS = new CleanCSS({ level: 2 }).minify(
    cssReset + "\n" + cssMain
  ).styles;

  const minifiedJS = (await minify(js, { compress: true, mangle: true })).code;

  const codeBackground = `<pre id="bg-code">${
    appTs
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
    }</pre>`;

  let inlined = html
    .replace(/<link[^>]+href="[^"]+\.css"[^>]*>/g, "")
    .replace(/<script[^>]+src="[^"]+\.js"[^>]*><\/script>/g, "")
    .replace("<body>", `<body>\n${codeBackground}\n`)
    .replace("</head>", `<style>${minifiedCSS}</style></head>`)
    .replace("</body>", `<script>${minifiedJS}</script></body>`);

  const minifiedHTML = await minifyHTML(inlined, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: false,
    minifyJS: false,
  });

  writeFileSync("public/index.inline.html", minifiedHTML);
  console.log("✅ All inlined and `public/index.inline.html` created!");
}

build().catch(console.error);