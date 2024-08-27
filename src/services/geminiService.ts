import axios from 'axios';

interface ProcessedImage {
  value: number;
  image_url: string;
}


export const validateMeasureData = (data: any): boolean => {
  const { image, costumer_code, measure_datetime, measure_type } = data;

  if (!image || typeof image !== 'string') return false;
  if (!costumer_code || typeof costumer_code !== 'string') return false;
  if (!measure_datetime || isNaN(Date.parse(measure_datetime))) return false;
  if (!measure_type || !['WATER', 'GAS'].includes(measure_type)) return false;

  return true;

};

export const validateUUID = (uuid: string) => {
  const uuiRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuiRegex.test(uuid);
};

export const processImage = async (imageBase64: string): Promise<ProcessedImage> => {
  try {
    const response = await axios.post('', {
      image: imageBase64
    }, {
      headers: {
        Authorization: `Bearer ${process.env.GEMINI_API_KEY}`
      }
    });
    return response.data as ProcessedImage;
  } catch (error) {
    throw new Error('Erro ao processar a imagem');
  }
};
