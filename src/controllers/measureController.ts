import { Request, Response } from 'express';
import { validateMeasureData, validateUUID, processImage } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { isMeasureDuplicate as checkDuplicate, isMeasuredConfirmed as checkConfirmed } from '../utils/measureUtils';

const isMeasureDuplicate = (costumer_code: string, measure_datetime: string, measure_type: string): boolean => {
  //vo faze a logica depois
  return false; // eu sei q tem um return false aqui ent vai ficar
};

const isMeasuredConfirmed = (measure_uuid: string): boolean => {
  //ai a logica pra confirmar a leitura aqui
  return false;
};

export const uploadMeasure = async (req: Request, res: Response) => {
  try {
    if (!validateMeasureData(req.body)) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: 'Dados inválidos fornecidos'
      });
    }

    const { image, customer_code, measure_datetime, measure_type } = req.body;

    if (checkDuplicate(customer_code, measure_datetime, measure_type)) {
      return res.status(409).json({
        error_code: 'DOUBLE_REPORT',
        error_description: 'Leitura do mês já realizada'
      });
    }

    const processedImage = await processImage(image);

    const measureUUID = uuidv4();
    const measureValue = processedImage.value;
    const imageURL = processedImage.image_url;

    res.status(200).json({
      image_url: imageURL,
      measure_value: measureValue,
      measure_uuid: measureUUID
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      error_code: 'INVALID_DATA',
      error_description: err.message
    });
  }
};

export const confirmMeasure = async (req: Request, res: Response) => {
  try {
    const { measure_uuid, confirmed_value } = req.body;

    if (!validateUUID(measure_uuid)) {
      return res.status(400).json({
        error_code: 'INVALID_UUID',
        error_description: 'UUID inválido fornecido'
      });
    }

    if (isMeasuredConfirmed(measure_uuid)) {
      return res.status(409).json({
        error_code: 'ALREADY_CONFIRMED',
        error_description: 'Leitura já foi confirmada'
      });
    }

    // Lógica para confirmar a leitura no banco de dados
    res.status(200).json({ success: true });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      error_code: 'INVALID_DATA',
      error_description: err.message
    });
  }
};

export const listMeasures = async (req: Request, res: Response) => {
  try {
    const { customerCode } = req.params;
    const { measure_type } = req.query;

    res.status(200).json({
      customer_code: customerCode,
      measures: []
    });
  } catch (error) {
    const err = error as Error;
    res.status(404).json({
      error_code: 'MEASURES_NOT_FOUND',
      error_description: 'Nenhuma leitura encontrada'
    });
  }
};