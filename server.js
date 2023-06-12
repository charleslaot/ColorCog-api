// INIT
if (process.env.NODE_ENV === "development") {
	require("dotenv").config();
}

const cors = require("cors");
const morgan = require("morgan");
const multer = require("multer");
const express = require("express");
const { Sequelize } = require("sequelize");
const cookieParser = require("cookie-parser");

const colors = require("./controllers/color");
const login = require("./controllers/login");
const profile = require("./controllers/profile");
const register = require("./controllers/register");

const app = express();
const db = require("./db");
const upload = multer({ dest: "uploads/" });

const User = require("./models/user");
const Color = require("./models/color");

// MIDDLEWARE
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// ROUTES
app.post("/login", login.handleLogin());
app.get("/profile", profile.handleProfile());
app.post("/register", register.handleRegister());

app.post(`/api/${process.env.API_VERSION}/color/upsert`, colors.upsertColor());
app.post(`/api/${process.env.API_VERSION}/color/url`, colors.getUrlColorsFromAI());
app.post(`/api/${process.env.API_VERSION}/color/file`, upload.single("image"), colors.getFileColorsFromAI());

//JSON object to be added to cookie
let users = {
	name: "Ritik",
	Age: "18",
};

//Route for adding cookie
app.get("/setuser", (req, res) => {
	res.cookie("userData2", users);
	res.send("user data added to cookie");
});

//Iterate users data from cookie
app.get("/getuser", (req, res) => {
	//shows all the cookies
	res.send(req.cookies);
});

app.use((req, res, next) => {
	res.status(404).json({ message: "404 Not found." });
});

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: "500 Internal server error." });
});

// SERVER
(async () => {
	try {
		await db.authenticate();
		console.log("\n=== DB Connection has been established successfully ===");

		await User.sync();
		await Color.sync();

		app.listen(process.env.APP_PORT, () => {
			console.log("=== Server running on port " + process.env.APP_PORT + " ===");
		});
	} catch (error) {
		console.error("\nUnable to connect to the database:", error);
	}
})();
