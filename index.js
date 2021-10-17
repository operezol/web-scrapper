const puppeteer = require("puppeteer")
const domain = "https://www.fxstreet.com"
let dataList = [{ url: "https://www.fxstreet.com", visited: false, classNames: [] }]

async function processPage() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    const url = dataList.find(page => page.visited === false);
    if (url) {
        await page.goto(url.url)

        let urls = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("a")).map(x => x.href)
        })

        await browser.close()

        urls = urls.filter(url => url.startsWith(domain) || url.startsWith("/")).map(url => {
            url = url.includes('#')?url.substring(0, url.indexOf('#')):url
            url = url.includes('?')?url.substring(0, url.indexOf('?')):url
            if (url.startsWith(domain)) return url
            else if (url.startsWith("/")) return domain + url
        })

        // check if urls are already in datalist. 
        // Only include if not
        // Set current processed url object key visited to true 
        // Set current processed url object classFound visited to true if class is found
        // Check if are still urls not visited
        // if true recursive call


        dataList = urls
    } else { return false }
}
(async () => {
    try {
        await processPage().catch(err => console.log(err))
        console.log(dataList)
    } catch (e) {
        console.log(e)
    }
})();
