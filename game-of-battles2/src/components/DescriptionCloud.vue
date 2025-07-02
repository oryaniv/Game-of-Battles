<template>
  <div class="description-cloud-container">
    <div class="description-cloud-text">{{ text }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    text: {
      type: String,
      required: false
    }
  }
});
</script>

<style scoped>
.description-cloud-container {
  height: 20px;
  width:  100%;
  z-index: 10;
  border: none;
  transition: all 0.3s ease;

   background-image: radial-gradient(circle at center,
                       rgba(30, 0, 40, 0.9) 0%,
                       rgba(30, 0, 40, 0.7) 60%,
                       rgba(30, 0, 40, 0) 100%
                     );
   background-color: transparent;

   padding: 15px 20px;
   border-radius: 20px;

   box-shadow: 
     0 0 15px 5px rgba(245, 232, 210, 0.6),
     0 0 25px 8px rgba(245, 232, 210, 0.4) inset;
}

.description-cloud-container .description-cloud-text {
  color: white;
  font-size: 1em;
  text-align: center;
  font-family: 'Exo 2', sans-serif;
}
</style>