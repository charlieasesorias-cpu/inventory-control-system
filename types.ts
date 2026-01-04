
export interface Product {
  code: string;
  name: string;
}

export enum MovementType {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
  TRASLADO = 'TRASLADO'
}

export type Category = 'MP' | 'PT';

export interface InventoryEntry {
  tag: string;           // Col 0
  fechaRegistro: string;  // Col 1
  turno: number;          // Col 2
  operador: string;       // Col 3
  codigo: string;         // Col 4
  producto: string;       // Col 5
  lote: string;           // Col 6
  fechaFabricacion: string; // Col 7
  origen: string;         // Col 8
  entrada: string;        // Col 9 (Tipo de entrada)
  pesoBruto: number;      // Col 10
  taraEstibas: number;    // Col 11
  taraCestas: number;     // Col 12
  neto: number;           // Col 13
  destino: string;        // Col 14
  fechaVencimiento: string; // Col 15
  pasillo: string;        // Col 16
  torre: string;          // Col 17
  piso: string;           // Col 18
  pagina: string;         // Col 19
  observaciones: string;  // Col 20
  cava: string;           // Derivado o Col 16
  timestamp: number;
  tipo: MovementType;
  categoria: Category;
  merma?: number;
}

export interface OperationalIncident {
  id: string;
  type: string;
  description: string;
  duration: number;
  timestamp: number;
}