import axios from "axios";

export class BillingService {
  private static apiKey = process.env.METEROID_API_KEY;
  
  static async recordGeneration(tenantId: string, model: string) {
    console.log(`[BILLING] Registrando evento para tenant: ${tenantId}, modelo: ${model}`);
    
    // Simulación de llamada a Meteroid / Lago
    // await axios.post('https://api.meteroid.io/v1/events', {
    //   tenant_id: tenantId,
    //   event_type: 'ai_image_generation',
    //   metadata: { model }
    // }, { headers: { Authorization: `Bearer ${this.apiKey}` } });
    
    return true;
  }
}
