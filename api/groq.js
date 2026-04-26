export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const nvidiaKey = process.env.NVIDIA_API_KEY;

  // قائمة جميع نماذج NVIDIA المتاحة للتجربة
  const nvidiaModels = [
    { name: 'kimi/kimi-k2-0905-instruct', label: 'Kimi K2' },
    { name: 'moonshotai/kimi-k2-0905-instruct', label: 'Kimi K2.5' },
    { name: 'minimaxai/minimax-m2.5', label: 'MiniMax M2.5' },
    { name: 'z-ai/glm-5', label: 'GLM-5' },
    { name: 'meta/llama-4-maverick-17b-128e-instruct', label: 'Llama 4 Maverick' },
    { name: 'nvidia/nemotron-3-super-120b-a12b', label: 'Nemotron Super' },
  ];

  // --- المحاولة الأولى: تجربة جميع نماذج NVIDIA ---
  if (nvidiaKey) {
    for (const model of nvidiaModels) {
      try {
        console.log(`Trying NVIDIA ${model.label}...`);
        const nvidiaRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${nvidiaKey}`
          },
          body: JSON.stringify({
            model: model.name,
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
            console.log(`NVIDIA ${model.label} SUCCESS ✅`);
            return res.status(200).json({ reply });
          }
        }
        console.log(`NVIDIA ${model.label} failed or empty response`);
      } catch (e) {
        console.log(`NVIDIA ${model.label} error: ${e.message}`);
      }
    }
    console.log('All NVIDIA models failed, trying Groq...');
  }

  // --- المحاولة الثانية: Groq (احتياطي) ---
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      console.log('Trying Groq...');
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'أنت خبير Prompt Engineering بالعربية. أنشئ أوامر احترافية.' },
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
          console.log('Groq SUCCESS ✅');
          return res.status(200).json({ reply });
        }
      }
      console.log('Groq failed');
    } catch (e) {
      console.log('Groq error:', e.message);
    }
  }

  // فشل كل شيء
  console.error('All providers failed ❌');
  return res.status(500).json({ error: 'All providers failed' });
}
