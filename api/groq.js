export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // المحاولة الأولى: NVIDIA NIM (مجاني)
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  if (nvidiaKey) {
    try {
      const nvidiaRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nvidiaKey}`
        },
        body: JSON.stringify({
          model: 'kimi/kimi-k2-0905-instruct',
          messages: [
            { role: 'system', content: 'أنت خبير في هندسة الأوامر (Prompt Engineering) باللغة العربية. أنشئ أوامر احترافية ومفصلة.' },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (nvidiaRes.ok) {
        const data = await nvidiaRes.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply && reply.length > 20) {
          return res.status(200).json({ reply });
        }
      }
    } catch (e) {
      console.log('NVIDIA failed, trying Groq...');
    }
  }

  // المحاولة الثانية: Groq (احتياطي)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'أنت خبير في هندسة الأوامر (Prompt Engineering) باللغة العربية. أنشئ أوامر احترافية ومفصلة.' },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (groqRes.ok) {
        const data = await groqRes.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          return res.status(200).json({ reply });
        }
      }
    } catch (e) {
      console.log('Groq failed too');
    }
  }

  // إذا فشل كل شيء، أرجع خطأ
  return res.status(500).json({ error: 'All providers failed' });
}
