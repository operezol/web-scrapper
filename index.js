const puppeteer = require("puppeteer")
fs = require('fs')
const domain = "https://www.fxstreet.com/"
let domainPaths = [{ url: domain, visited: false }]
let foundDomainPaths = []
const selectorToSearch = ".fxs_alert_live";

async function processPage(url) {

    console.log('Searching in: ', url);

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

    if (isSelectorFound > 0) { 
        console.log('found') 
        foundDomainPaths.push(url)
    } 

    await browser.close()

    function filterURLs(url){
        let passFilter = false;
        if(url.startsWith(domain)||url.startsWith("/")) passFilter=true;
        if(domainPaths.some(item=>item.url.startsWith( domain + 'company/')) &&( url.startsWith( domain + 'company/') ||  url.startsWith( '/company/')))passFilter=false;
        if(domainPaths.some(item=>item.url.startsWith( domain + 'author/')) &&( url.startsWith( domain + 'author/') ||  url.startsWith( '/author/')))passFilter=false;
        return passFilter;
    }

    urls = urls.filter(filterURLs).map(url => {
        url = url.includes('#') ? url.substring(0, url.indexOf('#')) : url
        url = url.includes('?') ? url.substring(0, url.indexOf('?')) : url
        if (url.startsWith(domain)) return url
        else if (url.startsWith("/")) return domain + url
    })

    urls.forEach(url => {
        const found = domainPaths.some(item => item.url === url)
        if (!found) domainPaths.push({ url: url, visited: false })
    })

    domainPaths[domainPaths.findIndex(item => item.url === url)] = { url: url, visited: true };

    const newUrl = domainPaths.find(page => page.visited === false)
    if (newUrl) {
        await processPage(newUrl.url)
    } else {
        console.log("All pages evaluated")
        console.log("Summary of found paths:")
        console.log(foundDomainPaths)
        fs.writeFile('foundUrls.txt', foundDomainPaths.join('\n'))
    }
}
(async () => {
    try {
        console.log('Searching all pages containing the selector ', selectorToSearch, 'under the domain ', domain)
        const entryUrl = domainPaths[0].url
        await processPage(entryUrl).catch(err => console.log(err))
    } catch (err) {
        console.log(err)
    }
})();
