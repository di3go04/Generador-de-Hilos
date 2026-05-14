import axios from "axios";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../lib/errors.js";

export class StabilityService {
  static async generate(params: {
    prompt: string;
    aspect_ratio: string;
    style?: string;
  }) {
    const apiKey = process.env.STABILITY_API_KEY;
    const apiUrl = "https://api.stability.ai/v2beta/stable-image/generate/sd3";

    if (!apiKey) throw new AppError(500, "STABILITY_API_KEY no configurada");

    try {
      console.log(`[SD3] Generando: ${params.prompt} (${params.aspect_ratio})`);
      
      const formData = new FormData();
      formData.append("prompt", params.prompt);
      formData.append("aspect_ratio", params.aspect_ratio);
      formData.append("model", "sd3");
      formData.append("output_format", "jpeg");

      const response = await axios.post(this.apiUrl, formData, {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Accept": "image/*"
        },
        responseType: "arraybuffer"
      });

      // 1. Guardar imagen localmente (Simulando S3 en dev)
      const fileName = `gen_${uuidv4()}.jpg`;
      const publicPath = path.join(process.cwd(), "public", "generations");
      
      if (!fs.existsSync(publicPath)) fs.mkdirSync(publicPath, { recursive: true });
      
      const filePath = path.join(publicPath, fileName);
      fs.writeFileSync(filePath, Buffer.from(response.data));

      return `/generations/${fileName}`;
    } catch (error: any) {
      console.error("[STABILITY ERROR]", error.response?.status, error.message);
      throw new AppError(500, "Error crítico en el motor SD3");
    }
  }
}
