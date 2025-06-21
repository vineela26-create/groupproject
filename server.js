const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Initialize Firebase Admin
const serviceAccount = require("./firebase-adminsdk.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Routes
app.get("/", (req, res) => res.redirect("/login"));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "public", "signup.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "public", "register.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));

// Signup
app.post("/signupUser", async (req, res) => {
  const { firstName, lastName, phone, email, password } = req.body;
  if (!firstName || !lastName || !phone || !email || !password) {
    return res.send("All fields are required.");
  }

  const userRef = db.collection("users").doc(email);
  const user = await userRef.get();
  if (user.exists) {
    return res.send("User already exists.");
  }

  await userRef.set({ firstName, lastName, phone, email, password });
  res.redirect("/login");
});

// Login
app.post("/loginUser", async (req, res) => {
  const { email, password } = req.body;
  const userRef = db.collection("users").doc(email);
  const user = await userRef.get();
  if (!user.exists || user.data().password !== password) {
    return res.send("Invalid credentials.");
  }

  res.redirect("/dashboard");
});

// Register Movie Ticket
app.post("/registerTicket", async (req, res) => {
  const { name, email, phone, showTime, date, paymentMethod } = req.body;
  if (!name || !email || !phone || !showTime || !date || !paymentMethod) {
    return res.send("All fields are required.");
  }

  await db.collection("registrations").add({ name, email, phone, showTime, date, paymentMethod });
  res.redirect("/dashboard");
});

// Start server
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
