// models/mcqModel.js
const mongoose = require("mongoose");

const mcqSchema = new mongoose.Schema({
  Question: String,
  OptionA: String,
  OptionB: String,
  OptionC: String,
  OptionD: String,
  CorrectAnswer: String,
});

module.exports = mongoose.model("MCQ", mcqSchema);
