import express from "express";

const app = express();
app.use(express.json());

// مهم: اسم المتغير في Render لازم يكون نفسه
const API_KEY = process.env.MINDWEAVE_KEY;

// API توليد البرومبت
app.post("/api/generate", async (req, res) => {
  const { input } = req.body;

  if (!input) {
    return res.json({ result: "اكتب طلب أولاً" });
  }

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
              parts: [
                {
                  text: `حوّل هذا الطلب إلى برومبت احترافي منظم:\n${input}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const result =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "ما تم توليد نتيجة";

    res.json({ result });

  } catch (error) {
    console.error(error);
    res.json({ result: "خطأ في السيرفر" });
  }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
