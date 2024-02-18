const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const originalsDir = path.join(__dirname, "originals");
const framedDir = path.join(__dirname, "framed");
const storiesDir = path.join(__dirname, "stories");

// Ensure the 'framed' and 'stories' directories exist
[framedDir, storiesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Read the 'originals' directory for .jpg files
fs.readdir(originalsDir, async (err, files) => {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }

  for (const file of files) {
    if (path.extname(file).toLowerCase() === ".jpg") {
      const imagePath = path.join(originalsDir, file);
      const framedPath = path.join(framedDir, file);
      const storyPath = path.join(storiesDir, file);

      try {
        const metadata = await sharp(imagePath).metadata();
        const { width, height } = metadata;
        let resizeOptions = {};
        let extendOptions = {};

        if (width > height) {
          // Landscape
          resizeOptions = { width: 1400 };
          const newHeight = Math.round((1400 / width) * height);
          extendOptions = {
            top: Math.round((1440 - newHeight) / 2),
            bottom: Math.round((1440 - newHeight) / 2),
            left: 20,
            right: 20,
          };
        } else {
          // Portrait
          resizeOptions = { height: 1400 };
          const newWidth = Math.round((1400 / height) * width);
          extendOptions = {
            top: 20,
            bottom: 20,
            left: Math.round((1440 - newWidth) / 2),
            right: Math.round((1440 - newWidth) / 2),
          };
        }

        // Process and save the framed image
        await sharp(imagePath)
          .resize(resizeOptions)
          .extend({
            ...extendOptions,
            background: { r: 255, g: 255, b: 255, alpha: 1 },
          })
          .toFile(framedPath);

        console.log("Processed and saved framed image:", file);
        // Assuming the framed image is 1440x1440
        const baseStoryWidth = 1080; // Target width for Instagram story content, not including margins
        const margin = 80; // Margin width for each side

        // Calculate the target height to maintain a 9:19.5 aspect ratio with the effective story width
        const effectiveStoryWidth = baseStoryWidth + margin * 2; // Width including margins
        const storyAspectRatio = 9 / 19.5;
        const effectiveStoryHeight = Math.round(
          effectiveStoryWidth / storyAspectRatio
        );

        // Extend the canvas to the target dimensions with white background, centering the original image
        await sharp(framedPath)
          .extend({
            top: Math.round((effectiveStoryHeight - 1440) / 2),
            bottom: Math.round((effectiveStoryHeight - 1440) / 2),
            left: margin,
            right: margin,
            background: { r: 255, g: 255, b: 255, alpha: 1 },
          })
          .toFile(storyPath);

        console.log("Processed and saved story image:", file);
      } catch (err) {
        console.error("Error processing file:", file, err);
      }
    }
  }
});
