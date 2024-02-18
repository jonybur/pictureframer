const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const directoryPath = path.join(__dirname);

// Read the directory for .jpg files
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }

  files.forEach((file) => {
    if (path.extname(file).toLowerCase() === ".jpg") {
      const imagePath = path.join(directoryPath, file);

      // Process each image
      sharp(imagePath)
        .metadata()
        .then((metadata) => {
          const { width, height } = metadata;
          const maxSize = Math.max(width, height);
          const bgColor = { r: 255, g: 255, b: 255, alpha: 1 };

          sharp(imagePath)
            .resize(maxSize, maxSize, {
              fit: "contain",
              background: bgColor,
            })
            .toFile(path.join(directoryPath, "framed_" + file), (err) => {
              if (err) {
                console.error("Error processing file:", file, err);
              } else {
                console.log("Processed file:", file);
              }
            });
        });
    }
  });
});
