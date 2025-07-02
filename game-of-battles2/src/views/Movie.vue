<template>
  <div class="movie">
    <h1 style="color: white;">Movie</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Movie',
  setup() {
    return {};
  }
});
</script>

<style scoped>
.movie {
  padding: 20px;
}
</style>