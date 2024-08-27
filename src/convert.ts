import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

// ffmpeg의 경로 설정
ffmpeg.setFfmpegPath(ffmpegPath as string);

// MTS 파일을 MP4로 변환하는 함수
const convertMtsToMp4 = (
  inputFilePath: string,
  outputFilePath: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFilePath)
      .output(outputFilePath)
      .on('end', () => {
        console.log(`Converted: ${inputFilePath} -> ${outputFilePath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`Error converting ${inputFilePath}:`, err);
        reject(err);
      })
      .run();
  });
};

// 주어진 폴더에서 MTS 파일 목록을 읽기
const getMtsFiles = (folderPath: string): string[] => {
  return fs
    .readdirSync(folderPath)
    .filter((file) => path.extname(file).toLowerCase() === '.mts')
    .map((file) => path.join(folderPath, file));
};

// 명령어 인자 읽기
const [, , inputFolderPath] = process.argv;

if (!inputFolderPath) {
  console.error('Usage: node dist/convert.js <inputFolderPath>');
  process.exit(1);
}

// `converted` 폴더 생성
const convertedFolderPath = path.join(inputFolderPath, 'converted');
if (!fs.existsSync(convertedFolderPath)) {
  fs.mkdirSync(convertedFolderPath);
}

// MTS 파일 목록 가져오기
const mtsFiles = getMtsFiles(inputFolderPath);

if (mtsFiles.length === 0) {
  console.log('No MTS files found.');
  process.exit(0);
}

// MTS 파일들을 MP4로 변환
(async () => {
  for (const mtsFile of mtsFiles) {
    const outputFilePath = path.join(
      convertedFolderPath,
      `${path.parse(mtsFile).name}.mp4`
    );
    try {
      await convertMtsToMp4(mtsFile, outputFilePath);
    } catch (error) {
      console.error(`Failed to convert ${mtsFile}:`, error);
    }
  }
  console.log('All files converted.');
})();
