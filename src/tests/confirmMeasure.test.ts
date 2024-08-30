import { confirmMeasure } from '../controllers/measureController';
import { validateUUID } from '../services/geminiService';
import { isMeasuredConfirmed, confirmMeasureInDb } from '../utils/measureUtils';
import { Request, Response } from 'express';

jest.mock('../services/geminiService');
jest.mock('../utils/measureUtils');

describe('confirmMeasure', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it("Mostrar erro se o UUID fornecido for inválido", async () => {
    req.body = { measure_uuid: 'invalid-uuid' };
    (validateUUID as jest.Mock).mockReturnValue(false);

    await confirmMeasure(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error_code: 'INVALID_UUID',
      error_description: 'UUID inválido fornecido'
    });
  });

  it("Mostrar erro se a leitura já foi confirmada", async () => {
    req.body = { measure_uuid: 'valid-uuid', confirmed_value: 100 };
    (validateUUID as jest.Mock).mockReturnValue(true);
    (isMeasuredConfirmed as jest.Mock).mockResolvedValue(true); 

    await confirmMeasure(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error_code: 'ALREADY_CONFIRMED',
      error_description: 'Leitura já foi confirmada'
    });
  });

  it("Confirma a leitura com sucesso", async () => {
    req.body = { measure_uuid: 'valid-uuid', confirmed_value: 100 };
    (validateUUID as jest.Mock).mockReturnValue(true);
    (isMeasuredConfirmed as jest.Mock).mockResolvedValue(false); 
    (confirmMeasureInDb as jest.Mock).mockResolvedValue(true);

    await confirmMeasure(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });
});
