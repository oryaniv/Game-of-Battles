<template>
  <div class="status-description-box">
    {{ text }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    text: {
      type: String,
      required: true
    }
  }
});
</script>

<style scoped>
.status-description-box {
  border: 1px solid #ccc;
  padding: 10px;
  margin: 24px 5px 5px 5px;
  /* top: 10px; */
  position: absolute;
  background-color: #2F4F4F;
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.2),
    inset -1px -1px 2px rgba(0, 0, 0, 0.4),

    /* The "Golden" Border - this is the key change */
    0 0 0 2px #A17A50,
    0 0 0 3px #8B7355,

    /* Outer shadow for depth (from original) */
    3px 3px 6px rgba(0, 0, 0, 0.4);
    z-index: 10;
}
</style>