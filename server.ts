import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Route to proxy Gemini calls securely
  app.post('/api/gemini', async (req, res) => {
    try {
      const { contents, systemInstruction, config, model } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in the workspace.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const selectedModel = model || 'gemini-3.5-flash';

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction,
          temperature: config?.temperature ?? 0.7,
          topP: config?.topP ?? 0.95,
          maxOutputTokens: config?.maxOutputTokens,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini API proxy error:', error);
      res.status(500).json({ error: error.message || 'An error occurred during Gemini AI processing.' });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(url, `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Gemini AI Creative Studio</title>
  </head>
  <body class="bg-slate-50 text-slate-900 transition-colors duration-200">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
