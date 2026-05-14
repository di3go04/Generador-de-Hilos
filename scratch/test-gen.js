async function testGeneration() {
  console.log("🚀 Iniciando prueba de generación para Tenant: 'demo'...");
  
  try {
    const response = await fetch('http://127.0.0.1:4000/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': 'demo' // Corregido de 'default_tenant' a 'demo'
      },
      body: JSON.stringify({
        prompt: "A futuristic architectural masterpiece in the desert, sand dunes, warm golden hour lighting, cinematic photography, high detail, 8k",
        style: "realistic",
        aspect_ratio: "16:9"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error ${response.status}: ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log("✅ ¡Generación Exitosa!");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Error de conexión fatal:", error.message);
  }
}

testGeneration();
