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

function generarToken(): string {
    const min = 100000; // Minimum 6-digit number
    const max = 999999; // Maximum 6-digit number
    const codigo = Math.floor(Math.random() * (max - min + 1)) + min;
    return codigo.toString();
}

export const crearPago = async (req: Request, res: Response) => {
  const rsp = createResponse();
  
  try {
    // Verificar si el body está vacío
    if (!req.body || Object.keys(req.body).length === 0) {
      console.info('ALERTA: req.body está vacío o undefined');
      rsp.success = false;
      rsp.message = Constantes.ERROR_CUSTOM_MESSAGES.BODY_VACIO;
      rsp.cod_error = Constantes.STATUS_CODES.BAD_REQUEST;
    
      res.status(Constantes.STATUS_CODES.BAD_REQUEST).json(rsp);
      return;
    }

    // Validar campos requeridos
    const { documento, telefono, total } = req.body;
  
    if (!documento || !telefono || !total) {
      console.info('Validación fallida: campos requeridos faltantes');

      rsp.success = false;
      rsp.message = Constantes.ERROR_CUSTOM_MESSAGES.REQUERIDOS;
      rsp.cod_error = Constantes.STATUS_CODES.BAD_REQUEST;
      res.status(Constantes.STATUS_CODES.BAD_REQUEST).json(rsp);
      return;
    }

    try {
        const soapResponse = await SoapClientService.callSoapMethod('consultarBilletera', {
            documento: documento as string,
            telefono: telefono as string
        });
    
        console.log('SOAP Response processed for consultarBilletera:', soapResponse);
        
        // La respuesta ya viene parseada por el servicio mejorado
        if (soapResponse.success === true) {
            if(soapResponse.data.saldo < total) {
                rsp.success = false;
                rsp.message = 'No cuentas con el saldo suficiente para realizar esta operacion';
                rsp.cod_error = Constantes.STATUS_CODES.UNAUTHORIZED;
                rsp.data = null;
                res.status(Constantes.STATUS_CODES.UNAUTHORIZED).json(rsp);
                return;
            }

            const soapResponseToken = await SoapClientService.callSoapMethod('crearToken', {
                documento: documento as string,
                telefono: telefono as string,
                token: generarToken() as string,
                monto: total as string
            });

            console.log('SOAP Response processed:', soapResponseToken);
      
            // La respuesta ya viene parseada por el servicio mejorado
            if (soapResponseToken.success === true) {
                rsp.success = true;
                rsp.message = soapResponseToken.message || 'Pago creado correctamente';
                rsp.cod_error = 0;
                rsp.data = soapResponseToken.data || soapResponseToken;
                
                res.status(Constantes.STATUS_CODES.OK).json(rsp);
                //Enviar correo con datos
                //rsp.data.token_id;
                //rsp.data.token
            } else {
                rsp.success = false;
                rsp.message = soapResponseToken.message || 'Error al recargar la billetera';
                rsp.cod_error = soapResponseToken.cod_error || Constantes.STATUS_CODES.BAD_REQUEST;
                rsp.data = soapResponseToken.data || null;
                
                res.status(Constantes.STATUS_CODES.BAD_REQUEST).json(rsp);
            }
            
            //rsp.data = soapResponse.data || soapResponse;
            //console.log(rsp.data.saldo);
            //res.status(Constantes.STATUS_CODES.OK).json(rsp);
        } else {
            rsp.success = false;
            rsp.message = soapResponse.message || 'Error al consultar la billetera';
            rsp.cod_error = soapResponse.cod_error || Constantes.STATUS_CODES.BAD_REQUEST;
            rsp.data = soapResponse.data || null;
            
            res.status(Constantes.STATUS_CODES.BAD_REQUEST).json(rsp);
        }
    } catch (error: any) {
      console.error('Error en el controlador crearPago:', error);
    
      rsp.success = false;
      rsp.message = Constantes.MESSAGES.INTERNAL_SERVER_ERROR + error.message;
      rsp.cod_error = Constantes.STATUS_CODES.INTERNAL_SERVER_ERROR;
      
      res.status(Constantes.STATUS_CODES.INTERNAL_SERVER_ERROR).json(rsp);
    }
  } catch (error: any) {
    console.error('Error en el controlador crearPago:', error);
    
    rsp.success = false;
    rsp.message = Constantes.MESSAGES.INTERNAL_SERVER_ERROR;
    rsp.cod_error = Constantes.STATUS_CODES.INTERNAL_SERVER_ERROR;
    
    res.status(Constantes.STATUS_CODES.INTERNAL_SERVER_ERROR).json(rsp);
  }
};

export const confirmarPago = async (req: Request, res: Response) => {
    const rsp = createResponse();

    try {
        // Verificar si el body está vacío
        if (!req.body || Object.keys(req.body).length === 0) {
            console.info('ALERTA: req.body está vacío o undefined');
            rsp.success = false;
            rsp.message = Constantes.ERROR_CUSTOM_MESSAGES.BODY_VACIO;
            rsp.cod_error = Constantes.STATUS_CODES.BAD_REQUEST;
        
            res.status(Constantes.STATUS_CODES.BAD_REQUEST).json(rsp);
            return;
        }
    
        // Validar campos requeridos
        const { sessionId, token } = req.body;
        
        if (!sessionId || !token) {
            console.info('Validación fallida: campos requeridos faltantes');
    
            rsp.success = false;
            rsp.message = Constantes.ERROR_CUSTOM_MESSAGES.REQUERIDOS;
            rsp.cod_error = Constantes.STATUS_CODES.BAD_REQUEST;
            res.status(Constantes.STATUS_CODES.BAD_REQUEST).json(rsp);
            return;
        }

        try {
            // Llamar al servicio SOAP
            const soapResponse = await SoapClientService.callSoapMethod('confirmarPago', {
                session_id: sessionId as string,
                token: token as string
            });
    
            console.log('SOAP Response processed:', soapResponse);
            
            // La respuesta ya viene parseada por el servicio mejorado
            if (soapResponse.success === true) {
                rsp.success = true;
                rsp.message = soapResponse.message || 'Pago confirmado correctamente';
                rsp.cod_error = 0;
                rsp.data = soapResponse.data || soapResponse;
                
                res.status(Constantes.STATUS_CODES.OK).json(rsp);
            } else {
                rsp.success = false;
                rsp.message = soapResponse.message || 'Error al confirmar el pago';
                rsp.cod_error = soapResponse.cod_error || Constantes.STATUS_CODES.BAD_REQUEST;
                rsp.data = soapResponse.data || null;
                
                res.status(Constantes.STATUS_CODES.BAD_REQUEST).json(rsp);
            }
        } catch (error: any) {
            console.error('Error en el controlador confirmarPago:', error);
          
            rsp.success = false;
            rsp.message = Constantes.MESSAGES.INTERNAL_SERVER_ERROR + error.message;
            rsp.cod_error = Constantes.STATUS_CODES.INTERNAL_SERVER_ERROR;
            
            res.status(Constantes.STATUS_CODES.INTERNAL_SERVER_ERROR).json(rsp);
        }
    } catch (error: any) {
        console.error('Error en el controlador confirmarPago:', error);
        
        rsp.success = false;
        rsp.message = Constantes.MESSAGES.INTERNAL_SERVER_ERROR;
        rsp.cod_error = Constantes.STATUS_CODES.INTERNAL_SERVER_ERROR;
        
        res.status(Constantes.STATUS_CODES.INTERNAL_SERVER_ERROR).json(rsp);
    }
};

export default {
    crearPago,
    confirmarPago
};
  