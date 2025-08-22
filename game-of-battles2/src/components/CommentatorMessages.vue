
<template>
  <div class="messages-container">
    <TransitionGroup name="message-fade-slide">
      <div
        v-for="m in displayMessages" :key="m.id"
        :class="['message-box', getMessageBoxTypeClass(m.type)]"
      >
        <span class="message-text-content">{{ m.message }}</span> <!-- Added span for text correction -->
      </div>
    </TransitionGroup>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import { CommentatorMessage } from '../CommentatorMessageProvider'; // Assuming this provides `message: string` and `type: string`

// Define types for message properties, including a unique ID and possibly a timestamp
// This `id` is crucial for Vue's TransitionGroup to work correctly.
interface DisplayMessage extends CommentatorMessage {
  id: number; // Unique ID for v-for key
  timeoutId?: ReturnType<typeof setTimeout>; // To store timeout reference
}

export default defineComponent({
  props: {
    messages: { // This prop will now contain messages to be *added*
      type: Array as () => CommentatorMessage[],
      required: true
    }
  },
  emits: ['message-removed'], // Emit an event when a message should be removed

  data() {
    return {
      displayMessages: [] as DisplayMessage[], // Internal state for messages being displayed
      messageCounter: 0, // Used to generate unique IDs
    };
  },

  mounted() {
    // Watch for changes in the `messages` prop (new messages arriving)
    watch(() => this.messages, (newMessages) => {
      if (newMessages.length === 0) {
        return;
      }

      let currentPromise = Promise.resolve();
      const delayBetweenMessages = 400; // Adjustable delay (e.g., 300ms to 500ms)
      const messageDisplayDuration = 2000; // Message visible for 2 seconds

      // Use `message` directly from newMessages as the source of truth for the loop
      newMessages.forEach((newMessage) => { // Removed `index` from here as it's not needed for the display logic
        currentPromise = currentPromise.then(() => {
          // Check if a message with the *same content* and *type* is already being displayed.
          // This prevents re-adding a message if the parent sends the same one repeatedly.
          const isNewContent = !this.displayMessages.some(dm => dm.message === newMessage.message && dm.type === newMessage.type);

          if (isNewContent) {
            const messageId = this.messageCounter++; // Generate a unique ID
            const messageToDisplay: DisplayMessage = { ...newMessage, id: messageId }; // Assign it

            this.displayMessages.unshift(messageToDisplay); // Add to the top

            // Set a timeout to remove this specific message by its unique ID
            messageToDisplay.timeoutId = setTimeout(() => {
              this.removeMessage(messageId); // Call removeMessage with the unique ID
            }, messageDisplayDuration);
          }
          return new Promise(resolve => setTimeout(resolve, delayBetweenMessages));
        });
      });
    }, { deep: true, immediate: true });
  },

  beforeUnmount() {
    this.displayMessages.forEach(m => {
      if (m.timeoutId) clearTimeout(m.timeoutId);
    });
  },

  methods: {
    removeMessage(id: number) {
      const index = this.displayMessages.findIndex(m => m.id === id);
      if (index !== -1) {
        // Clear timeout if message is removed early (e.g., manual clear)
        if (this.displayMessages[index].timeoutId) {
          clearTimeout(this.displayMessages[index].timeoutId!);
        }
        this.displayMessages.splice(index, 1);
        this.$emit('message-removed', id); // Inform parent if needed
      }
    },
    getMessageBoxTypeClass(type: string): string {
      // Assign specific classes based on message type for different styling/colors
      switch (type) {
        case 'critical_hit':
          return 'message-box-critical';
        case 'big_damage':
          return 'message-box-damage';
        case 'multi_kill':
          return 'message-box-multikill';
        case 'fail':
          return 'message-box-fail';
        default:
          return 'message-box-default'; // For 'Lucia is Frozen!' type messages
      }
    }
  }
});
</script>

<style scoped>
/* Main container for the stack of messages */
.messages-container {
  display: flex;
  flex-direction: column-reverse;
  gap: 12px; /* Slightly reduced gap for a tighter stack */
  padding: 0px; /* Remove padding from here, add to message-box */
  /* Ensure it doesn't clip fading messages if they slide/fade out */
  overflow: visible;
}

/* Individual message box styling */
.message-box {
  font-size: 18px;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
  padding: 8px 15px;
  border-radius: 5px; /* Slightly smaller border-radius to better define angles */
  text-align: center;
  box-shadow: 0 0 5px rgba(0,0,0,0.3);
  white-space: nowrap;
  pointer-events: none;

  /* Default message box background (for 'Lucia is Frozen!') */
  background-color: rgba(61, 8, 85, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);

  /* --- New styles for parallelogram shape --- */
  transform: skewX(25deg); /* Skew the box itself */
  /* This means the content inside will also be skewed.
     To correct the text, we'll apply an inverse skew to the text span inside. */
  position: relative; /* Needed for the inner span positioning if we add one */
}

/* Add this to your template inside the message-box: */
/* <div class="message-box">
 * <span class="message-text-content">{{ m.message }}</span>
 * </div>
 */
.message-text-content {
    display: inline-block; /* Essential for transform on inline elements */
    transform: skewX(-25deg); /* Inverse skew to correct text orientation */
}

.message-box-fail {
  background-color: rgb(192 176 176 / 80%); 
  box-shadow: 0 0 10px rgba(170, 0, 0, 0.5); 
  color: #ffffff; 
  border-color: rgba(255, 215, 0, 0.4);
}

/* Specific styles for achievement messages */
/* These colors should pop more than default, while complementing your palette */
.message-box-critical {
  background-color: rgba(170, 0, 0, 0.8); /* Darker, desaturated red for critical */
  box-shadow: 0 0 10px rgba(170, 0, 0, 0.5); /* Matching glow */
  color: #FFD700; /* Gold text for impact */
  border-color: rgba(255, 215, 0, 0.4);
}

.message-box-damage {
  background-color: rgba(100, 50, 0, 0.8); /* Darker orange-brown for big damage */
  box-shadow: 0 0 10px rgba(100, 50, 0, 0.5);
  color: #FFA500; /* Orange text */
  border-color: rgba(255, 165, 0, 0.4);
}

.message-box-multikill {
  background-color: rgba(50, 0, 100, 0.8); /* Deeper purple for multi-kill */
  box-shadow: 0 0 10px rgba(50, 0, 100, 0.5);
  color: #C37FD7; /* Lighter purple text */
  border-color: rgba(195, 127, 215, 0.4);
}

/* --- Vue Transition Styles (for fade/slide) --- */
.message-fade-slide-enter-active,
.message-fade-slide-leave-active {
  transition: all 0.5s ease-out; /* Slide and fade simultaneously */
}

.message-fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10%); /* Start off-screen to the right */
}

.message-fade-slide-leave-to {
  opacity: 0;
  transform: translateX(10%); /* Exit off-screen to the right */
}

@media (min-width: 1700px) {

  .message-fade-slide-enter-from {
    opacity: 0;
    transform: translateX(50%); /* Start off-screen to the right */
  }

  .message-fade-slide-leave-to {
    opacity: 0;
    transform: translateX(50%); /* Exit off-screen to the right */
  }

}
  


/* Optional: To make old messages slide down as new ones come in */
.message-fade-slide-move {
  transition: transform 0.5s ease-out;
}
</style>