import { Request, Response } from 'express';
import { Cliente } from '../models/Cliente';
import { SoapService } from '../services/soapService';

const soapService = new SoapService();

export const registrarCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const cliente: Cliente = req.body;

    // Validación básica
    if (!cliente.nombre || !cliente.email) {
      res.status(400).json({
        success: false,
        message: 'El nombre y el email son obligatorios'
      });
      return;
    }

    const result = await soapService.registrarCliente(cliente);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error en el controlador registrarCliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al registrar cliente'
    });
  }
};

export const listarClientes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await soapService.listarClientes();
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error en el controlador listarClientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al listar clientes'
    });
  }
};