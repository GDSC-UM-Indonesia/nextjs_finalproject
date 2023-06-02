import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    private_key: process.env.PRIVATE_KEY,
  },
  scopes: [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets",
  ],
});

const sheets = google.sheets({
  auth,
  version: "v4",
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Get the data from the request body
      const data = req.body;
      var report_details = [];
      var questions = data.data;

      for (var i = 0; i < questions.length; i++) {
        var question = questions[i];
        var report = [
          question.timestamp,
          data.attempt,
          data.quiz.uuid,
          data.quiz.title,
          question.uuid,
          question.question,
          question.userAnswer,
          question.correctAnswer,
          question.correct == true ? "Correct" : "Incorrect",
        ];
        report_details.push(report);
      }

      var report_attempt = [
        data.attempt,
        data.quiz.uuid,
        data.quiz.title,
        data.score.correct,
        data.score.incorrect,
        data.totalQuestions,
        data.startTime,
        data.endTime,
        data.duration,
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: "Analysis!A2:I",
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: report_details,
        },
      });

      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: "Attempts!A3:I",
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [report_attempt],
        },
      });
      // Send a success response
      res.status(200).json({ message: "Data stored successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error storing data:" + error.message });
    }
  }
}
