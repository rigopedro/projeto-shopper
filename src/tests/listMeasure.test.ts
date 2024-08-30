import { listMeasures } from '../controllers/measureController';
import { Request, Response } from 'express';
import { isMeasuredConfirmed } from '../utils/measureUtils'; 

jest.mock('../utils/measureUtils', () => ({
  ...jest.requireActual('../utils/measureUtils'),
  isMeasuredConfirmed: jest.fn()
}));

describe('listMeasures', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: { customerCode: '123' },
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it("Mostra um erro se o parâmetro measure_type for inválido", async () => {
    req.query = { measure_type: 'invalid' };

    await listMeasures(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error_code: 'INVALID_TYPE',
      error_description: 'Tipo de medição não permitida'
    });
  });

  it("Retorna uma lista de medidas com sucesso", async () => {
    req.query = { measure_type: 'WATER' };

    (isMeasuredConfirmed as jest.Mock).mockResolvedValue(true);

    
    
    await listMeasures(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      customer_code: '123',
      measures: expect.any(Array) 
    });
  });

  it("Se não encontrar medida vai retornar erro", async () => {
    req.query = { measure_type: 'WATER' };

    (isMeasuredConfirmed as jest.Mock).mockResolvedValue(false);

    await listMeasures(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error_code: 'MEASURES_NOT_FOUND',
      error_description: 'Nenhuma leitura encontrada'
    });
  });
});
