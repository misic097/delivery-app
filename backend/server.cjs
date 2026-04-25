const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, "routes.db");

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(dbPath);

const STATUSES = new Set([
  "pending",
  "delivered",
  "not_delivered",
  "redirected",
]);

const drivers = {
  marko: {
    password: "1234",
    name: "Marko",
    sections: ["Split 2", "Split 3", "Žnjan"],
  },
  ivan: {
    password: "1234",
    name: "Ivan",
    sections: ["Centar", "Bačvice", "Firule"],
  },
  ana: {
    password: "1234",
    name: "Ana",
    sections: ["Meje", "Spinut", "Poljud"],
  },
};

function generatePackages(count = 130) {
  const sections = ["Centar", "Split 2", "Split 3", "Žnjan"];

  const addresses = [
    "6 Marmontova",
    "6 Marmontova",
    "6 Marmontova",

    "34 Put Meja",
    "34 Put Meja",

    "99 Matice hrvatske",
    "99 Matice hrvatske",

    "22 Poljička cesta",
    "22 Poljička cesta",
    "22 Poljička cesta",

    "15 Vukovarska ulica",
    "15 Vukovarska ulica",

    "7 Ulica slobode",
    "51 Spinutska ulica",
    "62 Zrinsko-Frankopanska",
    "34 Trg Gaje Bulata",
    "11 Riva",
    "18 Domovinskog rata",
    "27 Put Firula",
    "44 Ruđera Boškovića",
  ];

  const packages = [];

  for (let i = 1; i <= count; i++) {
    const address = addresses[i % addresses.length];

    packages.push({
      barcode: `PKG-${10000 + i}`,
      recipient_name: `Korisnik ${i}`,
      address,
      city: "Split",
      section: sections[i % sections.length],
      status: "pending",
    });
  }

  return packages;
}

const seedPackages = generatePackages(150);

function initializeDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS packages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barcode TEXT NOT NULL UNIQUE,
        recipient_name TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        section TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('pending', 'delivered', 'not_delivered', 'redirected')) DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.get("SELECT COUNT(*) AS count FROM packages", (error, row) => {
      if (error) {
        console.error("Failed to inspect packages table:", error.message);
        return;
      }

      if (row.count === 0) {
        const insert = db.prepare(`
          INSERT INTO packages (barcode, recipient_name, address, city, section, status)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        seedPackages.forEach((pkg) => {
          insert.run(
            pkg.barcode,
            pkg.recipient_name,
            pkg.address,
            pkg.city,
            pkg.section,
            pkg.status,
          );
        });

        insert.finalize();
      }
    });
  });
}

function packageFromBody(body) {
  return {
    barcode: String(body.barcode || "").trim(),
    recipient_name: String(body.recipient_name || "").trim(),
    address: String(body.address || "").trim(),
    city: String(body.city || "").trim(),
    section: String(body.section || "").trim(),
    status: String(body.status || "pending").trim(),
  };
}

app.post("/api/login", (req, res) => {
  const username = String(req.body.username || "")
    .trim()
    .toLowerCase();
  const password = String(req.body.password || "").trim();

  const driver = drivers[username];

  if (!driver || driver.password !== password) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  res.json({
    username,
    name: driver.name,
    sections: driver.sections,
  });
});

app.get("/api/packages", (req, res) => {
  const driverName = String(req.query.driver || "")
    .trim()
    .toLowerCase();
  const driver = drivers[driverName];

  if (driverName && !driver) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }

  let sql =
    "SELECT id, barcode, recipient_name, address, city, section, status FROM packages";
  let params = [];

  if (driver) {
    const placeholders = driver.sections.map(() => "?").join(",");
    sql += ` WHERE section IN (${placeholders})`;
    params = driver.sections;
  }

  sql += " ORDER BY section ASC, address ASC, id DESC";

  db.all(sql, params, (error, rows) => {
    if (error) {
      res.status(500).json({ error: "Failed to load packages" });
      return;
    }

    res.json(rows);
  });
});

app.post("/api/packages", (req, res) => {
  const pkg = packageFromBody(req.body);

  if (
    !pkg.barcode ||
    !pkg.recipient_name ||
    !pkg.address ||
    !pkg.city ||
    !pkg.section
  ) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }

  if (!STATUSES.has(pkg.status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  db.run(
    `INSERT INTO packages (barcode, recipient_name, address, city, section, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      pkg.barcode,
      pkg.recipient_name,
      pkg.address,
      pkg.city,
      pkg.section,
      pkg.status,
    ],
    function (error) {
      if (error) {
        res.status(500).json({ error: "Insert failed" });
        return;
      }

      res.json({ id: this.lastID, ...pkg });
    },
  );
});

app.put("/api/packages/:id/status", (req, res) => {
  const { id } = req.params;
  const status = String(req.body.status || "").trim();

  if (!STATUSES.has(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  db.run(
    "UPDATE packages SET status = ? WHERE id = ?",
    [status, id],
    function (error) {
      if (error) {
        res.status(500).json({ error: "Update failed" });
        return;
      }

      if (this.changes === 0) {
        res.status(404).json({ error: "Package not found" });
        return;
      }

      db.get(
        "SELECT id, barcode, recipient_name, address, city, section, status FROM packages WHERE id = ?",
        [id],
        (selectError, row) => {
          if (selectError) {
            res
              .status(500)
              .json({
                error: "Status updated, but package could not be loaded",
              });
            return;
          }

          res.json(row);
        },
      );
    },
  );
});

app.delete("/api/packages/:id", (req, res) => {
  db.run(
    "DELETE FROM packages WHERE id = ?",
    [req.params.id],
    function (error) {
      if (error) {
        res.status(500).json({ error: "Delete failed" });
        return;
      }

      if (this.changes === 0) {
        res.status(404).json({ error: "Package not found" });
        return;
      }

      res.json({ success: true, id: Number(req.params.id) });
    },
  );
});

initializeDatabase();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
