import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const API_KEY = process.env.MINDWEAVE_KEY;

app.post("/api/generate", async (req, res) => {
  const { input } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `حوّل هذا إلى برومبت احترافي:\n${input}` }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    res.json({
      result: data.candidates?.[0]?.content?.parts?.[0]?.text || "ما فيه نتيجة"
    });

  } catch (err) {
    res.json({ result: "خطأ في السيرفر" });
  }
});

app.listen(process.env.PORT || 10000);
