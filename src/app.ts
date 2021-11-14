import dotenv from 'dotenv';
dotenv.config();

import Instagramator from './Instagramator.js';
import cron from 'node-cron';
import Quote from './Quote.js';

// Use sample instead of fetching from API.
const isTest = false;

/**
 * Logic to execute on daily basis.
 */
async function daily(): Promise<void> {
  let quoteOfTheDay = null;

  if (isTest) {
    quoteOfTheDay = new Quote().makeSample();
  } else {
    quoteOfTheDay = await new Quote().init();
  }

  if (!!quoteOfTheDay) {
    const instagramator = new Instagramator();
    const photo = await instagramator.generatePostImage(quoteOfTheDay);
    if (!isTest) {
      await instagramator.publishOnIG(photo);
    }
  }
}

if (isTest) {
  // 20sec interval to test with.
  cron.schedule('*/20 * * * * *', daily);
} else {
  cron.schedule('* * * * *', daily);
}
