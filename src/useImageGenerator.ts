import { ref, Ref } from "vue";
import mask from "./assets/mask.png";

export class GenerateError extends Error {}
export const SIZE = 200;

// 画像を描画する位置とサイズの計算（object-fit: cover 的なことをする）
const calcImgSizeAndPosition = (
  imgW: number,
  imgH: number,
  resultSize: number
) => {
  const ratio = imgW / imgH;
  const isHorizontal = ratio > 1;
  const dw = isHorizontal ? resultSize * ratio : resultSize;
  const dh = isHorizontal ? resultSize : resultSize / ratio;
  const dx = isHorizontal ? (dw - resultSize) / -2 : 0;
  const dy = isHorizontal ? 0 : (dh - resultSize) / -2;

  return { dw, dh, dx, dy };
};

const loadImageFromUrl = (src: string): Promise<HTMLImageElement> => {
  return new Promise((res, rej) => {
    var img = new Image();
    if (img && img.onload) {
      rej(new GenerateError());
    }
    img.onload = () => {
      res(img);
    };
    img.src = src;
  });
};

const loadImageFromFile = (file: Blob): Promise<HTMLImageElement> => {
  var reader = new FileReader();
  return new Promise((res, rej) => {
    reader.onload = async (evt) => {
      const dataUrl = (evt.target as any).result as string;
      res(await loadImageFromUrl(dataUrl));
    };
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
};

export const useImageGenerator = (canvasEl: Ref) => {
  const imageLoaded = ref(false);

  const setImage = async (e: Event) => {
    const { target } = e;
    if (!(target instanceof HTMLInputElement) || !canvasEl.value) return;
    var c = canvasEl.value.getContext("2d") as CanvasRenderingContext2D;
    if (c === null) throw new GenerateError();

    imageLoaded.value = false;

    const userImg = await loadImageFromFile((target.files as any)[0]);
    const maskImg = await loadImageFromUrl(mask);

    const { dw, dh, dx, dy } = calcImgSizeAndPosition(
      userImg.width,
      userImg.height,
      SIZE
    );

    // ユーザーが設定した画像を描画
    c.globalCompositeOperation = "source-over";
    c.drawImage(userImg, 0, 0, userImg.width, userImg.height, dx, dy, dw, dh);

    // マスクの画像を描画
    c.globalCompositeOperation = "destination-in";
    c.drawImage(maskImg, 0, 0, SIZE, SIZE, 0, 0, SIZE, SIZE);

    imageLoaded.value = true;
  };

  const resetImage = () => {
    imageLoaded.value = false;
  };

  return {
    setImage,
    SIZE,
    imageLoaded,
    resetImage,
  };
};
