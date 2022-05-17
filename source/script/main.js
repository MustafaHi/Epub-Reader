import { $, $$, decode } from "@sciter"
import { launch } from "@env"
import * as EPUB from "epub"
let currentPagePath = "";

const View = $("#view");
const Nav  = $("#pages");
// var fileName = "W:/Repos/Sciter DLL/Release/sample1.epub";
// var fileName = "W:/Repos/Sciter DLL/Release/example.zip";
// var fileName = "W:/Repos/Epub-Read/ref/Around the World in 28 Languages.epub";
var fileName;
globalThis.doc = "";

// function renderPage(fileName, pageID)
// {
//     let page = doc.pages.find(p => p.id == pageID);
//     console.log("page", page);
//     let html = EPUB.read(fileName, page.path);
//     // console.log(html);
//     View.frame.loadHtml(`<body selectable>${html}</body>`);
// }
function renderPage(fileName, pageID)
{
    let page = doc.toc.find(p => p.id == pageID) || doc.pages.find(p => p.id == pageID);
    currentPagePath = page.path;
    // if(!page) 
    //     page = doc.pages.find(p => p.id == pageID);
    console.log("page", page);
    let html = EPUB.read(fileName, page.path);
    // console.log(html);
    View.frame.loadHtml(`<body selectable>${html}</body>`);

    var x = new URL(page.path);
    // console.log(x.filename, x.pathname);
    $("#pageNo").textContent = `${doc.pages.findIndex(p=> p.path == x.pathname.slice(1))+1}/${doc.pages.length}`;
    if (View.frame.document) View.frame.document.on("click", "a", handleLink);
}

document.ready = async () =>
{
    try {

    } catch (error) {
        console.log("Error:", error);
    }
    // loadDocument(fileName);
};

function loadDocument(path)
{
    fileName = path;
    doc = EPUB.scan(path);
    console.log("doc", doc);

    // for (let page of doc.pages)
    //     pagesEl.options.append(page.path, page.id);

    // let html = doc.pages.map(p => <option value={p.id}>{p.path}</option>);
    let html = doc.toc.map(p => <option value={p.id}>{p.title}</option>);

    Nav.content(html);
    // Nav.$("option").execCommand("set-current");
    Nav.$("option").click();
}

Nav.onchange = function()
{
    renderPage(fileName, this.value);
}



document.$("#openFile").on("click", () =>
{
    var file = Window.this.selectFile({"filter": 'Epub (eBook) .epub|*.epub'});
    if(!file)  return false;

    console.log("opened file", URL.toPath(file));
    loadDocument(URL.toPath(file));
});

document.$("#next").on("click", () =>
{
    let currentPage = doc.pages.findIndex(p=> p.path == currentPagePath);
    if (currentPage < doc.pages.length)
        renderPage(fileName, doc.pages[currentPage+1].id);
});
document.$("#prev").on("click", () =>
{
    let currentPage = doc.pages.findIndex(p=> p.path == currentPagePath);
    if (currentPage > 0)
        renderPage(fileName, doc.pages[currentPage-1].id);
});

function handleLink(evt, a)
{
    console.log(a.attributes["href"]);
    launch(a.attributes["href"]);
    return true;
}
document.on("click", "a", handleLink);
