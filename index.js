const parse = require("node-html-parser").parse;
const axios = require("axios");
const cheerio = require("cheerio");

let fs = require("fs");

const baseUrl = "https://support.microsoft.com/";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
const navigate = async (url) => {
  try {
    const pageHTML = await axios.default.get(url);
    return parse(pageHTML.data);
  } catch (ex) {
    return false;
  }
};
const languages = [
  {
    code: "pt-br",
    path: "fun%C3%A7%C3%B5es-do-excel-orda-alfab%C3%A9tica-b3944572-255d-4efb-bb96-c6d90033e188",
  },
  {
    code: "en-us",
    path: "excel-functions-alphabetical-b3944572-255d-4efb-bb96-c6d90033e188",
  },
];
const main = async (language) => {
  const document = await navigate(
    baseUrl + `${language.code}/office/${language.path}`
  );

  const table = document.querySelector("table");
  const functions = table?.querySelectorAll("tbody tr");

  let links = [];

  for (let func of functions) {
    const anchor = func?.querySelector("a");
    let name = anchor.textContent.trim();
    let link = anchor.getAttribute("href");
    let type = func?.querySelector("b")?.textContent.trim() || "";

    links.push({
      name,
      link,
      type,
    });
  }

  links.forEach(async (link) => {
    await sleep(1000);
    let functionPage = await navigate(baseUrl + link.link);
    let tries = 10;

    while (!functionPage && tries > 0) {
      await sleep(2000);
      functionPage = await navigate(baseUrl + link.link);
      tries--;
    }

    if (!functionPage) return;

    link.description = functionPage
      .querySelector("#supArticleContent > article > section:nth-child(2) > p")
      ?.textContent.trim();

    link.syntax = {};
    let paramsUl;
    if (language.code === "pt-br") {
      link.syntax.code = functionPage
        .querySelector('[aria-label="Sintaxe"] p')
        ?.textContent.trim();
      link.syntax.alert = functionPage
        .querySelector('[aria-label="Sintaxe"] .ocpAlertSection')
        ?.textContent.trim();

      paramsUl = functionPage.querySelectorAll('[aria-label="Sintaxe"] ul li');
    } else {
      link.syntax.code = functionPage
        .querySelector('[aria-label="Syntax"] p')
        ?.textContent.trim();
      link.syntax.alert = functionPage
        .querySelector('[aria-label="Syntax"] .ocpAlertSection')
        ?.textContent.trim();

      paramsUl = functionPage.querySelectorAll('[aria-label="Syntax"] ul li');
    }

    link.syntax.arguments = [];
    for (let param of paramsUl) {
      link.syntax.arguments.push(param.querySelector("p")?.text.trim());
    }

    const table = functionPage.querySelector("table");
    const exampleHeaderInBody = table?.querySelector(
      "tbody tr td b.ocpLegacyBold"
    );
    const firstExampleRow = table?.querySelector("tbody tr:nth-child(4) td");
    const exampleRows = functionPage?.querySelectorAll("table tbody tr");

    link.example = {};
    for (let row of exampleRows) {
      const data = row?.querySelectorAll("td");
      link.example.formula = data[0]?.textContent.trim() ?? "";
      link.example.description = data[1]?.textContent.trim() ?? "";
      link.example.result = data[2]?.textContent.trim() ?? "";
    }

    if (exampleHeaderInBody) {
      if (firstExampleRow) {
        try {
          link.example.formula +=
            " " + firstExampleRow[0]?.textContent.trim() || "";
          link.example.description +=
            " " + firstExampleRow[1]?.textContent.trim() || "";
          link.example.result +=
            " " + firstExampleRow[2]?.textContent.trim() || "";
        } catch (ex) {
          console.error(ex);
        }
      }
    }

    fs.writeFile(
      `${language.code}.expressions.json`,
      JSON.stringify(links),
      function (err) {
        if (err) throw err;
        console.log("Saved!", link);
      }
    );
  });
};
for (let language of languages) main(language);
