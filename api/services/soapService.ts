// src/services/soapService.ts
import { Cliente } from '../models/Cliente';
import { Response } from '../models/Response';
import * as soap from 'soap';
import * as dotenv from 'dotenv';

dotenv.config();

const SOAP_URL = process.env.SOAP_URL || 'http://soap:80/soap';
export class SoapService {
    private client: any;
    private clientPromise: Promise<any>;
  
    constructor() {
      this.clientPromise = soap.createClientAsync(SOAP_URL)
        .then(client => {
          this.client = client;
          return client;
        })
        .catch(err => {
          console.error('Error al conectar con el servicio SOAP:', err);
          throw err;
        });
    }
  
    async registrarCliente(cliente: Cliente): Promise<Response> {
      try {
        await this.clientPromise;
        
        const result = await new Promise<Response>((resolve, reject) => {
          this.client.registrarCliente({ data: cliente }, (err: any, result: any) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
        
        return result;
      } catch (error) {
        console.error('Error al registrar cliente:', error);
        throw error;
      }
    }
  
    async listarClientes(): Promise<Response> {
      try {
        await this.clientPromise;
        
        const result = await new Promise<Response>((resolve, reject) => {
          this.client.listarClientes({}, (err: any, result: any) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
        
        return result;
      } catch (error) {
        console.error('Error al listar clientes:', error);
        throw error;
      }
    }
  }