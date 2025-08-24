require("dotenv").config()
let db = require("./model/connect")
let express = require("express")
let cookieParser = require("cookie-parser")
let morgan = require("morgan")
let cors = require("cors")
const crypto = require("crypto") // you missed this import
const { errorHandler } = require("./middleware/errorHandler")
let PORT = process.env.PORT || 3000
let app = express()
let userRouter = require("./Routes/userRouter")
let mcqRouter = require("./Routes/mcqRouter")
const Razorpay = require("razorpay")
let jwt = require("jsonwebtoken")
let User = require("./model/userSchema")


// middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan("tiny"))

const allowedOrigins = [
  "http://localhost:8080",
  "https://online-test-frontend-9isb.vercel.app",
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

// Routes
app.use("/user", userRouter)
app.use("/mcq", mcqRouter)

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// ---------------- Razorpay Integration ----------------
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// (A) Get public key for client
app.get('/api/payments/key', (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// (B) Create an order
app.post('/api/payments/order', async (req, res) => {
  try {
    const { amountInRupees, receiptId, notes } = req.body;
    const options = {
      amount: Math.round(Number(amountInRupees) * 100), // paise
      currency: 'INR',
      receipt: receiptId || `rcpt_${Date.now()}`,
      notes: notes || {},
    };
    const order = await razorpay.orders.create(options);
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
});

// (C) Verify payment
app.post('/api/payments/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');
    const isAuthentic = expectedSignature === razorpay_signature;
    if (!isAuthentic) return res.status(400).json({ verified: false });

    let token = req.cookies.token
    if (!token) return res.status(401).json({ message: "Unauthorised token" })
    let decoded = jwt.verify(token, process.env.KEY)
    let user = await User.findById(decoded.id)
    if (!user) return res.status(401).json({ message: "Unauthorised" })
    req.user = user
    req.user.payment=true
    await req.user.save()


    console.log(req.user)
    res.json({ verified: true });

  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
});

// ---------------- 404 Handler ----------------
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Error middleware
app.use(errorHandler)

app.listen(PORT, () => {
  console.log("Server running on PORT", PORT)
})
