const express = require("express");
const hpp = require("hpp");
const path = require("path");
const { rateLimit } = require("express-rate-limit");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");


const mongoSanitize = require("express-mongo-sanitize");
const dotenv = require("dotenv");
const authRoute = require("./routes/auth");
const propertyRoute = require("./routes/properties");
const categoryRoute = require("./routes/categories");
const userRoute = require("./routes/users");
const messageRoute = require("./routes/messages");
const { default: helmet } = require("helmet");
const { xss } = require("express-xss-sanitizer");
const errorHandler = require("./middleware/error");
dotenv.config();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  // store: ... , // Redis, Memcached, etc. See below.
});

const app = express();
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(hpp()); 
app.use(limiter);
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing form data

app.use("/api/v1/", authRoute);
app.use("/api/v1/", propertyRoute);
app.use("/api/v1/", categoryRoute);
app.use("/api/v1/", userRoute);
app.use("/api/v1/", messageRoute);

app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("db connected");
  })
  .catch((err) => {
    console.log(err);
      if (err.code === "ENOTFOUND" || err.name === "MongoNetworkError") {
        return res.json(
          "Database not reachable. Please check your internet connection."
        );
        // throw new Error(
        //   "Database not reachable. Please check your internet connection."
        // );
      }
  });

const port = process.env.PORT || 2323;

app.listen(port, () => console.log(`server runing on ${port}`));
