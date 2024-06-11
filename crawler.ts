import puppeteer from 'puppeteer';
import { createObjectCsvWriter } from 'csv-writer';

async function main() {
  const csvWriter = createObjectCsvWriter({
  path: 'output.csv',
    header: [
      {id: 'id', title: 'Id'},
      {id: 'recipeUrl', title: 'Recipe Page'},
      {id: 'textContent', title: 'Title'},
      {id: 'recipeLink', title: 'Recipe PDF'},
      {id: 'videoUrl', title: 'Video URL'},
      {id: 'thumbnail', title: 'Thumbnail'},
    ],
    append: true,
  });

  const browser = await puppeteer.launch({headless: false,
    args: [
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]});
  const page = await browser.newPage();

  await login(page);

  await page.waitForTimeout(2000);
  await page.goto('https://savourschool.com.au/onlineclasses/');

  await scrollToBottom(page);

  const pageLinks = await addPageDataToArray(page);
  // await addVideoPropsToPageLink(pageLinks[0]);
  await processAllPages(pageLinks);

  // console.log(pageLinks);

  await page.screenshot({ path: 'example.png' });
  await browser.close();

  async function login(page: any) {
    await page.goto('https://savourschool.com.au/my-account/');
    await page.waitForSelector('#username');

    const inputFieldId = '#username';
    await page.type(inputFieldId, 'tntsanjose@gmail.com');

    const passwordFieldId = '#password';
    await page.type(passwordFieldId, 'SavoryCooking234!');

    await page.click('button.btn_circle[name="login"]');

  }

  async function scrollToBottom(page: any) {
    await page.waitForTimeout(5000);

    await page.waitForSelector('.load_more_progress');

    while (true) {
      const button = await page.$('div.load_more_bottom'); // Replace with your button's selector
      if (button) {
        await button.click();
        // Wait for a short period or for some specific changes on the page
        await page.waitForTimeout(1000); // Or use waitForSelector, waitForFunction, etc.
      } else {
        break; // Exit the loop if the button is no longer present
      }
    }
    await page.waitForTimeout(5000);
  }

  async function addPageDataToArray(page: any) {
    let recipeLinks = await page.$$('.oc_item');
    const properties = await Promise.all(recipeLinks.map(async (element:any) => {
      return page.evaluate((el: any) => {
        const id = el.getAttribute('data-id');
        return {
          recipeUrl: el.getAttribute('href'),
          textContent: el.textContent,
          id,
          recipeLink: `https://savourschool.com.au/online-clasess-pdf/?id=${id}`,
          // Add more properties as needed
        };
      }, element);
  }));

  // console.log((properties)); // Output the properties of each element
    return properties;
    await page.waitForTimeout(500000);
  }

  async function addVideoPropsToPageLink(pageLink: any) {
    await page.goto(pageLink.recipeUrl);
    const vimeoElement = await page.$('div.video_wrap iframe');
    await vimeoElement?.contentFrame();
    const iframeSrc = await page.$eval('iframe', el => el.src);
    pageLink.videoUrl = iframeSrc;

    const thumbnailElement = await page.$$eval('.yt-vimeo', elements => elements.map(el => el.getAttribute('data-src')));
    pageLink.thumbnail = thumbnailElement[0];
    // console.log(pageLink);
  }

  async function processAllPages(pages: any) {
    for (let i = 0; i < pages.length; i++) {
      await addVideoPropsToPageLink(pages[i]);
      writeRecord(pages[i]);
    }
  }


  async function writeRecord(record: any) {
    await csvWriter.writeRecords([record]);
  }

}

main();

