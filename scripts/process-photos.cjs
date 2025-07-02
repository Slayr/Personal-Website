const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

const tifDir = path.join(__dirname, '../public/photos/tif');
const jpegDir = path.join(__dirname, '../public/photos/jpeg');
const metadataFile = path.join(__dirname, '../public/photos/metadata.json');

let photoMetadata = {};

async function extractMetadata(tifPath) {
  try {
    const tags = await exiftool.read(tifPath);
    const relevantMetadata = {};
    // Customize which tags you want to extract
    const desiredTags = [
      'ImageWidth',
      'ImageHeight',
      'Make',
      'Model',
      'DateTimeOriginal',
      'Artist',
      'Software',
      'ExposureTime',
      'FNumber',
      'ISO',
      'FocalLength',
      'LensModel',
      'Orientation',
    ];

    desiredTags.forEach(tag => {
      if (tags[tag]) {
        relevantMetadata[tag] = tags[tag].description || tags[tag].toString();
      }
    });
    return relevantMetadata;
  } catch (error) {
    console.error(`Error extracting metadata from ${tifPath}:`, error);
    return {};
  }
}

async function processTif(tifFileName) {
  const tifPath = path.join(tifDir, tifFileName);
  const jpegFileName = tifFileName.replace(/\.tif(f)?$/i, '.jpeg');
  const jpegPath = path.join(jpegDir, jpegFileName);

  console.log(`Processing ${tifFileName}...`);

  try {
    // Convert TIFF to JPEG
    await sharp(tifPath)
      .jpeg({ quality: 95 })
      .toFile(jpegPath);
    console.log(`Converted ${tifFileName} to ${jpegFileName}`);

    // Extract metadata
    const metadata = await extractMetadata(tifPath);
    photoMetadata[tifFileName] = { ...metadata, jpegUrl: `/photos/jpeg/${jpegFileName}`, tifUrl: `/photos/tif/${tifFileName}` };

    await fs.writeJson(metadataFile, photoMetadata, { spaces: 2 });
    console.log(`Metadata for ${tifFileName} updated.`);

  } catch (error) {
    console.error(`Failed to process ${tifFileName}:`, error);
  }
}

async function cleanupRemovedTifs(currentTifs) {
  const existingMetadataKeys = Object.keys(photoMetadata);
  for (const key of existingMetadataKeys) {
    if (!currentTifs.includes(key)) {
      console.log(`Removing metadata for deleted TIFF: ${key}`);
      const jpegFileName = key.replace(/\.tif(f)?$/i, '.jpeg');
      const jpegPath = path.join(jpegDir, jpegFileName);
      if (await fs.pathExists(jpegPath)) {
        await fs.remove(jpegPath);
        console.log(`Removed corresponding JPEG: ${jpegFileName}`);
      }
      delete photoMetadata[key];
    }
  }
  await fs.writeJson(metadataFile, photoMetadata, { spaces: 2 });
}

async function initialProcess() {
  console.log('Starting initial photo processing...');
  await fs.ensureDir(tifDir);
  await fs.ensureDir(jpegDir);

  if (await fs.pathExists(metadataFile)) {
    photoMetadata = await fs.readJson(metadataFile);
  }

  const tifFiles = (await fs.readdir(tifDir)).filter(file => /\.tif(f)?$/i.test(file));

  await cleanupRemovedTifs(tifFiles);

  for (const tifFile of tifFiles) {
    const jpegFileName = tifFile.replace(/\.tif(f)?$/i, '.jpeg');
    const jpegPath = path.join(jpegDir, jpegFileName);

    const tifStat = await fs.stat(path.join(tifDir, tifFile));
    let shouldProcess = true;

    if (await fs.pathExists(jpegPath)) {
      const jpegStat = await fs.stat(jpegPath);
      // Only re-process if TIFF is newer than JPEG
      if (tifStat.mtimeMs <= jpegStat.mtimeMs) {
        shouldProcess = false;
        // Ensure metadata exists even if not re-processed
        if (!photoMetadata[tifFile]) {
          console.log(`Metadata missing for ${tifFile}, extracting...`);
          const metadata = await extractMetadata(path.join(tifDir, tifFile));
          photoMetadata[tifFile] = { ...metadata, jpegUrl: `/photos/jpeg/${jpegFileName}`, tifUrl: `/photos/tif/${tifFile}` };
          await fs.writeJson(metadataFile, photoMetadata, { spaces: 2 });
        }
      }
    }

    if (shouldProcess) {
      await processTif(tifFile);
    }
  }
  console.log('Initial photo processing complete.');
}



async function main() {
  await initialProcess();
}

main().catch(err => {
  console.error('Photo processing script failed:', err);
  process.exit(1);
});
