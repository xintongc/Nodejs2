import * as Util from "util";
import * as Path from "path";
import * as FS from "fs";
import Request from "request";
import Mkdirp from "mkdirp";
import * as Utils from "./utils";
import Co from "co";

const request = Util.promisify(Request);
const mkdirp = Util.promisify(Mkdirp);
const readFile = Util.promisify(FS.readFile);
const writeFile = Util.promisify(FS.writeFile);
const nextTick = Util.promisify(process.nextTick);

function* crawl(url, nesting) {
  const filename = Utils.urlToFilename(url);
  let body;
  try {
    body = yield readFile(filename, "utf8");
  } catch (err) {
    if (err.code != "ENOENT") {
      throw err;
    }
    body = yield download(url, filename);
  }
  yield crawLinks(url, body, nesting);

  // return readFile(filename, "utf8").then(
  //   body => crawLinks(url, body, nesting),
  //   err => {
  //     if (err.code != "ENOENT") {
  //       throw err;
  //     }
  //     return download(url, filename).then(body =>
  //       crawLinks(url, body, nesting)
  //     );
  //   }
  // );
}

function* crawLinks(currentUrl, body, nesting) {
  //let promise = Promise.resolve();
  if (nesting === 0) {
    return nextTick;
  }

  const links = Utiles.getPageLinks(currentUrl, body);
  for (const link of links) {
    yield crawl(link, nesting - 1);
  }
}

function* download(url, filename) {
  console.log(`Downloading ${url}`);
  const response = yield request(url);
  const body = response.body;
  yield mkdirp(Path.dirname(filename));
  yield writeFile(filename, body);
  console.log("Downloaded and saved: ${url}");
  return body;

  // let body;

  // return request(url)
  //   .then(response => {
  //     body = response.body;
  //     return mkdirp(Path.dirname(file));
  //   })
  //   .then(() => writeFile(filename, body))
  //   .then(() => {
  //     console.log("Downloaded and saved: ${url}");
  //     return body;
  //   });
}

Co(function*() {
  try {
    yield crawl(process.argv[2], 2);
    console.log("Download complete");
  } catch (err) {
    console.log(err);
  }
});

// crawl(process.argv[2], 2)
//   .then(() => console.log("Download complete"))
//   .catch(err => console.log(err));
