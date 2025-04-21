import { Request, Response } from 'express';
import SoapClientService from '../services/soapClient.service';
import { Constantes } from '../utils/constantes';
import { CustomResponse } from '../models/response.model';

const createResponse = (): CustomResponse => ({
  success: true,
  message: "",
  cod_error: 0,
  data: null
});

/**
 * Create a new client
 * @param req Express request
 * @param res Express response
 */
export const crearCliente = async (req: Request, res: Response): Promise<void> => {   
  const rsp = createResponse(); 
    try {      
      // Verificar si el body está vacío
      if (!req.body || Object.keys(req.body).length === 0) {
        console.info('ALERTA: req.query está vacío o undefined');
        rsp.success = false;
        rsp.message = 'El query de la petición está vacío';
        rsp.cod_error = Constantes.STATUS_CODES.BAD_REQUEST;
      
        res.status(Constantes.STATUS_CODES.BAD_REQUEST).json(rsp);
        return;
      }
      
      const { nombres, documento, email, telefono } = req.body;
      
      // Validate input
      if (!nombres || !documento || !email || !telefono) {
        console.info('Validación fallida: documento y telefono requeridos faltantes');

        rsp.success = false;
        rsp.message = Constantes.ERROR_CUSTOM_MESSAGES.REQUERIDOS;
        rsp.cod_error = Constantes.STATUS_CODES.BAD_REQUEST;
        res.status(Constantes.STATUS_CODES.BAD_REQUEST).json(rsp);
        return;
      }
      
      try {
        // Llamar al servicio SOAP
        const soapResponse = await SoapClientService.callSoapMethod('ingresarClienteSoap', {
          nombres: nombres as string,
          documento: documento as string,
          email: email as string,
          telefono: telefono as string
        });
        
        console.log('SOAP Response from ingresarClienteSoap:', soapResponse);
        
        if (soapResponse.success === true) {
          rsp.success = true;
          rsp.message = soapResponse.message || 'Billetera recargada correctamente';
          rsp.cod_error = 0;
          rsp.data = soapResponse.data || soapResponse;
          
          res.status(Constantes.STATUS_CODES.OK).json(rsp);
        } else {
          rsp.success = false;
          rsp.message = soapResponse.message || 'Error al recargar la billetera';
          rsp.cod_error = soapResponse.cod_error || Constantes.STATUS_CODES.BAD_REQUEST;
          rsp.data = soapResponse.data || null;
          
          res.status(Constantes.STATUS_CODES.BAD_REQUEST).json(rsp);
        }
      } catch (soapError: any) {
        console.error('Error al llamar al servicio SOAP:', soapError);
        
        rsp.success = false;
        rsp.cod_error = Constantes.STATUS_CODES.INTERNAL_SERVER_ERROR;
        rsp.message = `Error al comunicarse con el servicio SOAP: ${soapError.message}`;
        
        res.status(Constantes.STATUS_CODES.INTERNAL_SERVER_ERROR).json(rsp);
      }
    } catch (error: any) {
      console.error('Error en el controlador createCliente:', error);
      
      rsp.success = false;
      rsp.message = Constantes.MESSAGES.INTERNAL_SERVER_ERROR;
      rsp.cod_error = Constantes.STATUS_CODES.INTERNAL_SERVER_ERROR;
    
      res.status(Constantes.STATUS_CODES.INTERNAL_SERVER_ERROR).json(rsp);
    }
  }
  
// Exportar todas las funciones del controlador
export default {
  crearCliente
};
