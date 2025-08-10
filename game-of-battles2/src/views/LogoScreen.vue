<template>
  <div class="logo-screen">
    <Transition name="fade-in-out">
      <img v-show="showLogo" src="../assets/Logo/FCOH_without_50mt.png" class="COH-logo" />
    </Transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { SoundManager } from '../GameData/SoundManager';
import { SoundByte } from '../GameData/SoundLibrary';

export default defineComponent({
  name: 'LogoScreen',
  setup() {
    const showLogo = ref(false);
    const router = useRouter();

    setTimeout(() => {
      showLogo.value = true;
      SoundManager.getInstance().playSound(SoundByte.FOOL_LAUGH);
    }, 300);

    setTimeout(() => {
      showLogo.value = false;
    }, 3000);

    setTimeout(() => {
      router.push('/Intro');
    }, 5000);

    const handleKeyPress = (event: KeyboardEvent) => {
      if(event.key === 'Escape') {
        router.push('/Intro');
      }
    }
    
    window.addEventListener('keydown', handleKeyPress);

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeyPress);
    });

    return {
      showLogo
    };
  }
});
</script>

<style scoped>
.logo-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: black; /* Solid black background */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* Prevent content overflow */
}

.COH-logo {
   width: 700px;
   height: 700px;
}

.fade-in-out-enter-active {
  transition: opacity 1s ease-in-out; /* 1 second fade duration */
  position: absolute; /* Needed for elements to overlap during transition */
}

.fade-in-out-leave-active {
  transition: opacity 2s ease-in-out; /* 1 second fade duration */
  position: absolute; /* Needed for elements to overlap during transition */
}

.fade-in-out-enter-from,
.fade-in-out-leave-to {
  opacity: 0;
}

.fade-in-out-enter-to,
.fade-in-out-leave-from {
  opacity: 1;
}

.fade-in-only-enter-from{
  opacity: 0;
}

</style>