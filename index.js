const puppeteer = require("puppeteer")
const domain = "https://www.fxstreet.com"
let dataList = [{ url: "https://www.fxstreet.com", visited: false, classNameFound: true }]
const selectorToSearch = "[fxs_name='ktl']";

async function processPage(url) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 0
    })

    let urls = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("a")).map(x => x.href)
    })

    const isSelectorFound = await page.evaluate((selectorToSearch) => {
        return Array.from(document.querySelectorAll(selectorToSearch)).length
    }, selectorToSearch)

    if (isSelectorFound > 0) console.log(url)

    await browser.close()

    urls = urls.filter(url => url.startsWith(domain) || url.startsWith("/")).map(url => {
        url = url.includes('#') ? url.substring(0, url.indexOf('#')) : url
        url = url.includes('?') ? url.substring(0, url.indexOf('?')) : url
        if (url.startsWith(domain)) return url
        else if (url.startsWith("/")) return domain + url
    })

    urls.forEach(url => {
        const found = dataList.some(item => item.url === url)
        if (!found) dataList.push({ url: url, visited: false, classNameFound: true })
    })
    dataList[dataList.findIndex(item => item.url === url)] = { url: url, visited: true, classNameFound: true };

    // Set current processed url object classFound visited to true if class is found
    const newUrl = dataList.find(page => page.visited === false);
    if (newUrl) {
        await processPage(newUrl.url)
    } else {
        console.log("All pages evaluated");
    }
}
(async () => {
    try {
        console.log('Searching all pages containing the selector ', selectorToSearch, 'under the domain ', domain)
        const entryUrl = dataList[0].url
        await processPage(entryUrl).catch(err => console.log(err))
    } catch (err) {
        console.log(err)
    }
})();
