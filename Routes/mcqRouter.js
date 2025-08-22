let express=require("express")
let router=express.Router()
const multer = require("multer");
const XLSX = require("xlsx");
const MCQ = require("../model/mcqSchema");

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    await MCQ.insertMany(data);
    res.json({ success: true, count: data.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/questions", async (req, res) => {
  const mcqs = await MCQ.find();
  res.json(mcqs);
});

// routes/mcqRoutes.js (add this endpoint)
router.post("/submit", async (req, res) => {
  const { answers } = req.body;
  const mcqs = await MCQ.find();
  let score = 0;

  mcqs.forEach((q) => {
    if (answers[q._id] === q.CorrectAnswer) score++;
  });

  res.json({ score });
});


module.exports=router