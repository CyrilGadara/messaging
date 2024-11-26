const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const morgan = require("morgan");
const { v4: uuid4 } = require("uuid");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const logger = require("./utils/logger");
// const routes = require("./routes/pages");
// const authRoutes = require("./routes/userRoutes.old");
// const campaignRoutes = require("./routes/campaignRoutes..oldjs");
const routes = require("./routes");
const app = express();

// EJS configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Generate unique request IDs
app.use((req, res, next) => {
    req.id = uuid4();
    next();
});

//logging
morgan.token("id", (req) => req.id);
app.use(
    morgan(":id :method :url :status :response-time ms - :res[content-length]", {
        stream: {
            write: (message) => logger.http(message.trim()),
        },
    })
);

// Security
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "wss:", "ws:"],
            },
        },
    })
);
app.use(cors());
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use(limiter);

// Parsing and compression
app.use(express.json({ limit: "10kb" })); // Body limit is 10kb
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(compression());

// Trues proxy (if behind a reverse proxy)
app.set("trust proxy", 1);

// Routes
app.use("/", routes);

// Health check endpoint
app.get("/health", async (req, res) => {
    try {
        res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ status: "ERROR", message: error.message });
    }
});

// Error handler
app.use(errorHandler);
app.use(notFound);

// Unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled promise rejection:", reason);
});

module.exports = app;
