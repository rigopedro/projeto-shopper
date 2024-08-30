import db from '../db'; 

export const isMeasuredConfirmed = async (measure_uuid: string): Promise<boolean> => {
  try {
    const measure = await db('measures').where({ id: measure_uuid }).first();
    return measure ? measure.is_confirmed : false;
  } catch (error) {
    console.error('Erro ao verificar se a medida foi confirmada:', error);
    return false;
  }
};

export const isMeasureDuplicate = async (customer_code: string, measure_datetime: string, measure_type: string): Promise<boolean> => {
  try {
    const existingMeasure = await db('measures').where({
      customer_code,
      measure_datetime,
      measure_type
    }).first();
    return !!existingMeasure;
  } catch (error) {
    console.error('Erro ao verificar duplicação da medida:', error);
    return false;
  }
};

export const confirmMeasureInDb = async (measure_uuid: string, confirmed_value: number): Promise<boolean> => {
  try {
    const measure = await db('measures').where({ id: measure_uuid }).first();
    if (!measure) return false;

    await db('measures').where({ id: measure_uuid }).update({
      confirmed_value,
      is_confirmed: true
    });

    return true;
  } catch (error) {
    console.error('Erro ao confirmar a medida:', error);
    return false;
  }
};
