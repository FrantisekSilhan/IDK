import express from "express";
import compression from "compression";
import path from "path";
import helmet from "helmet";

const app = express();
const PORT = process.env.PORT;

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:"],
    },
  },
}));

const poweredBy = [
  "Caffeine",
  "TypeScript",
  "Sleep Deprivation",
  "Quantum Tunneling",
  "Dark Matter",
  "Unicorn Dust",
  "Pixel Magic",
  "Code Goblins",
  "Electric Eels",
  "Cosmic Rays",
];

app.use((req, res, next) => {
  const random = poweredBy[Math.floor(Math.random() * poweredBy.length)];
  res.setHeader("X-Powered-By", random);
  next();
});

app.use(compression());

app.get("/", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.sendFile("./index.inline.html", { root: path.join(__dirname, "..", "public") });
});

app.get("/favicon.ico", (req, res) => {
  res.sendFile("./favicon.ico", { root: path.join(__dirname, "..", "public") });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});