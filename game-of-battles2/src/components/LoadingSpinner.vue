<template>
  <div class="spinner-container">
    <div class="spinner"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LoadingSpinner'
});
</script>

<style scoped>

.spinner-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            position: relative;
        }

        .spinner {
            width: 75px;
            height: 75px;
            border: 5px solid #2F4F4F; /* Dark Slate Gray - primary color for most of the circle */
            border-top-color: #7A5B8C; /* Amethyst - color for the animating part */
            border-bottom-color: #7A5B8C;
            border-radius: 50%;
            animation: spin 1s linear infinite; /* Spin animation */
        }


        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }

</style>
