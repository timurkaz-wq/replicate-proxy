import express from "express";
import cors from "cors";
import Replicate from "replicate";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
app.use(cors());
app.use(express.json());

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

//
// 🔹 Проверка сервера
//
app.get("/", (req, res) => {
  res.send("Replicate proxy is running");
});

//
// 🔹 Генерация через Replicate
//
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

//
// 🔹 Прокси к ByteDance API
//
app.use(
  "/bytedance",
  createProxyMiddleware({
    target: "https://cv-api.bytedance.com",
    changeOrigin: true,
    pathRewrite: { "^/bytedance": "" },
    onProxyReq: (proxyReq, req) => {
      if (req.headers.authorization) {
        proxyReq.setHeader("Authorization", req.headers.authorization);
      }
    },
  })
);

//
// 🔹 Запуск сервера
//
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
