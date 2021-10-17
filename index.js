const puppeteer = require("puppeteer")
const domain = "https://www.fxstreet.com"
let dataList = [{ url: "https://www.fxstreet.com", visited: false, classNameFound: true }]

async function processPage(url) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url)

    let urls = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("a")).map(x => x.href)
    })

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
    console.log('new url: ',newUrl.url)
    if (newUrl) {
        await processPage(newUrl.url)
    }
}
(async () => {
    try {
        const entryUrl = dataList[0].url
        console.log('entryUrl: ',entryUrl)
        await processPage(entryUrl).catch(err => console.log(err))
        console.log(dataList)
    } catch (e) {
        console.log(e)
    }
})();
