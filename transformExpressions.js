// ['Category']: {
// 	"category": string
// 	"commands: {
// 		['Command']: {
// 			"name": string
// 			"syntax": string
// 			"description": string
// 			"example: string
// 		}
// 	}
// }
var _ = require("lodash");
const fs = require("fs");


function groupBy(
  dataToGroupOn,
  fieldNameToGroupOn,
  fieldNameForGroupName,
  fieldNameForChildren
) {
  var result = _.chain(dataToGroupOn)
    .groupBy(fieldNameToGroupOn)
    .toPairs()
    .map(function (currentItem) {
      return _.zipObject(
        [fieldNameForGroupName, fieldNameForChildren],
        currentItem
      );
    })
    .value();
  return result;
}

const main = (language) => {
  fs.readFile(`./${language}.expressions.json`, (err, data) => {
    if (err) throw err;

    const functions = JSON.parse(data);

    function getCommandsAsKeys(_data) {
      let commands = {};
      _data.commands.forEach((command) => {
        commands[
          command.name.replace("Função", "").replace("function").trim()
        ] = command;
      });
      return commands;
    }

    var result = groupBy(functions, "type", "commandType", "commands");
    result = result.map((data) => {
      return {
        [data.commandType.replace(/s/g, "").replace(":", "")]: {
          category: data.commandType.replace(":", ""),
          commands: getCommandsAsKeys(data),
        },
      };
    });

    fs.writeFile(
      `${language}.transformed.json`,
      JSON.stringify(result),
      function (err) {
        if (err) throw err;
        console.log("Saved!", result);
      }
    );
  });
};

for (let language of ['pt-br','en-us']) main(language);
