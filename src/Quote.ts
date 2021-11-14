import fetch from 'node-fetch';

/**
 * Structure of the quotes.rest API response.
 *
 * Really hope they don't change that as the app will most likely crash.
 */
type quotesApiResponse = {
  success: 'string';
  contents: {
    quotes: [
      {
        author: 'string';
        quote: 'string';
        tags: ['string'];
        id: 'string';
        image: 'string';
        length: 0;
      },
    ];
  };
};

/**
 * Quote class.
 *
 * Created for the sake of having a class, nothing too special.
 */
class Quote {
  content = '';
  author = '';

  /**
   * Fetches and sets the data needed, using some dirty hacks to fetch
   * data in the class constructor. Whops.
   * @param {string} category Quote's category.
   * @return {Promise<Quote>} The fetched quote as a Quote object.
   */
  init(category = 'inspire'): Promise<Quote> {
    return (async (): Promise<Quote> => {
      const apiResponse = await fetch(
        `https://quotes.rest/qod?category=${category}&language=en`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!apiResponse.ok) {
        throw new Error(apiResponse.statusText);
      } else {
        const quoteObj: quotesApiResponse =
          (await apiResponse.json()) as quotesApiResponse;
        this.content = quoteObj.contents.quotes[0].quote || '';
        this.author = quoteObj.contents.quotes[0].author || '';
        return this;
      }
    })();
  }

  /**
   * Retrieves quote's content.
   *
   * @return {string} The quote's content.
   */
  getContent(): string {
    return this.content;
  }

  /**
   * Retrieves quote's author.
   *
   * @return {string} The quote's author.
   */
  getAuthor(): string {
    return this.author;
  }

  /**
   * Generates a sample quote content with the needed fields
   * without calling the API.
   *
   * Use to avoid hitting rate limits or just play around.
   *
   * @return {Quote}
   */
  makeSample(): Quote {
    this.content = `Lorem ipsum dolor sit amet amet kriza kriza barak obama mi zvani.`;
    this.author = 'Toster Testov';
    return this;
  }
}

export default Quote;
