import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EPAYCO API',
      version: '1.0.0',
      description: 'API para la gestión de billeteras y transacciones en el sistema EPAYCO, servicio SOAP como servidor y nodejs como cliente',
    },
    contact: {
      name: "Emmanuel Santiz (Developer)",
      url: "https://github.com/EmmanuelSantiz",
      email: "emmanuel.07.01@hotmail.com"
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    tags: [
      {
        name: "Clientes",
        description: "Servicio para administrar clientes"
      },
      {
        name: "Billetera",
        description: "Servicio para administrar billeteras"
      },
      {
        name: "Session",
        description: "Servicio para administrar sesiones y tokens de seguridad"
      },
      {
        name: "Transacciones",
        description: "Servicio para administrar transacciones"
      }
    ],
    paths: {
      "/api/v1/clientes": {
        post: {
          summary: "Creá un nuevo cliente",
          description: "Registra un nuevo cliente en el sistema, todos los campos son requeridos",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: '#/components/schemas/ClienteDTO'
                }
              }
            }
          },
          tags: [
            "Clientes"
          ],
          operationId: "agregarCliente",
          consumes: [
            "application/json"
          ],
          produces: [
            "application/json"
          ],
          responses: {
            201: {
            description: "Cliente registrado correctamente",
              schema: {
                $ref: "#/components/schemas/ApiResponse"
              }
            },
            400: {
              description: "Cliente no encontrado",
                schema: {
                  $ref: "#/components/schemas/ApiResponse"
                }
              },
            500: {
            description: "Error interno del servidor",
              schema: {
                $ref: "#/components/schemas/ApiResponse" 
              }
            }
          }
        }
      },
      "/api/v1/billetera/saldo": {
        get: {
          summary: "Consultar el saldo de una billetera",
          description: "Consulta el saldo de una billetera asociada a un cliente, por documento y telefono",
          tags: [
            "Billetera"
          ],
          operationId: "consultarSaldo",
          consumes: [
            "application/json"
          ],
          produces: [
            "application/json"
          ],
          parameters: [
            {
              in: "query",
              name: "documento",
              required: true,
              schema: {
                type: "string",
                example: "2340294"
              }
            },
            {
              in: "query",
              name: "telefono",
              required: true,
              schema: {
                type: "string",
                example: "+52 123 456 7890"
              }
            }
          ],
          responses: {
            200: {
            description: "OK",
              schema: {
                $ref: "#/components/schemas/ApiResponse"
              }
            },
            400: {
            description: "Cliente no encontrado",
              schema: {
                $ref: "#/components/schemas/ApiResponse"
              }
            },
            500: {
              description: "Error interno del servidor",
                schema: {
                  $ref: "#/components/schemas/ApiResponse" 
                }
              }
          }
        }
      },
      "/api/v1/billetera/recargar": {
        post: {
          summary: "Recargar una billetera existente",
          description: "Recarga una billetera asociada a un cliente, por documento y telefono",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: '#/components/schemas/BilleteraRecargarDTO'
                }
              }
            }
          },
          tags: [
            "Billetera"
          ],
          operationId: "recargarBilletera",
          consumes: [
            "application/json"
          ],
          produces: [
            "application/json"
          ],
          responses: {
            201: {
            description: "Billetera recargada correctamente",
              schema: {
                $ref: "#/components/schemas/ApiResponse"
              }
            },
            400: {
              description: "Cliente o Billetera no encontrado",
                schema: {
                  $ref: "#/components/schemas/ApiResponse"
                }
              },
            500: {
              description: "Error interno del servidor",
                schema: {
                  $ref: "#/components/schemas/ApiResponse" 
                }
              }
          }
        }
      },
      "/api/v1/session": {
        post: {
          summary: "Creá un token y id de sesion",
          description: "Genera un token y una id de sesion para el cliente directamente al servicio soap",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: '#/components/schemas/BilleteraRecargarDTO'
                }
              }
            }
          },
          tags: [
            "Session"
          ],
          operationId: "agregarSession",
          consumes: [
            "application/json"
          ],
          produces: [
            "application/json"
          ],
          responses: {
            201: {
            description: "Sesion y token registrado correctamente",
              schema: {
                $ref: "#/components/schemas/ApiResponse"
              }
            },
            400: {
              description: "Registros no encontrado",
                schema: {
                  $ref: "#/components/schemas/ApiResponse"
                }
              },
            500: {
              description: "Error interno del servidor",
                schema: {
                  $ref: "#/components/schemas/ApiResponse" 
                }
              }
          }
        }
      },
      "/api/v1/transacciones/pago": {
        post: {
          summary: "Creá una solicitud de pago",
          description: "Genera una solicitud de pago para el cliente, valida el saldo y genera un token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: '#/components/schemas/BilleteraRecargarDTO'
                }
              }
            }
          },
          tags: [
            "Transacciones"
          ],
          operationId: "agregarTransaccionPago",
          consumes: [
            "application/json"
          ],
          produces: [
            "application/json"
          ],
          responses: {
            201: {
            description: "Cliente registrado correctamente",
              schema: {
                $ref: "#/components/schemas/ApiResponse"
              }
            },
            400: {
              description: "Registros no encontrado",
                schema: {
                  $ref: "#/components/schemas/ApiResponse"
                }
            },
            401: {
                description: "No cuentas con el saldo suficiente para realizar esta operacion",
                schema: {
                  $ref: "#/components/schemas/ApiResponse"
                }
            },
            500: {
              description: "Error interno del servidor",
                schema: {
                  $ref: "#/components/schemas/ApiResponse" 
                }
              }
          }
        }
      },
      "/api/v1/transacciones/confirmar": {
        post: {
          summary: "Confirmar pago",
          description: "Confirma el pago de una transacción, valida el token y el id de sesion generados previamente",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: '#/components/schemas/ConfirmarTransaccionDTO'
                }
              }
            }
          },
          tags: [
            "Transacciones"
          ],
          operationId: "agregarTransaccionConfirmacion",
          consumes: [
            "application/json"
          ],
          produces: [
            "application/json"
          ],
          responses: {
            200: {
            description: "Pago aplicado correctamente",
              schema: {
                $ref: "#/components/schemas/ApiResponse"
              }
            },
            400: {
              description: "Registros no encontrado",
                schema: {
                  $ref: "#/components/schemas/ApiResponse"
                }
              },
            500: {
              description: "Error interno del servidor",
                schema: {
                  $ref: "#/components/schemas/ApiResponse" 
                }
              }
          }
        }
      }
    },
    components: {
      schemas: {
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean"
            },
            data: {
              type: "object"
            },
            cod_error: {
              type: "integer"
            },
            message_error: {
              type: "string"
            }
          }
        },
        ClienteDTO: {
          type: "object",
          properties: {
            nombres: {
              type: "string",
              example: "Juan Perez"
            },
            documento: {
              type: "string",
              example: "2340294"
            },
            email: {
              type: "string",
              example: "juan@example.com"
            },
            telefono: {
              type: "string",
              example: "+52 123 456 7890"
            }
          }
        },
        BilleteraRecargarDTO: {
          type: "object",
          properties: {
            documento: {
              type: "string",
              example: "2340294"
            },
            telefono: {
              type: "string",
              example: "+52 123 456 7890"
            },
            total: {
              type: "number",
              example: "300"
            }
          }
        },
        SessionDTO: {
          type: "object",
          properties: {
            documento: {
              type: "string",
              example: "2340294"
            },
            telefono: {
              type: "string",
              example: "+52 123 456 7890"
            }
          }
        },
        ConfirmarTransaccionDTO: {
          type: "object",
          properties: {
            sessionId: {
              type: "integer",
              format: "int64",
              example: "2340294"
            },
            token: {
              type: "string",
              example: "123456"
            }
          }
        }
      }
    }
  },
  apis: ['../routes/*.ts', '../dtos/*.ts'], // Rutas y DTOs con anotaciones
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;