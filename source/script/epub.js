import { loadLibrary, decode, encode, toBase64, fromBase64 } from "@sciter"
const OS = loadLibrary("sciter-extension");

import UniFix from "unifix";

//| OS.zipRead(fileName, entry)
// return content of the entry

//| OS.zipOpen(fileName)
// return array of objects (entries), with `isDir(bool)` and `name`

String.prototype.cleanXML = function() { return UniFix(this.replaceAll("<dc:", "<").replaceAll("</dc:", "</")); }

export function scan(fileName)
{
    let xml = document.createElement("xml");
    const entries = OS.zipOpen(fileName);
    console.log("entries", entries);

    //| check file type
    const isEpub = OS.zipRead(fileName, "mimetype") == "application/epub+zip";
    if  (!isEpub) return false;

    //| get rootfile (content.opf path)
    const containerCheck = OS.zipRead(fileName, "META-INF/container.xml").cleanXML();
    // console.log("containerCheck", containerCheck);
    xml.innerHTML = containerCheck;

    const contentPath = xml.$("rootFile").getAttribute("full-path");

    //| read content.opf (details document)
    xml.innerHTML = OS.zipRead(fileName, contentPath).cleanXML();

    let Details =
    {
        title  : xml.$("title")?.textContent       || fileName,
        author : xml.$("creator")?.textContent     || "UNKNOWN",
        desc   : xml.$("description")?.textContent || "...",
        version: parseInt(xml.$("package").getAttribute("version")),
        pages  : [],
        images : [],
        css    : [],
        toc    : [],
    };

    //| sort links by type (page, image, style:css)
    let items = xml.$("manifest").$$("item");

    for (let item of items)
    {
        switch (item.getAttribute("media-type"))
        {
            case "application/xhtml+xml":
                Details.pages.push ({ id: item.getAttribute("id"), path: item.getAttribute("href") });
            break;

            case "image/jpeg":
            case "image/png":
                Details.images.push({ id: item.getAttribute("id"), path: item.getAttribute("href") });
            break;
                
            case "text/css":
                Details.css.push   ({ id: item.getAttribute("id"), path: item.getAttribute("href") });
            break;
        }
    }

    //| order pages
    let order = xml.$("spine").$$("itemref").map(i=> i.getAttribute("idref"));
    Details.pages.sort((a,b)=> order.indexOf(a.id) - order.indexOf(b.id));

    //| setup toc
    xml.innerHTML = OS.zipRead(fileName, "toc.ncx").cleanXML();
    
    items = xml.$$("navPoint");

    for (let item of items)
    {
        Details.toc.push
        ({
            id   : item.getAttribute("id"),
            order: parseInt(item.getAttribute("playOrder")),
            title: item.$("text").textContent,
            path : item.$("content").getAttribute("src"),
        });
    }

    return Details;
}

function stringToByteArray(str) {
    var array = new Array(str.length);
    var i;
    var il;

    for (i = 0, il = str.length; i < il; ++i) {
        array[i] = str.charCodeAt(i) & 0xff;
    }

    return array;
}


export function read(fileName, entry)
{
    let xml = document.createElement("xml");

    xml.innerHTML = OS.zipRead(fileName, entry).cleanXML();

    for (let css of xml.$$("link"))
    {
        // console.log(css);
        let src = css.getAttribute("href");
            src = (new URL(src)).filename;
            src = (doc.css.find(i => i.path.indexOf(src) >= 0))?.path;
            // console.log(src);
        let style = document.createElement("style");
            style.textContent = UniFix(OS.zipRead(fileName, src));
            // console.log("style", style.textContent);
        xml.appendChild(style);
    }


    for (let img of xml.$$("img"))
    {
        let src = img.getAttribute("src");
            src = (doc.images.find(i => i.path.indexOf(src) >= 0)).path;
            src = doc.images[0].path;
        let graph = OS.zipImage(fileName, src);
        graph = encode(graph);
        graph = toBase64(graph);
        console.log("graph", graph);
        let image = Graphics.Image.fromBytes(fromBase64(graph));
        console.log("image", image);
        document.bindImage("in-memory:" + src, image);
        img.setAttribute("src", "in-memory:" + src);
    }

    return xml.$("body")?.innerHTML || xml.innerHTML;
    // return OS.zipRead(fileName, entry).cleanXML();
}

