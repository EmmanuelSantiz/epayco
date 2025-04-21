export interface BilleteraRecargarDTO {
    documento: string;
    telefono: string;
    total: number;
}

export interface BilleteraCrearDTO {
    clienteId: number;
    total: number;
}