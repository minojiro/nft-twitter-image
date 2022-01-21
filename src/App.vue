<template>
  <div class="main">
    <h1>NFTアイコン画像ジェネレーター</h1>
    <div class="canvasWrap">
      <img :src="mask" v-if="!imageLoaded">
      <canvas v-show="imageLoaded" ref="canvasEl" :width="SIZE" :height="SIZE"></canvas>
      <input v-if="!imageLoaded" label="画像を選択" type="file" accept="image/*" @change="setImage" />
    </div>
    <p v-if="imageLoaded">完成しました！<br />長押し、または、右クリックから画像を保存してください<br /><br /><button @click="resetImage">やりなおし</button></p>
    <p v-else>画像をタップして、アイコンにしたい画像を選択してください</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import mask from './assets/mask.png'

class ImageGenerationError extends Error {}

const MASK_IMAGE_SIZE = 200
const SIZE = 200

export default defineComponent({
  name: 'App',
  setup() {
    const canvasEl = ref<HTMLCanvasElement>()
    const imageLoaded = ref(false)
    const readerLoad = (file: Blob): Promise<string> => {
      var reader = new FileReader();
      return new Promise((res, rej) => {
        reader.onload = (evt) => {
          res( (evt.target as any).result as string)
        }
        reader.readAsDataURL(file)
      })
    }
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((res, rej) => {
        var img = new Image();
        if (img && img.onload) {
          rej(new ImageGenerationError())
        }
        img.onload = () => {
          res(img)
        }
        img.src = src
      })
    }
    const setImage = async (e: Event) => {
      const {target} = e
      if (!(target instanceof HTMLInputElement) || !canvasEl.value) return
      var c = canvasEl.value.getContext('2d') as CanvasRenderingContext2D
      if (c === null) throw new ImageGenerationError()
      imageLoaded.value = false
      const userImgEl = await readerLoad((target.files as any)[0])
      const userImg = await loadImage(userImgEl)
      const maskImg = await loadImage(mask)

      // object-fit: cover 的なことをする計算
      const ratio = userImg.width / userImg.height
      const isHorizontal = ratio > 1
      const dw = isHorizontal ? SIZE * ratio : SIZE
      const dh = isHorizontal ? SIZE : SIZE / ratio
      const dx = isHorizontal ? (dw - SIZE) / -2 : 0
      const dy = isHorizontal ? 0 : (dh - SIZE) / -2

      c.globalCompositeOperation = 'source-over';
      c.drawImage(userImg, 0, 0, userImg.width, userImg.height, dx, dy, dw, dh);
      c.globalCompositeOperation = 'destination-in';
      c.drawImage(maskImg, 0, 0, MASK_IMAGE_SIZE, MASK_IMAGE_SIZE, 0, 0, SIZE, SIZE);
      imageLoaded.value = true
    }
    const resetImage = () => {
      imageLoaded.value = false
    }

    return {
      setImage,
      canvasEl,
      SIZE,
      imageLoaded,
      mask,
      resetImage,
    }
  },
});
</script>

<style>
body {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 0 2ch;
  margin: 0;
  text-align: center;
  background: #E8EFF9;
}
h1 {
  font-size: 1.5em;
  margin-bottom: 1em;
}
h1 span {
  display: inline-block;
}
.canvasWrap {
  position: relative;
  display: inline-block;
}
.canvasWrap input {
  opacity: 0;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  position: absolute;
  cursor: pointer;
}
</style>
