import express from "express";
import cors from "cors";
import Replicate from "replicate";

const app = express();
app.use(cors());
app.use(express.json());

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.get("/", (req, res) => {
  res.send("Replicate proxy is running");
});

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      { input: { prompt } }
    );

    res.json({ image: output });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Generation failed" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
// Добавьте это в ваш proxy.js на сервере Render
app.use('/bytedance', createProxyMiddleware({
    target: 'https://cv-api.bytedance.com', // или другой эндпоинт API ByteDance
    changeOrigin: true,
    pathRewrite: { '^/bytedance': '' },
    onProxyReq: (proxyReq, req, res) => {
        if (req.headers.authorization) {
            proxyReq.setHeader('Authorization', req.headers.authorization);
        }
    }
}));
