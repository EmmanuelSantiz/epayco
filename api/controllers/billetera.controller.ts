import { Request, Response } from 'express';
import SoapClientService from '../services/soapClient.service';
import { CustomResponse } from '../models/response.model';
import { Constantes } from '../utils/constantes';

/**
 * Crea una nueva instancia de respuesta personalizada
 * @returns Nueva instancia de CustomResponse
 */
const createResponse = (): CustomResponse => ({
  success: true,
  message: "",
  cod_error: 0,
  data: null
});

export const crearBilletera = (req: Request, res: Response) => {
  const rsp = createResponse();
  
  rsp.success = false;
  rsp.message = 'Esta operación no es necesaria. La billetera se crea automáticamente al registrar un cliente.';
  rsp.cod_error = Constantes.STATUS_CODES.BAD_REQUEST;
  
  res.status(Constantes.STATUS_CODES.BAD_REQUEST).json(rsp);
};

export const recargarBilletera = async (req: Request, res: Response) => {
  const rsp = createResponse();
  
  try {
    // Verificar si el body está vacío
    if (!req.body || Object.keys(req.body).length === 0) {
      console.info('ALERTA: req.body está vacío o undefined');
      rsp.success = false;
      rsp.message = 'El cuerpo de la petición está vacío';
      rsp.cod_error = Constantes.STATUS_CODES.BAD_REQUEST;
    
      res.status(Constantes.STATUS_CODES.BAD_REQUEST).json(rsp);
      return;
    }

    // Validar campos requeridos
    const { documento, total, telefono } = req.body;
  
    if (!documento || !total || !telefono) {
      console.info('Validación fallida: campos requeridos faltantes');

      rsp.success = false;
      rsp.message = Constantes.ERROR_CUSTOM_MESSAGES.REQUERIDOS;
      rsp.cod_error = Constantes.STATUS_CODES.BAD_REQUEST;
      res.status(Constantes.STATUS_CODES.BAD_REQUEST).json(rsp);
      return;
    }

    // Validar que el monto sea un número positivo
    const montoNum = Number(total);
    if (isNaN(montoNum) || montoNum <= 0) {
      rsp.success = false;
      rsp.message = 'El monto debe ser un número positivo';
      rsp.cod_error = Constantes.STATUS_CODES.BAD_REQUEST;
      res.status(Constantes.STATUS_CODES.BAD_REQUEST).json(rsp);
      return;
    }

    try {
      // Llamar al servicio SOAP
      const soapResponse = await SoapClientService.callSoapMethod('recargarBilletera', {
        documento: documento as string,
        telefono: telefono as string,
        monto: montoNum.toString()
      });

      console.log('SOAP Response processed:', soapResponse);
      
      // La respuesta ya viene parseada por el servicio mejorado
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
    } catch (error: any) {
      console.error('Error en el controlador recargarBilletera:', error);
    
      rsp.success = false;
      rsp.message = Constantes.MESSAGES.INTERNAL_SERVER_ERROR + error.message;
      rsp.cod_error = Constantes.STATUS_CODES.INTERNAL_SERVER_ERROR;
      
      res.status(Constantes.STATUS_CODES.INTERNAL_SERVER_ERROR).json(rsp);
    }
  } catch (error: any) {
    console.error('Error en el controlador recargarBilletera:', error);
    
    rsp.success = false;
    rsp.message = Constantes.MESSAGES.INTERNAL_SERVER_ERROR;
    rsp.cod_error = Constantes.STATUS_CODES.INTERNAL_SERVER_ERROR;
    
    res.status(Constantes.STATUS_CODES.INTERNAL_SERVER_ERROR).json(rsp);
  }
};
export const consultarBilletera = async (req: Request, res: Response) => {
  const rsp = createResponse();
  
  try {
    // Verificar si el query está vacío
    if (!req.query || Object.keys(req.query).length === 0) {
      console.info('ALERTA: req.query está vacío o undefined');
      rsp.success = false;
      rsp.message = 'El query de la petición está vacío';
      rsp.cod_error = Constantes.STATUS_CODES.BAD_REQUEST;
    
      res.status(Constantes.STATUS_CODES.BAD_REQUEST).json(rsp);
      return;
    }

    // Validar campos requeridos
    const { documento, telefono } = req.query;
  
    if (!documento || !telefono) {
       console.info('Validación fallida: documento y telefono requeridos faltantes');

        rsp.success = false;
        rsp.message = Constantes.ERROR_CUSTOM_MESSAGES.REQUERIDOS;
        rsp.cod_error = Constantes.STATUS_CODES.BAD_REQUEST;
        res.status(Constantes.STATUS_CODES.BAD_REQUEST).json(rsp);
        return;
    }

    try {
      // Llamar al servicio SOAP
      const soapResponse = await SoapClientService.callSoapMethod('consultarBilletera', {
        documento: documento as string,
        telefono: telefono as string
      });

      console.log('SOAP Response processed for consultarBilletera:', soapResponse);
      
      // La respuesta ya viene parseada por el servicio mejorado
      if (soapResponse.success === true) {
        rsp.success = true;
        rsp.message = soapResponse.message || 'Billetera consultada correctamente';
        rsp.cod_error = 0;
        rsp.data = soapResponse.data || soapResponse;
        
        res.status(Constantes.STATUS_CODES.OK).json(rsp);
      } else {
        rsp.success = false;
        rsp.message = soapResponse.message || 'Error al consultar la billetera';
        rsp.cod_error = soapResponse.cod_error || Constantes.STATUS_CODES.BAD_REQUEST;
        rsp.data = soapResponse.data || null;
        
        res.status(Constantes.STATUS_CODES.BAD_REQUEST).json(rsp);
      }
    } catch (error: any) {
      console.error('Error en el controlador consultarBilletera:', error);
    
      rsp.success = false;
      rsp.message = Constantes.MESSAGES.INTERNAL_SERVER_ERROR + error.message;
      rsp.cod_error = Constantes.STATUS_CODES.INTERNAL_SERVER_ERROR;
      
      res.status(Constantes.STATUS_CODES.INTERNAL_SERVER_ERROR).json(rsp);
    }
  } catch (error: any) {
    console.error('Error en el controlador consultarBilletera:', error);
    
    rsp.success = false;
    rsp.message = Constantes.MESSAGES.INTERNAL_SERVER_ERROR;
    rsp.cod_error = Constantes.STATUS_CODES.INTERNAL_SERVER_ERROR;
    
    res.status(Constantes.STATUS_CODES.INTERNAL_SERVER_ERROR).json(rsp);
  }
};
