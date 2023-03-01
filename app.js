//import dependencies
const express = require("express");
const bodyParser = require("body-parser");
const Http_error = require("./models/http_error");
const mongoose = require("mongoose");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const placesRoutes = require("./routes/places_routes");
const userRoutes = require("./routes/users_routes");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Accept",
      "Authorization",
      "Origin",
      "X-Requested-with",
    ],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use("/upload/images", express.static(path.join("upload", "images")));

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-with, Content-Type, Accept, Authorization"
//   );
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
//   next();
// });

//routes
app.use("/api/places", placesRoutes);
app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  const error = new Http_error("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }

  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

mongoose.set("strictQuery", true);
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pq4ntla.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => console.log(err));
