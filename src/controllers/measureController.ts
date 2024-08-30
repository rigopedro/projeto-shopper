import { Request, Response } from 'express';
import { validateMeasureData, validateUUID, processImage } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { isMeasureDuplicate, isMeasuredConfirmed, confirmMeasureInDb } from '../utils/measureUtils';
import db from '../db';

export const uploadMeasure = async (req: Request, res: Response) => {
  try {
    if (!validateMeasureData(req.body)) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: 'Dados inválidos fornecidos'
      });
    }

    const { image, customer_code, measure_datetime, measure_type } = req.body;

    if (await isMeasureDuplicate(customer_code, measure_datetime, measure_type)) {
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

    if (await isMeasuredConfirmed(measure_uuid)) {
      return res.status(409).json({
        error_code: 'ALREADY_CONFIRMED',
        error_description: 'Leitura já foi confirmada'
      });
    }

    const success = await confirmMeasureInDb(measure_uuid, confirmed_value);

    if (!success) {
      return res.status(400).json({
        error_code: 'CONFIRMATION_FAILED',
        error_description: 'Falha ao confirmar a leitura'
      });
    }

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

    const validMeasureTypes = ['WATER', 'GAS'];
    if (measure_type && !validMeasureTypes.includes((measure_type as string).toUpperCase())) {
      return res.status(400).json({
        error_code: 'INVALID_TYPE',
        error_description: 'Tipo de medição não permitida'
      });
    }

    const measuresQuery = db('measures').where({ customer_code: customerCode });

    if (measure_type) {
      measuresQuery.andWhere({ measure_type: (measure_type as string).toUpperCase() });
    }

    const measures = await measuresQuery.select('id as measure_uuid', 'measure_datetime', 'measure_type', 'is_confirmed as has_confirmed', 'image_url');

    if (measures.length === 0) {
      return res.status(404).json({
        error_code: 'MEASURES_NOT_FOUND',
        error_description: 'Nenhuma leitura encontrada'
      });
    }

    res.status(200).json({
      customer_code: customerCode,
      measures
    });
  } catch (error) {
    const err = error as Error;
    res.status(404).json({
      error_code: 'MEASURES_NOT_FOUND',
      error_description: 'Nenhuma leitura encontrada'
    });
  }
};
