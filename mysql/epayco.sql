
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
    id_cliente INT NOT NULL,
    total decimal(10, 2) NOT NULL DEFAULT 0.0,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_billetera_id_cliente (id_cliente)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Tabla de sesion
CREATE TABLE session (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    token VARCHAR(6) DEFAULT NULL,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_session_token (token),
    INDEX idx_session_id_cliente (id_cliente)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;