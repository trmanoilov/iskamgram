import Jimp from 'jimp';
import Quote from './Quote.js';

import Instagram from 'instagram-web-api';

/**
 * Prepares background, logo, and quote text
 * to a new image file that's to be published on IG.
 */
class Instagramator {
  /**
   * Set of hashtags to insert into the post caption.
   */
  hashtagLine = `#quotes #stirring #inhalation #breathing_in #encouragement #muse #inspire #impetus #motivation #imagination #ennobling #exalting #inspirational #uplifting #motivating #enlightening #invigorating #exhilarating #rewarding #heartening #motive #need #motivator #motivated #motivates #motivating #reason #daily #desire #inspiration #quotation #cite #quotation_mark #paraphrase #quotations #phrase #excerpt #read #unquote #fine #well #better #form #fun #happy #like #love #meaning #nice `;

  POST_W = 800;
  POST_H = 800;

  CONTENT_W = 600;
  CONTENT_H = 400;
  CONTENT_X = 100;
  CONTENT_Y = 150;

  // Needed to make sure author shows below the quote.
  CONTENT_AUTHOR_OFFSET = 20;

  LOGO_W = 300;
  LOGO_H = Jimp.AUTO;
  LOGO_X = 250;
  LOGO_Y = 550;

  /**
   * Builds the background image for the new post.
   *
   * There's absolutely no need to make it this complex
   * but I wanted to play around with the image processing library.
   *
   * @return {Promise<Jimp>} Jimp object of the background image.
   */
  async prepareBackground(): Promise<Jimp> {
    const backgroundImage = await Jimp.read(
      `${process.env.ASSETS_PATH?.toString()}/blackboard.jpg`,
    );

    const logo = await Jimp.read(
      `${process.env.ASSETS_PATH?.toString()}/logo.png`,
    );
    logo.resize(this.LOGO_W, this.LOGO_H, Jimp.RESIZE_HERMITE);

    backgroundImage
      .resize(this.POST_W, this.POST_H, Jimp.RESIZE_BICUBIC)
      .composite(
        new Jimp(
          this.POST_W,
          this.POST_H,
          '#000000',
          (_err, background) => background,
        ),
        0,
        0,
        {
          mode: Jimp.BLEND_MULTIPLY,
          opacitySource: 0.5,
          opacityDest: 0.9,
        },
      )
      .grayscale()
      .composite(logo, this.LOGO_X, this.LOGO_Y, {
        mode: Jimp.BLEND_ADD,
        opacitySource: 1,
        opacityDest: 0.8,
      });

    return backgroundImage;
  }

  /**
   * Prepares quote content as an image to bypass the
   * need of building custom bitmap font to allow
   * changing of the font color. It's stupid, but it works.
   *
   * @param {Quote} quote The quote.
   * @return {Promise<Jimp>} Jimp object of the text image.
   */
  async prepareText(quote: Quote): Promise<Jimp> {
    const canvasSimulator = new Jimp(this.CONTENT_W, this.CONTENT_H, '');
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

    // Output content.
    canvasSimulator.print(
      font,
      0,
      0,
      {
        text: quote.getContent(),
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      },
      this.CONTENT_W,
      this.CONTENT_H,
    );

    const quoteHeight = Number(
      Jimp.measureTextHeight(font, quote.getContent(), this.CONTENT_W),
    );
    const authorTextPosY = quoteHeight + Number(this.CONTENT_AUTHOR_OFFSET);

    // Output author.
    canvasSimulator.print(
      font,
      0,
      authorTextPosY,
      {
        text: `- ${quote.getAuthor()}`,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      },
      this.CONTENT_W,
      this.CONTENT_H,
    );

    return canvasSimulator;
  }

  /**
   * Prepare post image.
   *
   * @param {Quote} quote The quote we'll ship to IG.
   * @return {Promise<string>} Path to the generated image.
   */
  async generatePostImage(quote: Quote): Promise<string> {
    const background = await this.prepareBackground();
    const text = await this.prepareText(quote);

    background.composite(text, this.CONTENT_X, this.CONTENT_Y, {
      opacityDest: 1,
      opacitySource: 0.8,
      mode: Jimp.BLEND_ADD,
    });

    const outputImage = `images/${Date.now()}_quote.jpg`;
    await background.writeAsync(outputImage);

    return outputImage;
  }

  /**
   * Generates an image and posts it to IG.
   *
   * @param {string} photo Path to the image to post.
   */
  async publishOnIG(photo: string): Promise<void> {
    const client = new Instagram({
      username: process.env.IG_USER,
      password: process.env.IG_PASS,
    });

    await client.login();

    // Assign to see results.
    await client.uploadPhoto({
      photo,
      caption: this.hashtagLine,
      post: 'feed',
    });
  }
}

export default Instagramator;
