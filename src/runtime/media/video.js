import { IO, env } from '#utils/io.js';
import { UnProcessable } from '../exceptions/UnProcessable.js';

const PATH_FFMPEG = env.PATH_FFMPEG || 'ffmpeg';
const PATH_FFPROBE = env.PATH_FFPROBE || 'ffprobe';

export async function getVideoInfo(path) {
  const { streams } = JSON.parse(
    await IO.exec(
      `${PATH_FFPROBE} -v error -print_format json -show_streams -select_streams v "${path}"`
    )
  );

  if (streams?.length) {
    return streams[0];
  } else {
    throw new UnProcessable('Not found video streams');
  }
}

export async function convertVideo(source, target, options) {
  let { width, height, duration: ds } = await getVideoInfo(source);
  let duration = Math.round(Number(ds));

  let cmd = PATH_FFMPEG + ' -i "' + source + '" -v error';

  if (width > options.maxWidth || height > options.maxHeight) {
    if (width > height) {
      height = Math.round(options.maxHeight / (width / height));
      width = options.maxWidth;

      cmd += ' -vf "scale=' + width + ':-1"';
    } else {
      width = Math.round(options.maxWidth / (height / width));
      height = options.maxHeight;

      cmd += ' -vf "scale=-1:' + height + '"';
    }
  }

  if (options.type === 'AV1') {
    cmd += ' -c:v libsvtav1';
    cmd += ' -preset 10';
    cmd += ' -crf 36';
    cmd += ' -pix_fmt yuv420p10le';
    cmd += ' -svtav1-params fast-decode=1';
  } else {
    cmd += ' -c:v copy';
  }

  cmd += ' -c:a copy';
  cmd += ' -y "' + target + '"';

  await IO.exec(cmd);

  if (options.poster) {
    const time = duration / 10;

    await IO.exec(
      `${PATH_FFMPEG} -y -v error -ss ${time} -i "${target}" -frames:v 1 "${options.poster}"`
    );
  }

  return { width, height, duration, size: IO.getFileSize(target) };
}

// console.log(
//   await convertVideo(
//     '/Users/oleksiiskydan/Desktop/Labs/Files/2.mp4',
//     '/Users/oleksiiskydan/Desktop/Labs/Files/aa.mkv',
//     {
//       type: 'AV1',
//       maxWidth: 1280,
//       maxHeight: 1280,
//       poster: '/Users/oleksiiskydan/Desktop/Labs/Files/aa.avif',
//     }
//   )
// );
