import { uploadMeasure } from '../controllers/measureController';
import { processImage, validateMeasureData } from '../services/geminiService';
import { isMeasureDuplicate } from '../utils/measureUtils';
import { Request, Response } from 'express';

jest.mock('../services/geminiService');
jest.mock('../utils/measureUtils');

describe('uploadMeasure', () => {
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

  it("Mostra um erro se os dados fornecidos forem inválidos", async () => {
    (validateMeasureData as jest.Mock).mockReturnValue(false);

    await uploadMeasure(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error_code: 'INVALID_DATA',
      error_description: 'Dados inválidos fornecidos'
    });
  });

  it("Mostra um erro se a leitura for duplicada", async () => {
    req.body = {
      customer_code: '123',
      measure_datetime: '2024-08-01',
      measure_type: 'water',
      image: 'image_data'
    };
    (validateMeasureData as jest.Mock).mockReturnValue(true);
    (isMeasureDuplicate as jest.Mock).mockReturnValue(true); //esse é o certo!!

    await uploadMeasure(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error_code: 'DOUBLE_REPORT',
      error_description: 'Leitura do mês já realizada'
    });
  });

  it("Vai processar a imagem e mostrar seus valores corretos", async () => {
    req.body = {
      customer_code: '123',
      measure_datetime: '29/08/2024',
      measure_type: 'water',
      image: 'image_data'
    };
    (validateMeasureData as jest.Mock).mockReturnValue(true);
    (isMeasureDuplicate as jest.Mock).mockReturnValue(false);
    (processImage as jest.Mock).mockResolvedValue({
      value: 100,
      image_url: 'http://imagem-url.com'
    });

    await uploadMeasure(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      image_url: 'http://imagem-url.com',
      measure_value: 100,
      measure_uuid: expect.any(String)
    });
  });
});
