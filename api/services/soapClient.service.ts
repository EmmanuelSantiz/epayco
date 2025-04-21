import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get SOAP URL from environment variables with fallback
const SOAP_URL = process.env.SOAP_URL || 'http://soap_native:80/soap_service.php';

/**
 * SOAP Client Service
 * Handles communication with the SOAP service
 */
class SoapClientService {
  /**
   * Send a request to the SOAP service
   * @param method The SOAP method to call
   * @param data The data to send
   * @returns The response from the SOAP service
   */
  async callSoapMethod(method: string, data: Record<string, any>): Promise<any> {
    try {
      console.log(`Calling SOAP method ${method} at ${SOAP_URL}`);
      console.log('SOAP data:', data);
      
      // Create XML envelope for SOAP request
      const xmlData = this.createSoapEnvelope(method, data);
      console.log('SOAP request XML:', xmlData);
      
      // Set headers for SOAP request
      const headers = {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': `"${method}"`,
      };
      
      // Send request to SOAP service with timeout
      const response = await axios.post(SOAP_URL, xmlData, { 
        headers,
        timeout: 10000 // 10 seconds timeout
      });
      
      console.log('SOAP Response Status:', response.status);
      console.log('SOAP Response Headers:', response.headers);
      
      // For debugging, log the first 500 characters of the response
      const responsePreview = typeof response.data === 'string' ? 
        response.data.substring(0, 500) + (response.data.length > 500 ? '...' : '') : 
        JSON.stringify(response.data).substring(0, 500);
      console.log('SOAP Response Data (preview):', responsePreview);
      
      // Extract response data using simple string manipulation
      return this.extractResponseData(response.data, method);
    } catch (error: any) {
      console.error('Error al conectar con el servicio SOAP:', error);
      
      // Provide more detailed error information
      if (error.code === 'ENOTFOUND') {
        throw new Error(`No se puede resolver el host: ${SOAP_URL}. Verifique la configuración de red.`);
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error(`Conexión rechazada al intentar conectar a: ${SOAP_URL}. Verifique que el servicio SOAP esté en ejecución.`);
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(`Error del servidor SOAP: ${error.response.status} - ${error.response.data}`);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error(`No se recibió respuesta del servidor SOAP: ${error.message}`);
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(`Error al configurar la petición SOAP: ${error.message}`);
      }
    }
  }
  
  /**
   * Create a SOAP envelope for the request
   * @param method The SOAP method to call
   * @param data The data to include in the request
   * @returns XML string for the SOAP request
   */
  private createSoapEnvelope(method: string, data: Record<string, any>): string {
    // Simple XML creation - in a real app, use a proper XML library
    let dataXml = '';
    
    // Convert data object to XML elements
    Object.entries(data).forEach(([key, value]) => {
      dataXml += `<${key}>${value}</${key}>`;
    });
    
    return `<?xml version="1.0" encoding="UTF-8"?>
      <SOAP-ENV:Envelope 
        xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
        <SOAP-ENV:Body>
          <${method}>
            ${dataXml}
          </${method}>
        </SOAP-ENV:Body>
      </SOAP-ENV:Envelope>`;
  }
  /**
   * Extract response data from SOAP XML response using simple string manipulation
   * @param xmlResponse The XML response from the SOAP service
   * @param method The SOAP method that was called
   * @returns Extracted data as a JavaScript object
   */
  private extractResponseData(xmlResponse: string, method: string): any {
    try {
      // Convert method to response method name (usually ends with 'Response')
      const responseMethod = method + 'Response';
      
      // Check if we have a specific response format for this method
      /*if (xmlResponse.includes('consultarBilleteraResponse')) {
        // Extract success value
        const successMatch = xmlResponse.match(/<key[^>]*>success<\/key><value[^>]*>([^<]+)<\/value>/);
        const success = successMatch ? successMatch[1] === 'true' : false;
        
        // Extract message
        const messageMatch = xmlResponse.match(/<key[^>]*>message<\/key><value[^>]*>([^<]+)<\/value>/);
        const message = messageMatch ? messageMatch[1] : '';
        
        // Extract cod_error
        const codErrorMatch = xmlResponse.match(/<key[^>]*>cod_error<\/key><value[^>]*>([^<]+)<\/value>/);
        const codError = codErrorMatch ? codErrorMatch[1] : '';
        
        // Extract cliente_id
        const clienteIdMatch = xmlResponse.match(/<key[^>]*>cliente_id<\/key><value[^>]*>([^<]+)<\/value>/);
        const clienteId = clienteIdMatch ? parseInt(clienteIdMatch[1]) : null;
        
        // Extract saldo
        const saldoMatch = xmlResponse.match(/<key[^>]*>saldo<\/key><value[^>]*>([^<]+)<\/value>/);
        const saldo = saldoMatch ? parseFloat(saldoMatch[1]) : null;
        
        return {
          success,
          message,
          cod_error: codError,
          data: {
            cliente_id: clienteId,
            saldo
          }
        };
      }*/
      
      // Generic extraction for key-value pairs in SOAP responses
      const result: Record<string, any> = {};
      
      // Extract all key-value pairs using regex
      const keyValuePattern = /<key[^>]*>([^<]+)<\/key><value[^>]*>([^<]+)<\/value>/g;
      let match;
      
      while ((match = keyValuePattern.exec(xmlResponse)) !== null) {
        const key = match[1];
        let value: any = match[2];
        
        // Convert boolean strings to actual booleans
        if (value === 'true') value = true as any;
        if (value === 'false') value = false as any;
        
        // Convert numeric strings to numbers
        if (typeof value === 'string' && !isNaN(Number(value)) && value !== '') {
          value = Number(value);
        }
        
        result[key] = value;
      }
      
      // If we found key-value pairs, return them in a structured format
      if (Object.keys(result).length > 0) {
        return {
          success: result.success !== undefined ? result.success : true,
          message: result.message || `Respuesta de ${method} recibida`,
          data: result
        };
      }
      
      // For other response formats, return a generic object
      return {
        success: true,
        message: `Respuesta de ${method} recibida`,
        data: xmlResponse
      };
    } catch (error) {
      console.error('Error extracting data from SOAP response:', error);
      return {
        success: false,
        message: 'Error al procesar la respuesta SOAP',
        data: xmlResponse
      };
    }
  }
}

export default new SoapClientService();
