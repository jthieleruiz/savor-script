"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const csv_writer_1 = require("csv-writer");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
            path: 'output.csv',
            header: [
                { id: 'id', title: 'Id' },
                { id: 'recipeUrl', title: 'Recipe Page' },
                { id: 'textContent', title: 'Title' },
                { id: 'recipeLink', title: 'Recipe PDF' },
                { id: 'videoUrl', title: 'Video URL' },
                { id: 'thumbnail', title: 'Thumbnail' },
            ],
            append: true,
        });
        const browser = yield puppeteer_1.default.launch({ headless: false,
            args: [
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ] });
        const page = yield browser.newPage();
        yield login(page);
        yield page.waitForTimeout(2000);
        yield page.goto('https://savourschool.com.au/onlineclasses/');
        yield scrollToBottom(page);
        const pageLinks = yield addPageDataToArray(page);
        // await addVideoPropsToPageLink(pageLinks[0]);
        yield processAllPages(pageLinks);
        // console.log(pageLinks);
        yield page.screenshot({ path: 'example.png' });
        yield browser.close();
        function login(page) {
            return __awaiter(this, void 0, void 0, function* () {
                yield page.goto('https://savourschool.com.au/my-account/');
                yield page.waitForSelector('#username');
                const inputFieldId = '#username';
                yield page.type(inputFieldId, 'tntsanjose@gmail.com');
                const passwordFieldId = '#password';
                yield page.type(passwordFieldId, 'SavoryCooking234!');
                yield page.click('button.btn_circle[name="login"]');
            });
        }
        function scrollToBottom(page) {
            return __awaiter(this, void 0, void 0, function* () {
                yield page.waitForTimeout(5000);
                yield page.waitForSelector('.load_more_progress');
                while (true) {
                    const button = yield page.$('div.load_more_bottom'); // Replace with your button's selector
                    if (button) {
                        yield button.click();
                        // Wait for a short period or for some specific changes on the page
                        yield page.waitForTimeout(1000); // Or use waitForSelector, waitForFunction, etc.
                    }
                    else {
                        break; // Exit the loop if the button is no longer present
                    }
                }
                yield page.waitForTimeout(5000);
            });
        }
        function addPageDataToArray(page) {
            return __awaiter(this, void 0, void 0, function* () {
                let recipeLinks = yield page.$$('.oc_item');
                const properties = yield Promise.all(recipeLinks.map((element) => __awaiter(this, void 0, void 0, function* () {
                    return page.evaluate((el) => {
                        const id = el.getAttribute('data-id');
                        return {
                            recipeUrl: el.getAttribute('href'),
                            textContent: el.textContent,
                            id,
                            recipeLink: `https://savourschool.com.au/online-clasess-pdf/?id=${id}`,
                            // Add more properties as needed
                        };
                    }, element);
                })));
                // console.log((properties)); // Output the properties of each element
                return properties;
                yield page.waitForTimeout(500000);
            });
        }
        function addVideoPropsToPageLink(pageLink) {
            return __awaiter(this, void 0, void 0, function* () {
                yield page.goto(pageLink.recipeUrl);
                const vimeoElement = yield page.$('div.video_wrap iframe');
                yield (vimeoElement === null || vimeoElement === void 0 ? void 0 : vimeoElement.contentFrame());
                const iframeSrc = yield page.$eval('iframe', el => el.src);
                pageLink.videoUrl = iframeSrc;
                const thumbnailElement = yield page.$$eval('.yt-vimeo', elements => elements.map(el => el.getAttribute('data-src')));
                pageLink.thumbnail = thumbnailElement[0];
                // console.log(pageLink);
            });
        }
        function processAllPages(pages) {
            return __awaiter(this, void 0, void 0, function* () {
                for (let i = 0; i < pages.length; i++) {
                    yield addVideoPropsToPageLink(pages[i]);
                    writeRecord(pages[i]);
                }
            });
        }
        function writeRecord(record) {
            return __awaiter(this, void 0, void 0, function* () {
                yield csvWriter.writeRecords([record]);
            });
        }
    });
}
main();
