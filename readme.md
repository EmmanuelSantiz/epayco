# ePayco - Sistema de Billetera Digital

## Descripción

ePayco es un sistema de billetera digital que permite a los usuarios registrarse, recargar saldo y realizar transacciones. La aplicación está construida con una arquitectura de microservicios, utilizando Node.js para la API REST y PHP para el servicio SOAP.

## Arquitectura

El sistema está compuesto por tres servicios principales:

1. **API REST (Node.js/Express)**: Proporciona endpoints para la gestión de clientes y operaciones de billetera.
2. **Servicio SOAP (PHP)**: Maneja la lógica de negocio y las operaciones con la base de datos.
3. **Base de datos (MySQL)**: Almacena la información de clientes, billeteras y transacciones.

### Diagrama de Arquitectura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  Cliente    │────▶│  API REST   │────▶│  Servicio   │
│  (Frontend) │     │  (Node.js)  │     ���  SOAP (PHP) │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
                                        ┌─────────────┐
                                        │             │
                                        │  Base de    │
                                        │  Datos      │
                                        │  (MySQL)    │
                                        │             │
                                        └─────────────┘
```

## Estructura de la Base de Datos

El sistema utiliza las siguientes tablas:

- **clientes**: Almacena la información de los usuarios registrados.
- **billetera**: Registra el saldo disponible de cada cliente.
- **transacciones**: Guarda el historial de todas las operaciones realizadas.

```sql
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    documento VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL
);

CREATE TABLE billetera (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    total DECIMAL(15, 2) NOT NULL DEFAULT 0.0,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_billetera_cliente_id (cliente_id)
);

CREATE TABLE transacciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    billetera_id INT NOT NULL,
    tipo_transaccion ENUM('ingreso', 'egreso') NOT NULL,
    monto DECIMAL(15, 2) NOT NULL,
    saldo_anterior DECIMAL(15, 2) NOT NULL,
    saldo_nuevo DECIMAL(15, 2) NOT NULL,
    referencia VARCHAR(100) NOT NULL,
    concepto VARCHAR(255) NOT NULL,
    fecha_transaccion DATETIME NOT NULL,
    FOREIGN KEY (billetera_id) REFERENCES billetera(id) ON DELETE CASCADE,
    INDEX idx_transacciones_billetera_id (billetera_id),
    INDEX idx_transacciones_fecha (fecha_transaccion)
);
```

## Requisitos

- Docker y Docker Compose
- Node.js 14+ (para desarrollo local)
- PHP 7.4+ (para desarrollo local)
- MySQL 5.7+ (para desarrollo local)

## Instalación y Configuración

### Usando Docker (Recomendado)

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/epayco.git
   cd epayco
   ```

2. Configurar las variables de entorno:
   ```bash
   cp api/.env.example api/.env
   ```

3. Iniciar los servicios con Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Verificar que los servicios estén funcionando:
   ```bash
   docker-compose ps
   ```

### Instalación Manual (Desarrollo)

#### API REST (Node.js)

1. Navegar al directorio de la API:
   ```bash
   cd api
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   ```

4. Iniciar el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

#### Servicio SOAP (PHP)

1. Navegar al directorio del servicio SOAP:
   ```bash
   cd soap_native
   ```

2. Configurar el servidor web (Apache/Nginx) para servir el directorio.

3. Asegurarse de que la extensión SOAP de PHP esté habilitada:
   ```bash
   php -m | grep soap
   ```

## Uso de la API

### Endpoints Disponibles

#### Clientes

- **POST /api/v1/clientes**: Registrar un nuevo cliente
  ```bash
  curl -X POST http://localhost:3000/api/v1/clientes \
    -H "Content-Type: application/json" \
    -d '{
      "nombres": "Juan Pérez",
      "documento": "12345678",
      "email": "juan@example.com",
      "telefono": "123456789"
    }'
  ```

- **GET /api/v1/clientes/documento/:documento**: Obtener información de un cliente por documento
  ```bash
  curl -X GET http://localhost:3000/api/v1/clientes/documento/12345678
  ```

#### Billetera

- **POST /api/v1/billetera/recargar**: Recargar saldo a la billetera
  ```bash
  curl -X POST http://localhost:3000/api/v1/billetera/recargar \
    -H "Content-Type: application/json" \
    -d '{
      "documento": "12345678",
      "monto": 100
    }'
  ```

- **GET /api/v1/billetera/consultar**: Consultar saldo de la billetera
  ```bash
  curl -X GET "http://localhost:3000/api/v1/billetera/consultar?documento=12345678"
  ```

## Estructura del Proyecto

```
epayco/
├── api/                      # Servicio API REST (Node.js)
│   ├── controllers/          # Controladores de la API
│   ├── routes/               # Definición de rutas
│   ├── services/             # Servicios y lógica de negocio
│   ├── utils/                # Utilidades y constantes
│   ├── app.ts                # Punto de entrada de la aplicación
│   ├── package.json          # Dependencias y scripts
│   └── tsconfig.json         # Configuración de TypeScript
│
├── soap_native/              # Servicio SOAP (PHP)
│   ├── soap_service.php      # Implementación del servicio SOAP
│   ├── db_config.php         # Configuración de la base de datos
│   └── Dockerfile            # Configuración de Docker
│
├── mysql/                    # Configuración de la base de datos
│   └── epayco.sql            # Script de inicialización
│
├── docker-compose.yml        # Configuración de Docker Compose
└── README.md                 # Este archivo
```

## Desarrollo

### Convenciones de Código

- **TypeScript**: Seguir las convenciones de ESLint y Prettier.
- **PHP**: Seguir las convenciones de PSR-12.

### Flujo de Trabajo Git

1. Crear una rama para cada nueva característica o corrección:
   ```bash
   git checkout -b feature/nombre-caracteristica
   ```

2. Realizar commits con mensajes descriptivos:
   ```bash
   git commit -m "Añadir funcionalidad de recarga de billetera"
   ```

3. Enviar la rama al repositorio remoto:
   ```bash
   git push origin feature/nombre-caracteristica
   ```

4. Crear un Pull Request para revisión.

## Solución de Problemas

### API no se conecta al servicio SOAP

Verificar que el servicio SOAP esté funcionando correctamente:
```bash
docker logs php-apache-soap-native
```

Asegurarse de que la URL del servicio SOAP sea correcta en el archivo `.env` de la API:
```
SOAP_URL=http://soap_native:80/soap_service.php
```

### Error "Class 'SoapServer' not found"

Verificar que la extensión SOAP de PHP esté instalada y habilitada:
```bash
docker exec -it php-apache-soap-native php -m | grep soap
```

Si no está instalada, actualizar el Dockerfile y reconstruir la imagen:
```dockerfile
RUN docker-php-ext-install pdo pdo_mysql soap
```

## Contribución

1. Hacer fork del repositorio
2. Crear una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Hacer commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Hacer push a la rama (`git push origin feature/amazing-feature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

Nombre - [tu-email@example.com](mailto:tu-email@example.com)

Link del Proyecto: [https://github.com/tu-usuario/epayco](https://github.com/tu-usuario/epayco)