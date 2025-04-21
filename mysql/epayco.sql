
-- Tabla de clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    documento VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL,
    INDEX idx_cliente_email (email),
    INDEX idx_cliente_documento (documento),
    INDEX idx_cliente_telefono (telefono)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Tabla de billetera
CREATE TABLE billetera (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    total decimal(15, 2) NOT NULL DEFAULT 0.0,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_billetera_cliente_id (cliente_id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Tabla de sesion
CREATE TABLE session (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    token VARCHAR(6) DEFAULT NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_session_token (token),
    INDEX idx_session_cliente_id (cliente_id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Tabla de Transacciones (Historial de Movimientos)
CREATE TABLE transacciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    billetera_id INT NOT NULL,
    tipo_transaccion ENUM('ingreso', 'egreso') DEFAULT 'ingreso',
    monto DECIMAL(15, 2) NOT NULL,
    saldo_anterior DECIMAL(15, 2) NOT NULL,
    saldo_nuevo DECIMAL(15, 2) NOT NULL,
    referencia VARCHAR(100),
    concepto VARCHAR(255),
    fecha_transaccion DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (billetera_id) REFERENCES billetera(id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;