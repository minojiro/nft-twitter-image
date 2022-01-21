<template>
  <div class="main">
    <h1><span>NFTアイコン</span><span>画像</span><span>ジェネレーター</span></h1>
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
import { useImageGenerator } from './useImageGenerator'
import mask from './assets/mask.png'

export default defineComponent({
  name: 'App',
  setup() {
    const canvasEl = ref<HTMLCanvasElement>()
    const {
      setImage,
      SIZE,
      imageLoaded,
      resetImage,
    } = useImageGenerator(canvasEl)

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

<style src="./style.css"></style>
