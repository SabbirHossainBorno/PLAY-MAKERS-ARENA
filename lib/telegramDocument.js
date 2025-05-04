import { FormData } from 'form-data';
import fs from 'fs';
import axios from 'axios';
import logger from './logger';
import path from 'path';

const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
const TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;

// Validate environment variables
if (!TELEGRAM_API_KEY || !TELEGRAM_GROUP_ID) {
  throw new Error('Telegram credentials missing in environment variables');
}

export const sendTelegramDocument = async (filePath, caption = '') => {
  const url = `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendDocument`;
  
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    const form = new FormData();
    const readStream = fs.createReadStream(filePath);
    const filename = path.basename(filePath);

    form.append('chat_id', TELEGRAM_GROUP_ID);
    form.append('document', readStream, filename);
    form.append('caption', caption.substring(0, 1024)); // Telegram's max caption length
    form.append('parse_mode', 'Markdown');

    const response = await axios.post(url, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    logger.info('Telegram document sent', {
      file: filename,
      message_id: response.data.result.message_id,
      chat_id: TELEGRAM_GROUP_ID
    });

    return {
      success: true,
      message_id: response.data.result.message_id
    };
  } catch (error) {
    logger.error('Telegram document send failed', {
      error: error.message,
      filePath,
      stack: error.stack
    });
    
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};