interface VideoInfo {
  size: number;
  width: number;
  height: number;
  duration: number;
}

interface ConvertVideoOptions {
  type?: 'AV1';
  poster?: string;
  maxWidth: number;
  maxHeight: number;
}

export declare function convertVideo(
  source: string,
  target: string,
  options: ConvertVideoOptions
): Promise<VideoInfo>;
