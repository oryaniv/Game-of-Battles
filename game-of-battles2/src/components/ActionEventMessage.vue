<template>
    <div :class="{'long-text': actionPart.length > 12, 'longer-text': actionPart.length > 18}" 
       class="action-event-message-container">
      <span class="action-event-message-part">{{ message }}</span>
      <span 
        class="action-event-action-part"
        :class= "{
          skip: actionType === 0,
          defend: actionType === 1,
          attack: actionType === 2,
          skill: actionType === 3,
          coop: actionType === 4,
          inaction: actionType === 5,
        }"
        >
      {{ actionPart }}
      </span>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    message: {
      type: String,
      required: true
    },
    actionPart: {
      type: String,
      required: false
    },
    actionType: {       
      type: Number,
      required: false
    }
  }
});
</script>

<style scoped>

.action-event-message-container {
  margin-top: 2px;
}

.action-event-message-container.long-text {
   font-size: 15px;
   margin-top: 5px;
}

.action-event-message-container.long-text.longer-text {
   font-size: 14px;
   margin-top: 5px;
}

.action-event-message-part {
  color: white;
}

.action-event-action-part.attack {
  color: red;
}

.action-event-action-part.defend {
  color: #9c9cf5;
}

.action-event-action-part.skip {
  color: rgb(0, 255, 0, 0.7);
}

.action-event-action-part.coop {
  color: gold;
}

.action-event-action-part.skill {
  color: #C37FD7;
}

.action-event-action-part.inaction {
  color: #cf5252;
}


</style>